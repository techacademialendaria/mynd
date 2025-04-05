#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== WhatsApp AI Agent - Iniciando MongoDB ===${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não encontrado. Por favor, instale o Docker primeiro:${NC}"
    echo -e "https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar o status do MongoDB
CONTAINER_NAME="whatsapp-agent-mongodb"
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${GREEN}MongoDB já está em execução!${NC}"
else
    # Se o container existe mas está parado
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        echo -e "${YELLOW}Iniciando container MongoDB existente...${NC}"
        docker start $CONTAINER_NAME
    else
        echo -e "${YELLOW}Criando e iniciando o MongoDB...${NC}"
        # Usando comando docker run diretamente sem docker-compose
        docker run -d \
            --name $CONTAINER_NAME \
            -p 27017:27017 \
            -v mongodb_data:/data/db \
            -e MONGO_INITDB_DATABASE=whatsapp-agent \
            --restart unless-stopped \
            mongo:latest
    fi
    
    # Verificar se iniciou com sucesso
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}MongoDB iniciado com sucesso!${NC}"
    else
        echo -e "${RED}Falha ao iniciar MongoDB!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}MongoDB está disponível em: mongodb://localhost:27017/whatsapp-agent${NC}"
echo -e "${YELLOW}Execute 'docker stop $CONTAINER_NAME' para parar o MongoDB quando terminar.${NC}" 