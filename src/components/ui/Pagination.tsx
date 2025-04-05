import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: PaginationProps) {
  if (totalPages <= 1) return null;
  
  // Para telas menores, mostramos apenas botões de anterior/próximo e página atual
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  return (
    <div className="flex items-center justify-center mt-6 space-x-1 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--color-surface-3)] disabled:opacity-40"
        aria-label="Página anterior"
      >
        &lt;
      </button>
      
      {/* Versão desktop: mostra números de página */}
      <div className="hidden sm:flex space-x-1">
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          // Mostrar apenas: primeira, última e até 3 páginas ao redor da atual
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={page === currentPage || isLoading}
                className={`flex items-center justify-center w-8 h-8 rounded-md ${
                  page === currentPage
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-3)] hover:bg-[var(--color-surface-4)]'
                }`}
                aria-label={`Página ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          }
          
          // Mostrar ellipsis entre gaps de páginas
          if (
            (page === currentPage - 2 && currentPage > 3) ||
            (page === currentPage + 2 && currentPage < totalPages - 2)
          ) {
            return (
              <span key={page} className="text-[var(--color-surface-6)] flex items-center">
                ...
              </span>
            );
          }
          
          return null;
        })}
      </div>
      
      {/* Versão mobile: mostra apenas página atual / total */}
      <div className="flex sm:hidden items-center px-2">
        <span className="text-sm text-[var(--color-surface-7)]">
          {currentPage} / {totalPages}
        </span>
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--color-surface-3)] disabled:opacity-40"
        aria-label="Próxima página"
      >
        &gt;
      </button>
    </div>
  );
} 