import React, { useMemo } from 'react';

const Pagination = ({ 
  totalData, 
  dataPerPage, 
  currentPage, 
  setCurrentPage 
}) => {
  // Use useMemo to memoize page calculations
  const pageCalculations = useMemo(() => {
    // Calculate total number of pages
    const totalPages = Math.ceil(totalData / dataPerPage);
    
    // Generate an array of page numbers
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    
    return { totalPages, pages };
  }, [totalData, dataPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    const { totalPages } = pageCalculations;
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Page number buttons */}
      {pageCalculations.pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-4 py-2 rounded-md transition-colors ${
            page === currentPage
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pageCalculations.totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;