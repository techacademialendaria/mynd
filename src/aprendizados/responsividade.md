# Responsividade e Acessibilidade

## Princípios de Layout Responsivo

### Breakpoints

Seguimos breakpoints padrão para diferentes tamanhos de tela:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1023px (md)
- **Desktop**: >= 1024px (lg)

### Layout Multi-coluna

Utilizamos o sistema de grid do Tailwind CSS para criar layouts responsivos:

```jsx
<div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8 responsive-grid">
  {/* Coluna esquerda - empilha em mobile, 4 colunas em desktop */}
  <div className="col-span-12 lg:col-span-4">
    {/* Conteúdo */}
  </div>
  
  {/* Coluna direita - empilha em mobile, 8 colunas em desktop */}
  <div className="col-span-12 lg:col-span-8">
    {/* Conteúdo */}
  </div>
</div>
```

Para dispositivos móveis, adicionamos uma classe utilitária `.responsive-grid` que força uma coluna única:

```css
@media (max-width: 767px) {
  .responsive-grid {
    grid-template-columns: 1fr !important;
  }
}
```

### Barra Lateral Responsiva

Em telas grandes, a barra lateral é fixa e sempre visível. Em telas menores, ela é:
- Escondida por padrão
- Pode ser aberta através de um botão de menu
- Apresenta um overlay para facilitar o fechamento
- Fecha automaticamente após seleção de item de menu

```jsx
{/* Sidebar */}
<div 
  className={`h-screen fixed left-0 top-0 bg-[var(--sidebar-bg)] z-50 transition-transform duration-300 
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-64`}
>
  {/* Conteúdo da Sidebar */}
</div>

{/* Overlay para fechar em dispositivos móveis */}
{isOpen && (
  <div className="sidebar-overlay lg:hidden" onClick={onClose} />
)}
```

## Scroll e Overflow

### Container de Mensagens

Para garantir que áreas de conteúdo longo possam ser roladas adequadamente:

```css
.messages-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  -webkit-overflow-scrolling: touch;
}
```

Ajustamos a altura máxima baseada no tamanho da tela:

```css
@media (max-width: 1023px) {
  .messages-container {
    max-height: calc(100vh - 320px);
  }
}

@media (max-width: 767px) {
  .messages-container {
    max-height: calc(100vh - 420px);
  }
}
```

### Customização da Scrollbar

Aplicamos estilo personalizado para a barra de rolagem:

```css
.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--color-surface-3);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--color-surface-5);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-surface-6);
}
```

## Componentes Responsivos

### Cartões de Mensagem

Em dispositivos móveis, empilhamos cabeçalho e ações:

```jsx
<div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
  {/* Informações da mensagem */}
  <div>...</div>
  
  {/* Botões de ação */}
  <div className="flex gap-2 w-full sm:w-auto">
    <button className="flex-1 sm:flex-none">Analisar</button>
    <button className="flex-1 sm:flex-none">Responder</button>
  </div>
</div>
```

### Formulários Responsivos

Em formulários, usamos empilhamento vertical em telas pequenas:

```jsx
<div className="flex flex-col xs:flex-row gap-2 mt-2">
  <button className="flex-1">Botão Principal</button>
  <button className="flex-1">Botão Secundário</button>
</div>
```

### Paginação Simplificada

Para telas pequenas, simplificamos a paginação:

```jsx
{/* Versão desktop: mostra números de página */}
<div className="hidden sm:flex space-x-1">
  {/* Números de página */}
</div>

{/* Versão mobile: mostra apenas página atual / total */}
<div className="flex sm:hidden items-center px-2">
  <span className="text-sm">
    {currentPage} / {totalPages}
  </span>
</div>
```

## Otimizações para Touchscreen

### Tamanho de Alvos de Toque

Botões e elementos interativos têm tamanho mínimo adequado para toque (44px):

```css
.mobile-nav-button {
  width: 40px;
  height: 40px;
}
```

### Feedback Visual para Toque

Adicionamos estados de hover e active para fornecer feedback visual:

```css
.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:active {
  transform: scale(0.98);
}
```

### Rolagem Suave

Implementamos rolagem suave para melhor experiência em dispositivos touchscreen:

```css
-webkit-overflow-scrolling: touch;
```

## Práticas de Acessibilidade

### Rótulos ARIA

Adicionamos rótulos ARIA para melhorar a navegação por leitores de tela:

```jsx
<button 
  aria-label="Página anterior"
  className="..."
>
  &lt;
</button>

<button
  aria-label={`Página ${page}`}
  aria-current={page === currentPage ? 'page' : undefined}
>
  {page}
</button>
```

### Contraste de Cores

Seguimos as diretrizes WCAG AA para contraste:
- Texto sobre fundos escuros: Branco (#FFFFFF) ou cinza claro (#BFBFBF)
- Botões principais: Laranja (#FD6649) com texto branco
- Elementos de destaque: Bordas e contornos com contraste suficiente

### Foco Visual

Mantemos indicadores de foco visíveis para navegação por teclado:

```css
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Boas Práticas

1. **Mobile First**: Desenvolvimento começando pela experiência móvel
2. **Teste em Múltiplos Dispositivos**: Validação em diferentes tamanhos de tela
3. **Degradação Graciosa**: Funcionalidades complexas são simplificadas em telas menores
4. **Performance**: Otimização de layout para evitar reflow
5. **Acessibilidade**: Garantir usabilidade para todos os usuários 