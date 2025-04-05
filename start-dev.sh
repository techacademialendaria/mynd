#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== WhatsApp AI Agent - Iniciando ambiente de desenvolvimento ===${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não encontrado. Por favor, instale o Docker primeiro:${NC}"
    echo -e "https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro:${NC}"
    echo -e "https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar se o arquivo .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Arquivo .env.local não encontrado. Criando um arquivo padrão...${NC}"
    cat > .env.local << EOF
# Configurações do MongoDB
MONGODB_URI=mongodb://localhost:27017/whatsapp-agent

# Chaves de APIs de IA (substitua pelos valores reais)
ANTHROPIC_API_KEY=seu_api_key_aqui

# Configurações do WhatsApp
# As credenciais serão salvas automaticamente na pasta auth_data
EOF
    echo -e "${GREEN}Arquivo .env.local criado. Por favor, edite-o para adicionar suas chaves de API.${NC}"
fi

# Verificar se existem containers antigos e removê-los
echo -e "${YELLOW}Parando containers existentes...${NC}"
docker-compose down 2>/dev/null

# Iniciar o MongoDB
echo -e "${YELLOW}Iniciando MongoDB...${NC}"
docker-compose up -d

# Verificar se o MongoDB iniciou com sucesso
if [ $? -eq 0 ]; then
    echo -e "${GREEN}MongoDB iniciado com sucesso!${NC}"
else
    echo -e "${RED}Falha ao iniciar o MongoDB. Verifique os logs:${NC}"
    docker-compose logs
    exit 1
fi

# Aguardar alguns segundos para o MongoDB inicializar completamente
echo -e "${YELLOW}Aguardando MongoDB inicializar...${NC}"
sleep 5

# Iniciar o servidor Next.js
echo -e "${GREEN}Iniciando servidor Next.js...${NC}"
echo -e "${YELLOW}Para escanear o QR code do WhatsApp, use o botão 'Conectar WhatsApp' na interface web.${NC}"
echo -e "${YELLOW}O QR code aparecerá no terminal. Escaneie-o com seu celular.${NC}"
echo -e "${YELLOW}CTRL+C para encerrar o servidor.${NC}"

# Executar o servidor Next.js
if command -v pnpm &> /dev/null; then
    pnpm dev
elif command -v npm &> /dev/null; then
    npm run dev
else
    echo -e "${RED}Nem pnpm nem npm encontrados. Por favor, instale o pnpm ou npm primeiro.${NC}"
    exit 1
fi

# Este código só é executado quando o servidor Next.js é encerrado
echo -e "${YELLOW}Encerrando servidor Next.js...${NC}"

# Perguntar se deve desligar o MongoDB também
read -p "Deseja parar o MongoDB também? (s/N): " resposta
if [[ "$resposta" =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Parando MongoDB...${NC}"
    docker-compose down
    echo -e "${GREEN}MongoDB encerrado. Bye!${NC}"
else
    echo -e "${GREEN}MongoDB continua em execução. Você pode pará-lo com 'docker-compose down' ou 'pnpm docker:down'.${NC}"
fi

exit 0 