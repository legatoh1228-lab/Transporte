import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

const ITEMS_PER_PAGE = 20;

export const usePagination = (data = [], options = {}) => {
  const {
    initialPage = 1,
    itemsPerPage = ITEMS_PER_PAGE,
    enableSearch = true,
    enableFilter = true,
    filterField = 'estado',
    serverSide = false,
    totalCount = 0,
    onParamsChange = null
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Notify parent of parameter changes for server-side fetching
  useEffect(() => {
    if (serverSide && onParamsChange) {
      onParamsChange({
        page: currentPage,
        search: searchTerm,
        filter: selectedFilter,
        ordering: sortField ? `${sortDirection === 'desc' ? '-' : ''}${sortField}` : null
      });
    }
  }, [currentPage, searchTerm, selectedFilter, sortField, sortDirection, serverSide]);

  // Client-side unique filter values
  const uniqueFilterValues = useMemo(() => {
    if (serverSide || !enableFilter) return [];
    const values = new Set();
    data.forEach(item => {
      const value = item[filterField] || item.estado || item.estatus || item.tipo_nombre || '';
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  }, [data, filterField, enableFilter, serverSide]);

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    if (serverSide) return data; // Data is already filtered by server

    let result = [...data];
    if (enableFilter && selectedFilter) {
      result = result.filter(item => {
        const filterValue = item[filterField] || item.estado || item.estatus || item.tipo_nombre || '';
        return filterValue === selectedFilter;
      });
    }
    if (enableSearch && searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(value => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(search);
        });
      });
    }
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        if (typeof aVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return result;
  }, [data, searchTerm, selectedFilter, sortField, sortDirection, filterField, enableSearch, enableFilter, serverSide]);

  // Pagination calculations
  const totalItemsCount = serverSide ? totalCount : filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  
  const paginatedData = useMemo(() => {
    if (serverSide) return data; // Data is already paginated by server
    const start = (safePage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, safePage, itemsPerPage, serverSide, data]);

  const startIndex = totalItemsCount === 0 ? 0 : (safePage - 1) * itemsPerPage;
  const endIndex = serverSide 
    ? startIndex + data.length 
    : Math.min(startIndex + itemsPerPage, totalItemsCount);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((value) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
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
    paginatedData,
    totalFiltered: totalItemsCount,
    currentPage: safePage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    searchTerm,
    setSearchTerm: handleSearchChange,
    selectedFilter,
    setSelectedFilter: handleFilterChange,
    uniqueFilterValues,
    sortField,
    sortDirection,
    handleSort,
    goToPage,
    nextPage,
    prevPage,
    resetPage: () => setCurrentPage(1)
  };
};

export default usePagination;