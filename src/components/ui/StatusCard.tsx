import React from 'react';

interface StatusCardProps {
  isWhatsAppConnected: boolean;
  isMongoConnected: boolean;
  onConnectWhatsApp: () => void;
  isLoading: boolean;
}

export default function StatusCard({
  isWhatsAppConnected,
  isMongoConnected,
  onConnectWhatsApp,
  isLoading
}: StatusCardProps) {
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Status do Sistema</h2>
      
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`status-dot ${isWhatsAppConnected ? 'connected' : 'disconnected'}`}></div>
            <span>WhatsApp</span>
          </div>
          <div className="text-sm text-[var(--color-surface-7)]">
            {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`status-dot ${isMongoConnected ? 'connected' : 'disconnected'}`}></div>
            <span>Banco de Dados</span>
          </div>
          <div className="text-sm text-[var(--color-surface-7)]">
            {isMongoConnected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>
        
        {!isWhatsAppConnected && (
          <button 
            onClick={onConnectWhatsApp}
            disabled={isLoading}
            className="btn-primary w-full py-2 px-4 rounded-lg mt-4 text-sm font-medium"
          >
            {isLoading ? 'Conectando...' : 'Conectar WhatsApp'}
          </button>
        )}
        
        {!isWhatsAppConnected && (
          <div className="mt-2 p-3 rounded-lg bg-[var(--color-surface-3)] text-xs">
            <p className="font-medium mb-2">Como conectar:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Clique no botão "Conectar WhatsApp" acima</li>
              <li>Um QR code será exibido no terminal do servidor</li>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Acesse Configurações &gt; Aparelhos conectados</li>
              <li>Escaneie o QR code</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
} 