import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';

// Configuração para garantir que a API seja executada apenas no servidor
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rota para verificar o status do MongoDB
export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        connected: true,
        message: 'MongoDB conectado com sucesso' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        connected: false,
        message: 'MongoDB desconectado' 
      }, { status: 503 }); // Status 503 = Service Unavailable
    }
  } catch (error) {
    console.error('Erro ao verificar conexão MongoDB:', error);
    return NextResponse.json({ 
      success: false, 
      connected: false,
      message: 'Erro ao verificar conexão com MongoDB' 
    }, { status: 500 });
  }
} 