import React from 'react';
import Link from 'next/link';

type MenuItem = {
  name: string;
  icon: string;
  href: string;
  count?: number;
  active?: boolean;
};

const menuItems: MenuItem[] = [
  { name: 'Painel', icon: '📊', href: '/', active: true },
  { name: 'Contatos', icon: '👥', href: '/contacts', count: 25 },
  { name: 'Campanhas', icon: '📣', href: '/campaigns', count: 3 },
  { name: 'Conhecimentos', icon: '🧠', href: '/knowledge', count: 12 },
  { name: 'Configurações', icon: '⚙️', href: '/settings' },
];

export default function Sidebar() {
  return (
    <div className="h-screen w-64 fixed left-0 top-0 bg-[var(--sidebar-bg)] border-r border-[var(--color-surface-3)] p-4">
      <div className="flex items-center mb-8 px-4">
        <span className="text-[var(--color-accent)] text-2xl mr-2">🤖</span>
        <h1 className="text-xl font-bold">WhatsApp AI</h1>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-[var(--color-surface-3)]' 
                    : 'hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && (
                  <span className="bg-[var(--color-accent)] text-white text-xs rounded-full px-2 py-1">
                    {item.count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-8 left-0 w-full px-4">
        <div className="flex items-center p-4 rounded-lg bg-[var(--color-surface-2)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white mr-3">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-[var(--color-surface-8)]">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
} 