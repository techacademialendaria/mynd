import Anthropic from '@anthropic-ai/sdk';
import Message from '../db/models/Message';
import connectToDatabase from '../db/mongodb';

// Verificar se está em ambiente servidor
const isServer = typeof window === 'undefined';

// Inicializar cliente Anthropic apenas no servidor
const anthropic = isServer 
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
  : null;

class AIService {
  // Analisa a mensagem e extrai insights
  async analyzeMessage(messageId: string): Promise<boolean> {
    if (!isServer) {
      console.error('Serviço de IA só pode ser usado no servidor');
      return false;
    }
    
    try {
      // Conectar ao banco de dados
      await connectToDatabase();
      
      // Buscar a mensagem pelo ID
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error(`Mensagem não encontrada: ${messageId}`);
      }
      
      // Se já foi processada, ignorar
      if (message.processed) {
        return true;
      }
      
      // Preparar prompt para o Anthropic
      const prompt = `
        Analise a seguinte mensagem de WhatsApp e extraia as informações:
        
        Mensagem: "${message.content}"
        
        Forneça as seguintes informações:
        1. Intenção principal (pergunta, pedido, reclamação, elogio, informação)
        2. Sentimento (positivo, negativo, neutro)
        3. Palavras-chave principais (até 5)
        4. Resumo conciso da mensagem
        
        Responda em formato JSON com os campos: intent, sentiment, keywords, summary.
      `;
      
      if (!anthropic) {
        throw new Error('Cliente Anthropic não inicializado');
      }
      
      // Chamar a API do Anthropic
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: 'Você é um assistente especializado em analisar mensagens de texto e extrair informações relevantes em formato JSON.',
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      // Extrair resultado JSON da resposta
      let analysisResult;
      try {
        // Garantir que estamos acessando o texto corretamente
        const responseText = response.content[0].type === 'text' 
          ? response.content[0].text 
          : '';
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Resposta não contém JSON válido');
        }
      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        analysisResult = {
          intent: 'desconhecido',
          sentiment: 'neutro',
          keywords: [],
          summary: 'Não foi possível analisar a mensagem'
        };
      }
      
      // Atualizar a mensagem com a análise
      message.aiAnalysis = analysisResult;
      message.processed = true;
      await message.save();
      
      console.log(`Mensagem ${messageId} analisada com sucesso`);
      return true;
    } catch (error) {
      console.error('Erro ao analisar mensagem:', error);
      return false;
    }
  }
  
  // Gera uma resposta para a mensagem
  async generateResponse(messageId: string): Promise<string | null> {
    if (!isServer) {
      console.error('Serviço de IA só pode ser usado no servidor');
      return null;
    }
    
    try {
      // Conectar ao banco de dados
      await connectToDatabase();
      
      // Buscar a mensagem pelo ID
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error(`Mensagem não encontrada: ${messageId}`);
      }
      
      // Preparar histórico de contexto (últimas 5 mensagens do mesmo chat)
      const chatHistory = await Message.find({ 
        chat: message.chat 
      })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();
      
      // Inverter para ordem cronológica
      chatHistory.reverse();
      
      // Construir o prompt com contexto
      const contextPrompt = chatHistory.map(msg => 
        `${msg.sender.includes('@s.whatsapp.net') ? 'Cliente' : 'Assistente'}: ${msg.content}`
      ).join('\n');
      
      const prompt = `
        Contexto da conversa:
        ${contextPrompt}
        
        Análise da última mensagem:
        ${JSON.stringify(message.aiAnalysis || {})}
        
        Por favor, gere uma resposta apropriada para a última mensagem do cliente que seja:
        - Profissional e cordial
        - Direta e objetiva
        - Relevante ao contexto e intenção detectada
        
        Responda apenas com o texto da resposta, sem nenhuma formatação adicional.
      `;
      
      if (!anthropic) {
        throw new Error('Cliente Anthropic não inicializado');
      }
      
      // Chamar a API do Anthropic
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: 'Você é um assistente profissional respondendo a mensagens de WhatsApp de clientes. Forneça respostas diretas e úteis.',
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      // Garantir que estamos acessando o texto corretamente
      const generatedResponse = response.content[0].type === 'text' 
        ? response.content[0].text.trim() 
        : 'Não foi possível gerar uma resposta.';
      
      return generatedResponse;
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return null;
    }
  }
}

// Exporta uma instância única do serviço
const aiService = new AIService();
export default aiService; 