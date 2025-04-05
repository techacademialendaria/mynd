import makeWASocket, { 
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  WAMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';
import Message from '../db/models/Message';
import connectToDatabase from '../db/mongodb';

// Verificar se está em ambiente servidor
const isServer = typeof window === 'undefined';

// Garantir que o diretório de autenticação exista
const AUTH_DIR = isServer ? path.join(process.cwd(), 'auth_data') : '';
if (isServer && !fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

class WhatsAppService {
  private client: WASocket | null = null;
  private isConnected: boolean = false;
  private messageHandlers: Array<(message: any) => void> = [];

  // Inicializa a conexão com o WhatsApp
  async connect(): Promise<boolean> {
    // Executar apenas no servidor
    if (!isServer) {
      console.error('WhatsApp service só pode ser inicializado no servidor');
      return false;
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      
      this.client = makeWASocket({
        auth: state,
        printQRInTerminal: true,
      });

      // Gerenciar estado da conexão
      this.client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('Conexão com WhatsApp fechada devido a ', lastDisconnect?.error);
          
          if (shouldReconnect) {
            console.log('Reconectando...');
            this.connect();
          }
          
          this.isConnected = false;
        } else if (connection === 'open') {
          console.log('Conexão com WhatsApp estabelecida!');
          this.isConnected = true;
        }
      });

      // Salvar credenciais quando atualizadas
      this.client.ev.on('creds.update', saveCreds);
      
      // Processar mensagens recebidas
      this.client.ev.on('messages.upsert', async ({ messages }) => {
        for (const message of messages) {
          if (!message.key.fromMe && message.message) {
            await this.processIncomingMessage(message);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao conectar com o WhatsApp:', error);
      return false;
    }
  }

  // Processa mensagens recebidas
  private async processIncomingMessage(message: WAMessage) {
    if (!isServer) return;

    try {
      // Obter informações da mensagem
      const chat = message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid || '';
      const content = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || 
                     message.message?.imageMessage?.caption || 
                     'Mídia sem texto';
      
      if (!chat) return;
      
      // Verificar se é uma mensagem de grupo
      const isGroup = chat.endsWith('@g.us');

      // Conectar ao banco de dados
      await connectToDatabase();
      
      // Extrair informações adicionais
      const messageTimestamp = message.messageTimestamp 
        ? new Date(message.messageTimestamp as number * 1000)
        : new Date();

      const messageType = Object.keys(message.message || {})[0] || 'unknown';
        
      // Salvar mensagem no MongoDB com informações adicionais
      const savedMessage = await Message.create({
        sender,
        content,
        chat,
        processed: false,
        timestamp: messageTimestamp,
        metadata: {
          messageType,
          isGroup,
          messageId: message.key.id,
          // Adicionar mais metadados se necessário
        }
      });
      
      console.log(`Mensagem salva: ${savedMessage._id} - De: ${sender} - Chat: ${chat}`);
      
      // Executar handlers personalizados
      for (const handler of this.messageHandlers) {
        handler(message);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  // Envia uma mensagem de texto
  async sendTextMessage(to: string, text: string): Promise<boolean> {
    if (!isServer) {
      console.error('WhatsApp service só pode ser usado no servidor');
      return false;
    }

    if (!this.client || !this.isConnected) {
      console.error('Cliente WhatsApp não está conectado');
      return false;
    }

    try {
      // Formatar o número do telefone corretamente
      // Certificar-se que está no formato internacional com @s.whatsapp.net
      let formattedNumber = to;
      
      // Remover qualquer caracter não numérico
      formattedNumber = formattedNumber.replace(/\D/g, '');
      
      // Adicionar sufixo @s.whatsapp.net se não estiver presente
      if (!formattedNumber.includes('@')) {
        formattedNumber = `${formattedNumber}@s.whatsapp.net`;
      }
      
      console.log(`Enviando mensagem para: ${formattedNumber}`);
      await this.client.sendMessage(formattedNumber, { text });
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  // Registra um handler para mensagens
  onMessage(handler: (message: any) => void) {
    if (isServer) {
      this.messageHandlers.push(handler);
    }
  }

  // Verifica se está conectado
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Exporta uma instância única do serviço
const whatsappService = new WhatsAppService();
export default whatsappService; 