import { NextRequest, NextResponse } from 'next/server';
import whatsappService from '@/lib/services/whatsapp';

// Configuração para garantir que a API seja executada apenas no servidor
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rota para iniciar a conexão do WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'connect') {
      const success = await whatsappService.connect();
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Conexão com WhatsApp iniciada. Verifique o console para QR code.' 
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Falha ao conectar com WhatsApp' },
          { status: 500 }
        );
      }
    }
    
    if (action === 'status') {
      const isConnected = whatsappService.getConnectionStatus();
      
      return NextResponse.json({ 
        success: true, 
        connected: isConnected,
        message: isConnected ? 'WhatsApp conectado' : 'WhatsApp desconectado' 
      });
    }
    
    if (action === 'send') {
      const { to, message } = body;
      
      if (!to || !message) {
        return NextResponse.json(
          { success: false, message: 'Parâmetros "to" e "message" são obrigatórios' },
          { status: 400 }
        );
      }
      
      const success = await whatsappService.sendTextMessage(to, message);
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Mensagem enviada com sucesso' 
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Falha ao enviar mensagem' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'Ação desconhecida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro na API de WhatsApp:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Rota para obter status
export async function GET() {
  const isConnected = whatsappService.getConnectionStatus();
  
  return NextResponse.json({ 
    success: true, 
    connected: isConnected,
    message: isConnected ? 'WhatsApp conectado' : 'WhatsApp desconectado' 
  });
} 