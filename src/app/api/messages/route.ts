import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Message from '@/lib/db/models/Message';
import aiService from '@/lib/services/ai';
import whatsappService from '@/lib/services/whatsapp';

// Configuração para garantir que a API seja executada apenas no servidor
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rota para obter mensagens
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Obter parâmetros da URL
    const { searchParams } = new URL(req.url);
    const chat = searchParams.get('chat');
    const limit = searchParams.get('limit') || '20';
    const page = searchParams.get('page') || '1';
    
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;
    
    // Construir query
    const query: any = {};
    if (chat) query.chat = chat;
    
    // Buscar mensagens
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Contar total para paginação
    const total = await Message.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Rota para processar mensagens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messageId, to, message } = body;

    await connectToDatabase();
    
    // Analisar mensagem com IA
    if (action === 'analyze' && messageId) {
      const success = await aiService.analyzeMessage(messageId);
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Mensagem analisada com sucesso' 
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Falha ao analisar mensagem' },
          { status: 500 }
        );
      }
    }
    
    // Gerar resposta automática
    if (action === 'generateResponse' && messageId) {
      const response = await aiService.generateResponse(messageId);
      
      if (response) {
        return NextResponse.json({ 
          success: true, 
          data: { response }
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Falha ao gerar resposta' },
          { status: 500 }
        );
      }
    }
    
    // Gerar e enviar resposta
    if (action === 'respondToMessage' && messageId) {
      // Primeiro gerar resposta
      const generatedResponse = await aiService.generateResponse(messageId);
      
      if (!generatedResponse) {
        return NextResponse.json(
          { success: false, message: 'Falha ao gerar resposta' },
          { status: 500 }
        );
      }
      
      // Buscar mensagem para obter o chat
      const messageDoc = await Message.findById(messageId);
      if (!messageDoc) {
        return NextResponse.json(
          { success: false, message: 'Mensagem não encontrada' },
          { status: 404 }
        );
      }
      
      // Enviar a resposta gerada pelo WhatsApp
      const success = await whatsappService.sendTextMessage(
        messageDoc.chat, 
        generatedResponse
      );
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Resposta enviada com sucesso',
          data: { response: generatedResponse }
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Falha ao enviar resposta' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'Ação desconhecida ou parâmetros inválidos' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro na API de mensagens:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 