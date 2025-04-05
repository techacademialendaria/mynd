import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between h-16 mb-8">
      <div>
        <h1 className="text-2xl font-bold">Agentes WhatsApp</h1>
        <p className="text-[var(--color-surface-7)] text-sm">
          Gerencie seus agentes de IA para WhatsApp
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar agentes..."
            className="bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] rounded-lg px-4 py-2 pl-10 w-64 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
          <span className="absolute left-3 top-2.5 text-[var(--color-surface-7)]">
            🔍
          </span>
        </div>
        
        <button className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <span className="mr-2">+</span>
          Novo Agente
        </button>
      </div>
    </header>
  );
} 