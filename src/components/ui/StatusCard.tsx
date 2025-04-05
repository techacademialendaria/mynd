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
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {!isWhatsAppConnected && (
            <button 
              onClick={onConnectWhatsApp}
              disabled={isLoading}
              className="btn-primary py-2 px-4 rounded-lg text-sm font-medium flex-1 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Conectando...
                </>
              ) : 'Conectar WhatsApp'}
            </button>
          )}
          
          {!isMongoConnected && (
            <button 
              onClick={() => window.open('/docker-instructions.md', '_blank')}
              className="bg-[var(--color-surface-4)] text-white py-2 px-4 rounded-lg text-sm font-medium flex-1 flex items-center justify-center"
            >
              <span className="mr-2">📋</span>
              Ver Instruções
            </button>
          )}
        </div>
        
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