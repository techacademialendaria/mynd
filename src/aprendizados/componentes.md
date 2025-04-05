# Arquitetura de Componentes

## Organização de Diretórios

```
src/
├── components/
│   ├── layout/       # Componentes estruturais de layout
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ui/           # Componentes de interface reutilizáveis
│   │   ├── StatusCard.tsx
│   │   ├── MessageCard.tsx
│   │   ├── SendMessageForm.tsx
│   │   ├── Pagination.tsx
│   │   └── ...
│   └── ...
```

## Princípios de Componentização

1. **Separação de Responsabilidades**: Cada componente deve ter uma única responsabilidade bem definida
2. **Componentes Puros**: Preferir componentes puros que dependem apenas de suas props
3. **Composição sobre Herança**: Construir componentes complexos pela composição de componentes menores
4. **Desacoplamento**: Evitar dependências diretas entre componentes
5. **Interface Explícita**: Props bem tipadas e documentadas

## Estrutura Padrão de Componentes

```typescript
import React from 'react';

// Definição de interface para props
interface ComponentProps {
  // Propriedades obrigatórias
  requiredProp: string;
  // Propriedades opcionais
  optionalProp?: number;
  // Callbacks
  onAction?: (param: any) => void;
}

// Componente funcional com TypeScript
export default function Component({
  requiredProp,
  optionalProp = defaultValue,
  onAction
}: ComponentProps) {
  // Lógica do componente
  
  return (
    <div className="...">
      {/* Conteúdo do componente */}
    </div>
  );
}
```

## Componentes de Layout

### Sidebar
- **Propósito**: Navegação principal da aplicação
- **Características**:
  - Menu de navegação com ícones
  - Indicadores visuais de contagem
  - Destaque para item ativo
  - Perfil de usuário

### Header
- **Propósito**: Cabeçalho da página com título e ações principais
- **Características**:
  - Título da página
  - Descrição contextual
  - Campo de busca
  - Botões de ação primária

## Componentes de UI

### StatusCard
- **Propósito**: Exibir status de conexão de serviços
- **Props**:
  - `isWhatsAppConnected`: Estado de conexão do WhatsApp
  - `isMongoConnected`: Estado de conexão do MongoDB
  - `onConnectWhatsApp`: Callback para iniciar conexão
  - `isLoading`: Estado de carregamento

### SendMessageForm
- **Propósito**: Formulário para envio de mensagens
- **Props**:
  - `onSendMessage`: Callback para enviar mensagem
  - `isConnected`: Estado de conexão (habilita/desabilita o formulário)
  - `isLoading`: Estado de carregamento

### MessageCard
- **Propósito**: Exibir detalhes de uma mensagem recebida
- **Props**:
  - `message`: Objeto contendo dados da mensagem
  - `onAnalyze`: Callback para analisar mensagem
  - `onRespond`: Callback para responder mensagem
  - `isLoading`: Estado de carregamento

### Pagination
- **Propósito**: Navegação entre páginas de resultados
- **Props**:
  - `currentPage`: Página atual
  - `totalPages`: Total de páginas
  - `onPageChange`: Callback para mudar de página
  - `isLoading`: Estado de carregamento

## Padrões de Estado

### Estados Locais
Utilizamos `useState` para:
- Estados de formulário
- Estados de UI temporários
- Interações que não afetam outros componentes

```typescript
const [isOpen, setIsOpen] = useState(false);
const [inputValue, setInputValue] = useState('');
```

### Estados Globais
Para estados que precisam ser compartilhados entre múltiplos componentes, poderíamos utilizar:
- Context API
- Redux
- Zustand

## Padrões de Estilização

Utilizamos CSS-in-JS via Tailwind CSS com variáveis CSS personalizadas:

```tsx
<div className="bg-[var(--card-bg)] rounded-lg p-4">
  <h2 className="text-lg font-semibold">Título</h2>
  <p className="text-[var(--color-surface-7)] text-sm">Descrição secundária</p>
</div>
```

### Vantagens:
- Estilização inline sem arquivos CSS separados
- Acesso às variáveis CSS do design system
- Facilidade de manutenção e consistência

## Padrões de Comunicação

### Comunicação Pai-Filho
Via props e callbacks:

```typescript
// Componente pai
const handleAction = (id: string) => {
  // Lógica aqui
};

<ChildComponent 
  data={someData}
  onAction={handleAction}
/>

// Componente filho
interface ChildProps {
  data: any;
  onAction: (id: string) => void;
}

function ChildComponent({ data, onAction }: ChildProps) {
  return (
    <button onClick={() => onAction(data.id)}>
      Executar Ação
    </button>
  );
}
```

## Boas Práticas

1. **Componentes Pequenos e Focados**: Cada componente deve fazer uma coisa bem feita
2. **Nomes Descritivos**: Nomes que descrevem claramente o propósito do componente
3. **Props Consistentes**: Padrões de nomeação consistentes (ex: `onAction` para callbacks)
4. **Valores Default**: Fornecer valores padrão para props opcionais
5. **Validação de Props**: Usar TypeScript para validar props em tempo de compilação
6. **Componentização Progressiva**: Extrair componentes conforme a complexidade aumenta
7. **Documentação Inline**: Comentários explicativos para lógica complexa 