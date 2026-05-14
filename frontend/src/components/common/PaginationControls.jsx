import React from 'react';

export const PaginationControls = ({
  currentPage,
  totalPages,
  totalFiltered,
  startIndex,
  endIndex,
  totalItems,
  searchTerm,
  selectedFilter,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onNextPage,
  onPrevPage,
  emptyMessage = 'No hay datos disponibles',
  emptyFilteredMessage = 'No se encontraron resultados'
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-t border-outline-variant">
      {/* Results info */}
      <div className="text-sm text-on-surface-variant">
        <span className="font-medium">{totalFiltered === 0 ? 0 : startIndex + 1}</span>
        {' - '}
        <span className="font-medium">{endIndex}</span>
        {' de '}
        <span className="font-bold text-on-surface">{totalFiltered}</span>
        {' registros'}
        {totalFiltered !== totalItems && (
          <span className="text-primary ml-1">
            (de {totalItems} totales)
          </span>
        )}
      </div>

      {/* Pagination buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={onPrevPage}
            disabled={!hasPrevPage}
            className={`flex items-center gap-1 px-3 h-9 rounded-lg text-sm font-medium transition-colors ${
              !hasPrevPage
                ? 'bg-surface-container-low text-on-surface-variant/40 cursor-not-allowed'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {renderPageNumbers()}
          </div>

          {/* Mobile page indicator */}
          <div className="sm:hidden flex items-center px-3 h-9 text-sm font-medium text-on-surface-variant">
            {currentPage}/{totalPages}
          </div>

          {/* Next Button */}
          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className={`flex items-center gap-1 px-3 h-9 rounded-lg text-sm font-medium transition-colors ${
              !hasNextPage
                ? 'bg-surface-container-low text-on-surface-variant/40 cursor-not-allowed'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      )}

      {/* Empty state info */}
      {totalFiltered === 0 && (searchTerm || selectedFilter) && (
        <div className="text-sm text-on-surface-variant">
          {emptyFilteredMessage}
        </div>
      )}
    </div>
  );
};

export default PaginationControls;