# Instruções para o Docker com MongoDB

Este projeto utiliza o Docker Compose para facilitar a execução do MongoDB em ambiente de desenvolvimento.

## Pré-requisitos

Certifique-se de ter o Docker e o Docker Compose instalados no seu sistema:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Comandos Disponíveis

Adicionamos scripts específicos no `package.json` para facilitar o gerenciamento dos containers:

### Iniciar o MongoDB

```bash
npm run docker:up
# ou
pnpm docker:up
```

Este comando inicia o container MongoDB em segundo plano. O banco de dados estará acessível na porta 27017.

### Iniciar o servidor de desenvolvimento com MongoDB

```bash
npm run dev:with-db
# ou
pnpm dev:with-db
```

Este comando inicia o MongoDB e em seguida inicia o servidor de desenvolvimento Next.js.

### Visualizar logs do MongoDB

```bash
npm run docker:logs
# ou
pnpm docker:logs
```

### Parar o MongoDB

```bash
npm run docker:down
# ou
pnpm docker:down
```

## Conexão ao MongoDB

O MongoDB estará disponível no seguinte endereço:

```
mongodb://localhost:27017/whatsapp-agent
```

Este é o valor padrão configurado no arquivo `.env.local`.

## Persistência de Dados

Os dados do MongoDB são persistidos em um volume Docker chamado `mongodb_data`. Isso significa que seus dados serão mantidos mesmo depois de parar os containers.

## Problemas Comuns

### Porta 27017 já em uso

Se você encontrar erro indicando que a porta 27017 já está em uso, você pode:

1. Parar o serviço MongoDB existente no seu sistema
2. Modificar a porta no arquivo `docker-compose.yml` para usar uma porta diferente
3. Atualizar o arquivo `.env.local` com a nova configuração de conexão

### Permissões no Linux/MacOS

Se encontrar problemas de permissão ao iniciar o container, pode ser necessário executar os comandos com `sudo`. 