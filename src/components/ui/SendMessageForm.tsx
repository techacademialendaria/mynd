import React, { useState } from 'react';

interface SendMessageFormProps {
  onSendMessage: (recipient: string, message: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
}

export default function SendMessageForm({
  onSendMessage,
  isConnected,
  isLoading
}: SendMessageFormProps) {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message) return;
    
    await onSendMessage(recipient, message);
    setMessage(''); // Clear message field after sending
  };
  
  return (
    <div className="card p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Enviar Mensagem</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[var(--color-surface-8)]">
              Destinatário
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="5511999999999"
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
            <p className="text-xs text-[var(--color-surface-7)] mt-1">
              Código do país (55) + DDD + número
            </p>
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-[var(--color-surface-8)]">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              rows={3}
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-4)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2">
            <button
              type="submit"
              disabled={isLoading || !isConnected}
              className="btn-primary py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center flex-1"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Enviar Mensagem
                </>
              )}
            </button>
            
            {!isConnected && (
              <button
                type="button"
                onClick={() => alert('Conecte-se ao WhatsApp primeiro para enviar mensagens')}
                className="bg-[var(--color-surface-4)] text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center flex-1"
              >
                <span className="mr-2">ℹ️</span>
                Conectar WhatsApp
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 