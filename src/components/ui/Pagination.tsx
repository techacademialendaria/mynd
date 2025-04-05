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
  
  return (
    <div className="flex items-center justify-center mt-6 space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--color-surface-3)] disabled:opacity-40"
      >
        &lt;
      </button>
      
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        // Only show current page and 1 page before/after
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
            >
              {page}
            </button>
          );
        }
        
        // Show ellipsis but only once between gaps
        if (
          (page === currentPage - 2 && currentPage > 3) ||
          (page === currentPage + 2 && currentPage < totalPages - 2)
        ) {
          return (
            <span key={page} className="text-[var(--color-surface-6)]">
              ...
            </span>
          );
        }
        
        return null;
      })}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--color-surface-3)] disabled:opacity-40"
      >
        &gt;
      </button>
    </div>
  );
} 