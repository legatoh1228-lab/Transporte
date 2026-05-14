import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

const ITEMS_PER_PAGE = 20;

export const usePagination = (data = [], options = {}) => {
  const {
    initialPage = 1,
    itemsPerPage = ITEMS_PER_PAGE,
    enableSearch = true,
    enableFilter = true,
    filterField = 'estado' // Campo para filtrado (estado, estatus, tipo, etc.)
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Track previous data length to detect external filter changes and reset page
  const prevDataLengthRef = useRef(data.length);
  useEffect(() => {
    if (data.length !== prevDataLengthRef.current) {
      prevDataLengthRef.current = data.length;
      setCurrentPage(1);
    }
  }, [data.length]);

  // Get unique filter values from data
  const uniqueFilterValues = useMemo(() => {
    if (!enableFilter) return [];
    const values = new Set();
    data.forEach(item => {
      const value = item[filterField] || item.estado || item.estatus || item.tipo_nombre || '';
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  }, [data, filterField, enableFilter]);

  // Filter data based on search term and selected filter
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply filter dropdown
    if (enableFilter && selectedFilter) {
      result = result.filter(item => {
        const filterValue = item[filterField] || item.estado || item.estatus || item.tipo_nombre || '';
        return filterValue === selectedFilter;
      });
    }

    // Apply search term
    if (enableSearch && searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(value => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(search);
        });
      });
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [data, searchTerm, selectedFilter, sortField, sortDirection, filterField, enableSearch, enableFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  // Clamp currentPage if it exceeds totalPages (e.g. after filtering reduces results)
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = filteredData.length === 0 ? 0 : (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    resetPage();
  }, [resetPage]);

  const handleFilterChange = useCallback((value) => {
    setSelectedFilter(value);
    resetPage();
  }, [resetPage]);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  return {
    // Data
    paginatedData,
    filteredData,
    totalFiltered: filteredData.length,
    
    // Pagination info — expose safePage as currentPage so UI reflects clamped value
    currentPage: safePage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    
    // Search & Filter
    searchTerm,
    setSearchTerm: handleSearchChange,
    selectedFilter,
    setSelectedFilter: handleFilterChange,
    uniqueFilterValues,
    filterField,
    
    // Sorting
    sortField,
    sortDirection,
    handleSort,
    
    // Navigation
    goToPage,
    nextPage,
    prevPage,
    resetPage
  };
};

export default usePagination;