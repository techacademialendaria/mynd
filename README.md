# WhatsApp AI Agent - Método 4C

Um agente de automação para WhatsApp que aplica o Método 4C (Consumir, Capturar, Conectar, Criar) para gerenciar conversas de maneira inteligente.

## Visão Geral

Este projeto implementa um agente de WhatsApp que:

1. **Consumir**: Recebe e processa mensagens do WhatsApp
2. **Capturar**: Armazena mensagens e metadados no MongoDB
3. **Conectar**: Analisa o conteúdo usando IA via Anthropic Claude
4. **Criar**: Gera respostas automáticas inteligentes

## Funcionalidades

- Conexão com WhatsApp via QR Code
- Armazenamento de mensagens no MongoDB
- Análise de sentimento, intenção e palavras-chave das mensagens
- Geração de respostas utilizando IA
- Interface web para controle e gerenciamento

## Tecnologias Utilizadas

- Next.js (React + TypeScript)
- MongoDB (via Mongoose)
- Baileys (API não oficial de WhatsApp)
- Claude/Anthropic AI
- TailwindCSS
- Docker (para MongoDB)

## Requisitos

- Node.js 18+
- Docker e Docker Compose (para MongoDB)
- Chave de API da Anthropic
- Conexão com WhatsApp via celular (para escanear o QR Code)

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   pnpm install
   ```
3. Configure as variáveis de ambiente (crie um arquivo .env.local):
   ```
   MONGODB_URI=mongodb://localhost:27017/whatsapp-agent
   ANTHROPIC_API_KEY=sk_ant_xxxxx
   ```

## Inicialização Rápida (Linux/Mac)

Para simplificar o processo de inicialização, você pode usar o script `start-dev.sh`:

```bash
# Tornar o script executável
chmod +x start-dev.sh

# Executar o script
./start-dev.sh
```

Este script irá:
1. Verificar se o Docker e Docker Compose estão instalados
2. Criar um arquivo `.env.local` se não existir
3. Iniciar o MongoDB via Docker
4. Iniciar o servidor Next.js
5. Fornecer instruções para conectar o WhatsApp

## Utilização com Docker

Este projeto inclui uma configuração Docker para facilitar a execução do MongoDB.

### Iniciar o MongoDB com Docker
```bash
pnpm docker:up
```

### Iniciar a aplicação com o MongoDB
```bash
pnpm dev:with-db
```

### Parar o MongoDB
```bash
pnpm docker:down
```

Para mais detalhes, consulte o arquivo [docker-instructions.md](docker-instructions.md).

## Uso

1. Inicie o MongoDB e a aplicação com `pnpm dev:with-db` ou use o script `./start-dev.sh`
2. Abra http://localhost:3000 no navegador
3. Na interface web, clique em "Conectar WhatsApp"
4. Escaneie o QR code que aparecerá no console/terminal
5. Após a conexão, você verá as mensagens recebidas na interface
6. Você pode:
   - Analisar mensagens com IA
   - Gerar e enviar respostas automáticas
   - Ver análises detalhadas de cada mensagem

## Estrutura do Projeto

```
src/
├── app/               # Rotas do Next.js
│   ├── api/           # API endpoints
│   │   ├── messages/  # API de mensagens
│   │   └── whatsapp/  # API de WhatsApp
│   └── page.tsx       # Interface principal
├── lib/               # Bibliotecas e utilitários
│   ├── db/            # Conexão e modelos do MongoDB
│   │   ├── models/    # Modelos Mongoose
│   │   └── mongodb.ts # Configuração da conexão
│   └── services/      # Serviços do aplicativo
│       ├── ai.ts      # Serviço de IA (Anthropic)
│       └── whatsapp.ts # Serviço de WhatsApp
└── ...
```

## Plano de Desenvolvimento

Este projeto segue o plano 80/20, focando nas funcionalidades principais para entrega do MVP:

1. ✅ Conexão básica com WhatsApp
2. ✅ Armazenamento de mensagens no MongoDB
3. ✅ Análise de mensagens com IA
4. ✅ Geração de respostas automáticas
5. ✅ Interface simples para gerenciamento

## Futuras Melhorias

- Implementar autenticação de usuários
- Adicionar suporte para múltiplas contas de WhatsApp
- Criar modelos de resposta personalizáveis
- Implementar fluxos automatizados de conversação
- Adicionar painéis de análise e métricas
- Melhorar a interface com design responsivo e temas

## Recursos Adicionais

- [Guia Técnico de Referência](docs/whatsapp-ai-agent-reference.md) - Documento detalhado com soluções e exemplos de código
- [Instruções para Docker](docker-instructions.md) - Como configurar e usar Docker com o projeto

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
