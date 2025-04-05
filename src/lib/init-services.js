// Este arquivo é executado apenas no lado do servidor
// e inicializa serviços que precisam estar rodando constantemente

import whatsappService from './services/whatsapp';

// Função para inicializar serviços apenas em ambiente de produção
async function initializeServices() {
  // Verificar se estamos em ambiente de produção
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🚀 Inicializando serviços...');
      
      // Iniciar serviço do WhatsApp
      const whatsappConnected = await whatsappService.connect();
      console.log(`📱 WhatsApp: ${whatsappConnected ? 'Conectado' : 'Falha ao conectar'}`);
      
      if (whatsappConnected) {
        console.log('🔍 Escaneie o QR code no console para conectar o WhatsApp');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar serviços:', error);
    }
  } else {
    console.log('🔧 Ambiente de desenvolvimento: serviços não inicializados automaticamente');
    console.log('🔧 Use a interface web para iniciar o WhatsApp');
  }
}

// Inicializar serviços
initializeServices(); 