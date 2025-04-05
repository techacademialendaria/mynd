# WhatsApp AI Agent - Método 4C: Guia Técnico de Referência

Este documento serve como referência técnica para o desenvolvimento do WhatsApp AI Agent usando o Método 4C (Consumir, Capturar, Conectar, Criar). Contém detalhes de implementação, soluções para problemas comuns e padrões recomendados.

## Introdução ao Método 4C

O Método 4C é uma abordagem estruturada para processamento de mensagens e interações:

1. **Consumir**: Receber e processar mensagens do WhatsApp.
2. **Capturar**: Armazenar mensagens e metadados no banco de dados.
3. **Conectar**: Analisar o conteúdo usando técnicas de IA.
4. **Criar**: Gerar respostas automáticas inteligentes.

## Implementação Técnica

### 1. Serviço WhatsApp (Baileys)

#### Configuração e Inicialização

```javascript
import makeWASocket, { 
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  WAMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';

// Verificar ambiente servidor
const isServer = typeof window === 'undefined';

// Diretório para autenticação
const AUTH_DIR = isServer ? path.join(process.cwd(), 'auth_data') : '';
if (isServer && !fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

class WhatsAppService {
  private client: WASocket | null = null;
  private isConnected: boolean = false;
  
  async connect(): Promise<boolean> {
    if (!isServer) return false;
    
    try {
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      
      this.client = makeWASocket({
        auth: state,
        printQRInTerminal: true,
      });

      // Gerenciar conexão
      this.client.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) this.connect();
          this.isConnected = false;
        } else if (connection === 'open') {
          this.isConnected = true;
        }
      });

      // Salvar credenciais
      this.client.ev.on('creds.update', saveCreds);
      
      // Configurar processamento de mensagens
      this.client.ev.on('messages.upsert', async ({ messages }) => {
        for (const message of messages) {
          if (!message.key.fromMe && message.message) {
            await this.processIncomingMessage(message);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao conectar com WhatsApp:', error);
      return false;
    }
  }
}
```

#### Processamento de Mensagens

```javascript
private async processIncomingMessage(message: WAMessage) {
  if (!isServer) return;

  try {
    const chat = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid || '';
    const content = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    message.message?.imageMessage?.caption || 
                    'Mídia sem texto';
    
    if (!chat) return;
    
    // Verificar se é mensagem de grupo
    const isGroup = chat.endsWith('@g.us');

    // Extrair informações adicionais
    const messageTimestamp = message.messageTimestamp 
      ? new Date(message.messageTimestamp as number * 1000)
      : new Date();

    const messageType = Object.keys(message.message || {})[0] || 'unknown';
      
    // Salvar mensagem no MongoDB
    await Message.create({
      sender,
      content,
      chat,
      processed: false,
      timestamp: messageTimestamp,
      metadata: {
        messageType,
        isGroup,
        messageId: message.key.id,
      }
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
}
```

#### Envio de Mensagens

```javascript
async sendTextMessage(to: string, text: string): Promise<boolean> {
  if (!isServer) return false;
  if (!this.client || !this.isConnected) return false;

  try {
    // Formatar número corretamente
    let formattedNumber = to;
    
    // Remover caracteres não numéricos
    formattedNumber = formattedNumber.replace(/\D/g, '');
    
    // Adicionar sufixo se não estiver presente
    if (!formattedNumber.includes('@')) {
      formattedNumber = `${formattedNumber}@s.whatsapp.net`;
    }
    
    await this.client.sendMessage(formattedNumber, { text });
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return false;
  }
}
```

### 2. Conexão com MongoDB

#### Configuração da Conexão

```javascript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-agent';

// Simplifica a conexão para o MVP
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return mongoose;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB conectado com sucesso');
    return mongoose;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase;
```

#### Modelo de Mensagem

```javascript
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  content: string;
  timestamp: Date;
  chat: string;
  mediaUrl?: string;
  processed: boolean;
  aiAnalysis?: {
    intent?: string;
    sentiment?: string;
    keywords?: string[];
    summary?: string;
  };
  metadata?: Record<string, any>;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chat: { type: String, required: true },
  mediaUrl: { type: String },
  processed: { type: Boolean, default: false },
  aiAnalysis: {
    intent: String,
    sentiment: String,
    keywords: [String],
    summary: String
  },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.models.Message || 
  mongoose.model<IMessage>('Message', MessageSchema);
```

### 3. Serviço de IA (Anthropic Claude)

```javascript
import Anthropic from '@anthropic-ai/sdk';
import Message from '../db/models/Message';

// Verificar ambiente servidor
const isServer = typeof window === 'undefined';

// Inicializar cliente apenas no servidor
const anthropic = isServer 
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
  : null;

class AIService {
  async analyzeMessage(messageId: string): Promise<boolean> {
    if (!isServer) return false;
    
    try {
      // Buscar a mensagem
      const message = await Message.findById(messageId);
      if (!message || message.processed) return true;
      
      // Preparar prompt
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
      
      if (!anthropic) throw new Error('Cliente Anthropic não inicializado');
      
      // Chamar a API
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: 'Você é um assistente especializado em analisar mensagens de texto',
        messages: [{ role: 'user', content: prompt }]
      });
      
      // Extrair JSON da resposta
      const responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let analysisResult;
      
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = {
          intent: 'desconhecido',
          sentiment: 'neutro',
          keywords: [],
          summary: 'Não foi possível analisar a mensagem'
        };
      }
      
      // Atualizar a mensagem
      message.aiAnalysis = analysisResult;
      message.processed = true;
      await message.save();
      
      return true;
    } catch (error) {
      console.error('Erro ao analisar mensagem:', error);
      return false;
    }
  }
}
```

### 4. API Routes no Next.js

#### Endpoint de WhatsApp

```javascript
// src/app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import whatsappService from '@/lib/services/whatsapp';

// Garantir execução no servidor
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { action, to, message } = await req.json();

    if (action === 'connect') {
      const success = await whatsappService.connect();
      return NextResponse.json({ 
        success, 
        message: success 
          ? 'Conexão iniciada. Verifique o console para QR code.' 
          : 'Falha ao conectar' 
      });
    }
    
    if (action === 'send') {
      if (!to || !message) {
        return NextResponse.json(
          { success: false, message: 'Parâmetros incompletos' },
          { status: 400 }
        );
      }
      
      const success = await whatsappService.sendTextMessage(to, message);
      return NextResponse.json({ 
        success, 
        message: success ? 'Mensagem enviada' : 'Falha ao enviar' 
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Ação desconhecida' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

#### Endpoint de Mensagens

```javascript
// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Message from '@/lib/db/models/Message';
import aiService from '@/lib/services/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const chat = searchParams.get('chat');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Construir query
    const query: any = {};
    if (chat) query.chat = chat;
    
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Message.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

### 5. Interface React

```jsx
'use client';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [messageText, setMessageText] = useState('');
  
  // Buscar status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Iniciar WhatsApp
  const connectWhatsApp = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      });
      
      const data = await response.json();
      alert(data.message);
      fetchStatus();
    } catch (error) {
      console.error('Erro ao conectar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensagem
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!recipient || !messageText) {
      alert('Preencha todos os campos');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send',
          to: recipient,
          message: messageText
        }),
      });
      
      const data = await response.json();
      alert(data.message);
      
      if (data.success) {
        setMessageText('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderização
  return (
    <main>
      <h1>WhatsApp AI Agent</h1>
      
      <div>
        <div>
          <div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          <button onClick={connectWhatsApp} disabled={isLoading}>
            {isLoading ? 'Processando...' : 'Conectar WhatsApp'}
          </button>
        </div>
        
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Número (ex: 5511999999999)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="text"
            placeholder="Mensagem"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button type="submit" disabled={isLoading || !isConnected}>
            Enviar
          </button>
        </form>
      </div>
      
      {/* Exibição de mensagens */}
    </main>
  );
}
```

## Soluções para Problemas Comuns

### 1. Erros de Inicialização do Baileys

Os erros mais comuns são relacionados às dependências nativas:

```
Module not found: Can't resolve 'jimp'
Module not found: Can't resolve 'qrcode-terminal'
Module not found: Can't resolve 'link-preview-js'
```

**Solução**: Instalar as dependências explicitamente, com versões específicas para compatibilidade:

```bash
pnpm add jimp@0.16.1 sharp@0.32.6 link-preview-js qrcode-terminal @hapi/boom
```

### 2. Erros de MongoDB

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solução**: Iniciar o MongoDB com Docker:

```bash
docker run -d --name whatsapp-mongodb -p 27017:27017 mongo:latest
```

### 3. Erros de Formato de Número

```
TypeError: Cannot destructure property 'user' of '(0, WABinary_1.jidDecode)(...)' as it is undefined.
```

**Solução**: Formatar o número adequadamente:

```javascript
// Exemplo de formatação de número
let formattedNumber = to.replace(/\D/g, '');
if (!formattedNumber.includes('@')) {
  formattedNumber = `${formattedNumber}@s.whatsapp.net`;
}
```

### 4. Problemas de Autenticação do WhatsApp

- **Problema**: QR code não aparece ou sessão não persiste
- **Solução**: Verificar a pasta auth_data e permissões de escrita

```javascript
// Verificar e criar diretório de autenticação
const AUTH_DIR = path.join(process.cwd(), 'auth_data');
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}
```

Se necessário, limpar a sessão:

```bash
rm -rf auth_data
```

### 5. Execução de Código no Cliente

```
ReferenceError: fs is not defined
```

**Solução**: Usar checagem de ambiente:

```javascript
// Verificar ambiente
const isServer = typeof window === 'undefined';
if (!isServer) {
  return null; // Ou algum outro comportamento seguro no cliente
}

// Código que usa APIs do Node.js
const fs = require('fs');
```

## Configurações Recomendadas

### 1. Next.js Config

```javascript
// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, path: false, os: false, crypto: false,
        stream: false, http: false, https: false, zlib: false,
        net: false, tls: false, child_process: false,
      };
    }
    return config;
  },
  serverExternalPackages: [
    '@whiskeysockets/baileys', 'sharp', 'jimp',
    'qrcode-terminal', 'link-preview-js',
  ],
  experimental: {
    serverActions: true,
  },
};
```

### 2. Ambiente Produção vs Desenvolvimento

```javascript
// Inicialização condicional
if (process.env.NODE_ENV === 'production') {
  // Inicializar WhatsApp automaticamente
  whatsappService.connect();
} else {
  // Em desenvolvimento, conectar manualmente via interface
  console.log('Ambiente de desenvolvimento: use a interface para conectar');
}
```

## Métricas e Monitoramento

Para monitorar o sistema em produção, considere rastrear:

1. **Taxa de mensagens**: Volume de mensagens recebidas/enviadas por minuto
2. **Tempo de processamento**: Quanto tempo leva para processar cada mensagem
3. **Taxa de sucesso**: Porcentagem de mensagens processadas com sucesso
4. **Erros**: Tipos e frequência de erros
5. **Uso de recursos**: Memória, CPU, chamadas de API

## Referências Adicionais

- [Documentação do Baileys](https://github.com/WhiskeySockets/Baileys)
- [Documentação Mongoose](https://mongoosejs.com/docs/guide.html)
- [API Anthropic Claude](https://docs.anthropic.com/claude/reference/messages_post)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) 