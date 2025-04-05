# Integração com WhatsApp

## Método 4C

Nossa abordagem para integração com WhatsApp segue o modelo 4C:

1. **Consumir**: Receber e processar mensagens do WhatsApp
2. **Capturar**: Armazenar mensagens e dados relevantes
3. **Conectar**: Analisar conteúdo e estabelecer conexões com dados
4. **Criar**: Gerar respostas relevantes 

## Arquitetura

### Componentes Principais

```
┌─────────────┐     ┌───────────────┐     ┌─────────────┐
│ WhatsApp    │────▶│ Banco de Dados│────▶│ Motor de IA │
│ (Baileys)   │◀────│ (MongoDB)     │◀────│ (Anthropic) │
└─────────────┘     └───────────────┘     └─────────────┘
```

- **Serviço WhatsApp**: Responsável pela conexão e comunicação com a API WhatsApp
- **Banco de Dados**: Armazena mensagens, análises e dados do usuário
- **Motor de IA**: Analisa mensagens e gera respostas

## Serviço WhatsApp (Baileys)

### Dependências Necessárias

```bash
pnpm add @whiskeysockets/baileys jimp@0.16.1 sharp@0.32.6 link-preview-js qrcode-terminal @hapi/boom
```

### Configuração Next.js para Bibliotecas Node.js

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

### Inicialização de Conexão

```typescript
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

// Diretório para armazenar credenciais de autenticação
const AUTH_DIR = path.join(process.cwd(), 'auth_data');
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  
  const socket = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    // outras configurações...
  });
  
  // Salvar credenciais quando houver atualização
  socket.ev.on('creds.update', saveCreds);
  
  // Manipular eventos de conexão
  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      // Lógica de reconexão...
    } else if (connection === 'open') {
      console.log('Conexão estabelecida com sucesso!');
    }
  });
  
  // Manipular novas mensagens
  socket.ev.on('messages.upsert', async (m) => {
    if (m.type === 'notify') {
      // Processar mensagens recebidas...
    }
  });
  
  return socket;
}
```

### Formatação de Números

```typescript
function formatPhoneNumber(phoneNumber: string): string {
  // Remover todos os caracteres não numéricos
  let formattedNumber = phoneNumber.replace(/\D/g, '');
  
  // Verificar se já está no formato WhatsApp
  if (!formattedNumber.includes('@')) {
    formattedNumber = `${formattedNumber}@s.whatsapp.net`;
  }
  
  return formattedNumber;
}
```

### Envio de Mensagens

```typescript
async function sendTextMessage(client, to, message) {
  // Verificações preliminares
  if (!client || !client.user) {
    return { success: false, message: 'Cliente não inicializado' };
  }
  
  try {
    const formattedNumber = formatPhoneNumber(to);
    
    await client.sendMessage(formattedNumber, {
      text: message
    });
    
    return { success: true, message: 'Mensagem enviada com sucesso' };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return { success: false, message: error.message };
  }
}
```

## Modelo de Dados

### Estrutura de Mensagem

```typescript
interface Message {
  _id: string;
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
```

## API Routes

### Estrutura de API

```
/api/
├── whatsapp/
│   ├── index.ts     # Status e operações básicas
│   ├── connect.ts   # Iniciar conexão
│   └── send.ts      # Enviar mensagens
├── messages/
│   ├── index.ts     # Listar/buscar mensagens
│   ├── analyze.ts   # Analisar mensagem com IA
│   └── respond.ts   # Gerar resposta automática
└── mongodb/
    └── index.ts     # Verificar status da conexão
```

### Exemplo de API de WhatsApp

```typescript
// api/whatsapp/index.ts
import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppClient } from '@/lib/whatsapp-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const client = getWhatsAppClient();
  const connected = client && client.user;
  
  return NextResponse.json({
    success: true,
    connected,
  });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { action, to, message } = data;
  
  if (action === 'connect') {
    // Lógica para conectar WhatsApp
  } else if (action === 'send' && to && message) {
    // Lógica para enviar mensagem
  }
  
  // Resposta...
}
```

## Boas Práticas

### Verificação de Ambiente

```typescript
// Verificar se está rodando no servidor
const isServer = typeof window === 'undefined';
if (!isServer) {
  console.error('Este código só deve ser executado no servidor');
  return false;
}
```

### Persistência de Sessão

- Armazenar as credenciais em diretório seguro
- Implementar reconexão automática em caso de desconexão
- Manter estatísticas de conexão para monitoramento

### Processamento de Mensagens

1. **Receber**: Capturar todas as mensagens recebidas
2. **Filtrar**: Determinar quais são relevantes (ignorar status, próprias mensagens)
3. **Armazenar**: Salvar no banco de dados
4. **Analisar**: Processamento com IA para classificar intenção
5. **Responder**: Gerar resposta apropriada baseada na análise

### Tratamento de Erros

- Implementar retry com backoff exponencial para operações críticas
- Logging detalhado para diagnóstico
- Notificação de erros críticos
- Validação de entrada para todos os dados externos

## Limitações e Considerações

1. **Política do WhatsApp**: Respeitar os termos de serviço
2. **Taxa de Envio**: Limitar o número de mensagens enviadas por minuto
3. **Segurança**: Não armazenar dados sensíveis ou distribuir conteúdo não autorizado
4. **Consentimento**: Obter permissão explícita antes de enviar mensagens
5. **Privacidade**: Implementar políticas claras sobre armazenamento e uso de dados

## Melhorias Futuras

- Sistema de filas para processamento assíncrono de mensagens
- Suporte para múltiplas contas WhatsApp
- Implementação de webhooks para integração com outros sistemas
- Análise avançada de sentimento e intenção usando modelos específicos
- Templates personalizáveis para respostas automáticas 