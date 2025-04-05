import React from 'react';

interface MessageCardProps {
  message: {
    _id: string;
    sender: string;
    content: string;
    timestamp: string;
    processed: boolean;
    aiAnalysis?: {
      intent?: string;
      sentiment?: string;
      keywords?: string[];
      summary?: string;
    };
  };
  onAnalyze: (id: string) => void;
  onRespond: (id: string) => void;
  isLoading: boolean;
}

export default function MessageCard({
  message,
  onAnalyze,
  onRespond,
  isLoading
}: MessageCardProps) {
  const { _id, sender, content, timestamp, processed, aiAnalysis } = message;
  const formattedDate = new Date(timestamp).toLocaleString();
  
  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
        <div>
          <div className="flex items-center">
            <span className="text-lg mr-2">💬</span>
            <span className="font-medium">{sender}</span>
          </div>
          <div className="text-xs text-[var(--color-surface-7)] mt-1">
            {formattedDate}
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {!processed && (
            <button
              onClick={() => onAnalyze(_id)}
              disabled={isLoading}
              className="px-3 py-1 bg-[var(--color-surface-4)] text-white text-xs rounded-md hover:bg-[var(--color-surface-5)] disabled:opacity-50 flex-1 sm:flex-none"
            >
              Analisar
            </button>
          )}
          <button
            onClick={() => onRespond(_id)}
            disabled={isLoading}
            className="btn-primary px-3 py-1 text-xs rounded-md disabled:opacity-50 flex-1 sm:flex-none"
          >
            Responder
          </button>
        </div>
      </div>
      
      <div className="border-b border-[var(--color-surface-3)] pb-3 mb-3">
        <p className="text-sm break-words">{content}</p>
      </div>
      
      {processed && aiAnalysis && (
        <div className="bg-[var(--color-surface-3)] p-3 rounded-lg text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {aiAnalysis.intent && (
              <div>
                <span className="text-[var(--color-surface-8)]">Intenção:</span>
                <p>{aiAnalysis.intent}</p>
              </div>
            )}
            
            {aiAnalysis.sentiment && (
              <div>
                <span className="text-[var(--color-surface-8)]">Sentimento:</span>
                <p>{aiAnalysis.sentiment}</p>
              </div>
            )}
          </div>
          
          {aiAnalysis.keywords && (
            <div className="mt-2">
              <span className="text-[var(--color-surface-8)]">Palavras-chave:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {aiAnalysis.keywords.map((keyword, index) => (
                  <span key={index} className="bg-[var(--color-surface-4)] px-2 py-0.5 rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {aiAnalysis.summary && (
            <div className="mt-2">
              <span className="text-[var(--color-surface-8)]">Resumo:</span>
              <p className="mt-1">{aiAnalysis.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 