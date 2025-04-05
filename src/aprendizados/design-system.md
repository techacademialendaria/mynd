# Design System

## Princípios Fundamentais

### Escala de Espaçamento
Utilizamos a escala de 4px para todos os espaçamentos, garantindo consistência em toda a aplicação:
- 4px (--space-1)
- 8px (--space-2)
- 12px (--space-3)
- 16px (--space-4)
- 20px (--space-5)
- 24px (--space-6)
- 32px (--space-8)
- 40px (--space-10)
- 48px (--space-12)

### Sistema de Cores
Cores de superfície bem definidas, seguindo uma progressão lógica:
- `#000000` (--color-surface-0)
- `#101010` (--color-surface-1)
- `#202020` (--color-surface-2) 
- `#303030` (--color-surface-3)
- `#404040` (--color-surface-4)
- `#505050` (--color-surface-5)
- `#757575` (--color-surface-6)
- `#959595` (--color-surface-7)
- `#BFBFBF` (--color-surface-8)
- `#D8D8D8` (--color-surface-9)
- `#F2F2F2` (--color-surface-10)
- `#FFFFFF` (--color-surface-11)

Cor de destaque:
- `#FD6649` (--color-accent) - Utilizada apenas para ações primárias e elementos de destaque

### Aplicação de Cores
- Fundo principal: `var(--color-surface-1)`
- Texto principal: `var(--color-surface-11)`
- Cards e elementos: `var(--color-surface-2)`
- Sidebar: `var(--color-surface-0)`
- Botões primários: `var(--color-accent)`

### Hierarquia Tipográfica
- Títulos principais: 24px (2xl)
- Subtítulos: 20px (xl)
- Títulos de card: 18px (lg)
- Texto normal: 16px (base)
- Texto secundário: 14px (sm)
- Texto auxiliar: 12px (xs)

## Componentes

### Cards
Cards são utilizados como contêineres para informações relacionadas. Características:
- Fundo escuro `var(--card-bg)`
- Bordas arredondadas (8px)
- Espaçamento interno consistente
- Títulos claros no topo

### Botões
- **Botão Primário**: Fundo laranja `var(--color-accent)`, texto branco
- **Botão Secundário**: Fundo `var(--color-surface-4)`, texto branco
- **Botão Terciário**: Transparente com borda `var(--color-surface-4)`

Estados:
- Hover: Redução de opacidade para 90%
- Disabled: Opacidade reduzida para 50%
- Loading: Ícone de spinner animado

### Formulários
Campos de formulário seguem o padrão:
- Fundo ligeiramente mais escuro que o card
- Borda sutil para definição
- Foco destacado com borda na cor de destaque
- Labels acima dos campos
- Mensagens de ajuda em tamanho menor

### Indicadores de Status
Utilizamos pontos coloridos para indicar status:
- Conectado: Cor de destaque `var(--color-accent)`
- Desconectado: Cinza `var(--color-surface-6)`

## Layout

### Grid System
- Grid de 12 colunas para layout responsivo
- Sidebar fixa na lateral esquerda (largura 256px)
- Área de conteúdo principal com margens adequadas
- Cards organizados em grid com espaçamentos consistentes

### Responsividade
- Adaptação para dispositivos móveis com reorganização de colunas
- Quebras de layout em:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## Feedback Visual

### Estados de Loading
- Spinners animados para indicar carregamento
- Opacidade reduzida em elementos desativados
- Mensagens claras durante operações

### Estados Vazios
Design específico para estados vazios:
- Ícones representativos
- Mensagem principal explicativa
- Mensagem secundária com orientação
- Posicionamento centralizado

### Micro-interações
- Transições suaves em hover
- Feedback visual imediato ao clicar
- Animações sutis para melhorar a experiência

## Princípios de Acessibilidade

- Contraste adequado entre texto e fundo
- Tamanhos de fonte legíveis
- Foco visual claro para navegação por teclado
- Texto alternativo para elementos visuais
- Estrutura semântica para leitores de tela 