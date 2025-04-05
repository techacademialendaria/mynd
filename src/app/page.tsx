'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mongoConnected, setMongoConnected] = useState(false);
  
  // Estado para envio de mensagem
  const [recipient, setRecipient] = useState('');
  const [messageText, setMessageText] = useState('');
  
  // Buscar status da conexão
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Buscar mensagens
  const fetchMessages = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setMessages(data.data.messages || []);
        setCurrentPage(data.data.pagination?.page || 1);
        setTotalPages(data.data.pagination?.pages || 1);
      } else {
        // Se não houver dados, inicializar com arrays vazios
        setMessages([]);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar conexão com WhatsApp
  const connectWhatsApp = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'connect' }),
      });
      
      const data = await response.json();
      alert(data.message);
      
      // Atualizar status após tentativa de conexão
      fetchStatus();
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      alert('Erro ao conectar com WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensagem
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !messageText) {
      alert('Preencha todos os campos');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'send',
          to: recipient,
          message: messageText
        }),
      });
      
      const data = await response.json();
      alert(data.message);
      
      if (data.success) {
        setMessageText('');
        // Atualizar lista de mensagens
        fetchMessages();
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  // Analisar mensagem com IA
  const analyzeMessage = async (messageId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'analyze',
          messageId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Mensagem analisada com sucesso');
        // Atualizar lista para mostrar análise
        fetchMessages(currentPage);
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao analisar mensagem:', error);
      alert('Erro ao analisar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  // Responder mensagem automaticamente com IA
  const respondToMessage = async (messageId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'respondToMessage',
          messageId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Resposta enviada: ${data.data?.response || 'Resposta gerada com sucesso'}`);
        // Atualizar lista de mensagens para mostrar a nova resposta
        fetchMessages(currentPage);
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao responder mensagem:', error);
      alert('Erro ao responder mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar conexão com MongoDB
  const checkMongoConnection = async () => {
    try {
      const response = await fetch('/api/mongodb');
      const data = await response.json();
      
      setMongoConnected(data.connected);
    } catch (error) {
      console.error('Erro ao verificar MongoDB:', error);
      setMongoConnected(false);
    }
  };

  // Buscar status e mensagens ao carregar
  useEffect(() => {
    fetchStatus();
    fetchMessages();
    checkMongoConnection();
    
    // Configurar um intervalo para verificar o status periodicamente
    const statusInterval = setInterval(() => {
      fetchStatus();
      checkMongoConnection();
    }, 10000); // 10 segundos
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">WhatsApp AI Agent</h1>
      
      {/* Status e ações */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Conectado ao WhatsApp' : 'Desconectado'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${mongoConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{mongoConnected ? 'MongoDB Conectado' : 'MongoDB Desconectado'}</span>
              {!mongoConnected && (
                <button 
                  onClick={() => window.open('/docker-instructions.md', '_blank')} 
                  className="ml-2 text-xs text-blue-500 underline"
                >
                  Ver Instruções
                </button>
              )}
            </div>
          </div>
          
          <button 
            onClick={connectWhatsApp}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Conectar WhatsApp'}
          </button>
        </div>
        
        {!isConnected && (
          <div className="bg-blue-50 p-3 rounded text-sm mb-4 border border-blue-200">
            <p className="font-medium mb-1">Como conectar:</p>
            <ol className="list-decimal pl-5">
              <li>Clique no botão "Conectar WhatsApp" acima</li>
              <li>Um QR code será exibido no terminal/console do servidor</li>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em ⋮ (menu) ou Configurações &gt; Aparelhos conectados</li>
              <li>Selecione "Conectar um aparelho" e escaneie o QR code</li>
            </ol>
            <p className="mt-2 text-blue-600">Nota: Você precisa ter acesso ao console/terminal do servidor para ver o QR code.</p>
          </div>
        )}
        
        <form onSubmit={sendMessage} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              placeholder="Número (ex: 5511999999999)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Inclua o código do país (55 para Brasil) + DDD + número
            </p>
          </div>
          <input
            type="text"
            placeholder="Mensagem"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="border p-2 rounded"
          />
          <button 
            type="submit"
            disabled={isLoading || !isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
      
      {/* Lista de Mensagens */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Mensagens</h2>
          <button 
            onClick={() => fetchMessages(1)} 
            className="text-sm text-blue-500 hover:underline"
            disabled={isLoading}
          >
            Atualizar
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4">Nenhuma mensagem encontrada</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg._id} className="border p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">De: {msg.sender}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!msg.processed && (
                      <button
                        onClick={() => analyzeMessage(msg._id)}
                        className="px-2 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                      >
                        Analisar
                      </button>
                    )}
                    <button
                      onClick={() => respondToMessage(msg._id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Responder
                    </button>
                  </div>
                </div>
                
                <p className="mb-3">{msg.content}</p>
                
                {msg.processed && msg.aiAnalysis && (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <p><span className="font-medium">Intenção:</span> {msg.aiAnalysis.intent}</p>
                    <p><span className="font-medium">Sentimento:</span> {msg.aiAnalysis.sentiment}</p>
                    {msg.aiAnalysis.keywords && (
                      <p><span className="font-medium">Palavras-chave:</span> {msg.aiAnalysis.keywords.join(', ')}</p>
                    )}
                    {msg.aiAnalysis.summary && (
                      <p><span className="font-medium">Resumo:</span> {msg.aiAnalysis.summary}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => fetchMessages(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => fetchMessages(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
    </div>
    </main>
  );
}
