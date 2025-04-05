'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import components
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatusCard from '../components/ui/StatusCard';
import SendMessageForm from '../components/ui/SendMessageForm';
import MessageCard from '../components/ui/MessageCard';
import Pagination from '../components/ui/Pagination';

export default function Home() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mongoConnected, setMongoConnected] = useState(false);
  
  // Estado para o menu mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    
    // Adicionar/remover classe no body para prevenir scroll quando o menu está aberto
    if (!sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  };
  
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
  const sendMessage = async (recipient: string, messageText: string) => {
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
    
    // Adicionar listener para fechar sidebar em resize
    const handleResize = () => {
      if (window.innerWidth > 1023 && sidebarOpen) {
        setSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <main className="flex-1 main-with-sidebar lg:pl-64 transition-all duration-300 main-content">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <Header onToggleSidebar={toggleSidebar} />
          
          {/* Content Grid */}
          <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8 responsive-grid">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
              {/* Status Card */}
              <StatusCard 
                isWhatsAppConnected={isConnected}
                isMongoConnected={mongoConnected}
                onConnectWhatsApp={connectWhatsApp}
                isLoading={isLoading}
              />
              
              {/* Send Message Form */}
              <SendMessageForm 
                onSendMessage={sendMessage}
                isConnected={isConnected}
                isLoading={isLoading}
              />
            </div>
            
            {/* Right Column - Messages */}
            <div className="col-span-12 lg:col-span-8">
              <div className="card p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-lg font-semibold mb-2 sm:mb-0">Mensagens Recentes</h2>
                  <button 
                    onClick={() => fetchMessages(1)} 
                    className="text-sm text-[var(--color-accent)] hover:underline"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Atualizando...' : 'Atualizar'}
                  </button>
                </div>
                
                <div className="messages-container">
                  {isLoading && messages.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                      <svg className="animate-spin h-8 w-8 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 md:py-12 border border-dashed border-[var(--color-surface-4)] rounded-lg">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-[var(--color-surface-7)]">Nenhuma mensagem encontrada</p>
                      <p className="text-xs text-[var(--color-surface-6)] mt-1">
                        As mensagens recebidas aparecerão aqui
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageCard
                          key={message._id}
                          message={message}
                          onAnalyze={analyzeMessage}
                          onRespond={respondToMessage}
                          isLoading={isLoading}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-surface-3)]">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={fetchMessages}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
