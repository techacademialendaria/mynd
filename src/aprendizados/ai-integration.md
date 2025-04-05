# Integração com IA

## Arquitetura de IA no Projeto

Nossa integração com IA no projeto WhatsApp AI Agent utiliza o modelo Claude da Anthropic para análise e geração de conteúdo, seguindo os princípios do Método 4C.

```
┌─────────────────┐     ┌────────────────┐     ┌───────────────────┐
│ Dados de Entrada│────▶│ Processamento  │────▶│ Resposta Gerada   │
│ (Mensagens)     │     │ (Modelo Claude)│     │ (Personalizada)   │
└─────────────────┘     └────────────────┘     └───────────────────┘
```

## Fluxo de Análise de Mensagens

1. **Recebimento**: Captura da mensagem do usuário via WhatsApp
2. **Pré-processamento**: Limpeza e preparação do texto
3. **Análise**: Envio para o modelo Claude para extração de:
   - Intenção principal
   - Sentimento
   - Palavras-chave
   - Resumo
4. **Armazenamento**: Persistência da análise no banco de dados
5. **Visualização**: Exibição dos resultados na interface

## Fluxo de Geração de Respostas

1. **Contexto**: Recuperação da mensagem original e histórico relevante
2. **Prompt**: Construção de prompt estruturado com contexto
3. **Geração**: Envio do prompt para o modelo Claude
4. **Pós-processamento**: Formatação e validação da resposta
5. **Envio**: Entrega da resposta via WhatsApp

## Implementação API Anthropic

### Configuração

```typescript
// lib/ai-service.ts
import Anthropic from '@anthropic-ai/sdk';

// Inicialização do cliente Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Verificação da configuração
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('API key da Anthropic não configurada!');
}
```

### Análise de Mensagem

```typescript
async function analyzeMessage(messageContent: string) {
  try {
    const prompt = `
      <context>
      Você é um assistente especializado em análise de mensagens. Por favor, analise a seguinte mensagem e forneça:
      1. Intenção principal
      2. Sentimento (positivo, negativo, neutro)
      3. Palavras-chave (máximo 5)
      4. Um breve resumo (máximo 2 frases)
      </context>
      
      Mensagem: "${messageContent}"
      
      Formato da resposta:
      {
        "intent": "intenção principal",
        "sentiment": "sentimento",
        "keywords": ["palavra1", "palavra2", "palavra3"],
        "summary": "resumo breve"
      }
    `;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: "Você é um assistente especializado em análise de texto. Responda apenas no formato JSON solicitado.",
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    // Extrair a resposta JSON
    const content = response.content[0].text;
    const analysis = JSON.parse(content);
    
    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Erro na análise de mensagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Geração de Resposta

```typescript
async function generateResponse(messageContent: string, messageHistory: any[] = [], userProfile: any = {}) {
  try {
    // Construir o histórico de conversas
    const conversationHistory = messageHistory
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n');
    
    // Construir informações do perfil
    const profileInfo = userProfile?.name 
      ? `Informações do contato: ${userProfile.name} (${userProfile.additionalInfo || 'Sem informações adicionais'})`
      : 'Sem informações de perfil disponíveis';
    
    const prompt = `
      <context>
      Você é um assistente virtual do WhatsApp. Você deve responder de forma útil, concisa e personalizada.
      
      Histórico da conversa:
      ${conversationHistory}
      
      ${profileInfo}
      
      Última mensagem recebida: "${messageContent}"
      </context>
      
      Por favor, gere uma resposta adequada para esta mensagem.
    `;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      system: "Você é um assistente virtual amigável e prestativo que representa uma empresa. Mantenha respostas concisas, informativas e personalizadas.",
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    return {
      success: true,
      response: response.content[0].text
    };
  } catch (error) {
    console.error('Erro na geração de resposta:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

## API Routes para Integração com IA

### Análise de Mensagem

```typescript
// api/messages/analyze.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeMessage } from '@/lib/ai-service';
import { updateMessageAnalysis } from '@/lib/db-service';

export async function POST(req: NextRequest) {
  try {
    const { messageId } = await req.json();
    
    // Obter mensagem do banco de dados
    const message = await getMessageById(messageId);
    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Mensagem não encontrada'
      }, { status: 404 });
    }
    
    // Analisar mensagem com IA
    const analysis = await analyzeMessage(message.content);
    if (!analysis.success) {
      return NextResponse.json({
        success: false,
        message: 'Falha na análise da mensagem'
      }, { status: 500 });
    }
    
    // Atualizar mensagem com análise
    await updateMessageAnalysis(messageId, analysis.data);
    
    return NextResponse.json({
      success: true,
      data: analysis.data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
```

### Resposta Automática

```typescript
// api/messages/respond.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/ai-service';
import { sendTextMessage } from '@/lib/whatsapp-service';

export async function POST(req: NextRequest) {
  try {
    const { messageId } = await req.json();
    
    // Obter mensagem e contexto
    const message = await getMessageById(messageId);
    const messageHistory = await getMessageHistory(message.chat, 5);
    const userProfile = await getUserProfile(message.sender);
    
    // Gerar resposta com IA
    const responseData = await generateResponse(
      message.content,
      messageHistory,
      userProfile
    );
    
    if (!responseData.success) {
      return NextResponse.json({
        success: false,
        message: 'Falha ao gerar resposta'
      }, { status: 500 });
    }
    
    // Enviar resposta via WhatsApp
    const whatsappClient = getWhatsAppClient();
    await sendTextMessage(
      whatsappClient,
      message.sender,
      responseData.response
    );
    
    return NextResponse.json({
      success: true,
      data: {
        response: responseData.response
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
```

## Boas Práticas

### Prompts Eficientes

1. **Estruturação clara**: Divida o prompt em seções bem definidas
2. **Contexto relevante**: Forneça apenas o contexto necessário
3. **Instruções precisas**: Seja específico sobre o resultado esperado
4. **Formato de saída**: Defina claramente o formato da resposta
5. **One-shot ou Few-shot**: Inclua exemplos quando necessário

### Tratamento de Erros

```typescript
try {
  // Chamada para API de IA
} catch (error) {
  if (error.status === 429) {
    // Tratamento de limite de taxa
    await delay(1000);
    return retry(params);
  } else if (error.status >= 500) {
    // Erro de servidor
    console.error('Erro no servidor Anthropic:', error);
  } else {
    // Outros erros
    console.error('Erro na chamada de IA:', error);
  }
  return { success: false, error: error.message };
}
```

### Gestão de Tokens

- Monitorar o consumo de tokens
- Trunkar histórico de conversas longas
- Usar o modelo mais eficiente para cada tarefa
- Implementar cache para análises comuns

## Modelos e Casos de Uso

| Modelo | Caso de Uso | Características |
|--------|-------------|----------------|
| claude-3-haiku | Análise de mensagens | Rápido, econômico, bom para classificação |
| claude-3-sonnet | Uso geral | Bom equilíbrio entre qualidade e custo |
| claude-3-opus | Respostas complexas | Alta qualidade, melhor raciocínio, mais caro |

## Recomendações para Escala

1. **Sistema de Filas**: Implementar processamento assíncrono para picos de demanda
2. **Caching**: Armazenar análises comuns para reutilização
3. **Rate Limiting**: Controlar o número de chamadas de API
4. **Monitoramento**: Acompanhar uso, custos e qualidade das respostas
5. **Feedback Loop**: Coletar feedback dos usuários para melhorar prompts 