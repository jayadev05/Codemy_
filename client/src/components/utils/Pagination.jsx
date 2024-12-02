import React from 'react';

function Pagination({ totalData, dataPerPage, currentPage, setCurrentPage , className }) {
  const totalPages =  Math.ceil(totalData / dataPerPage);


  // Limit page numbers to prevent overwhelming UI
  const pageNumbers = [...Array(Math.min(totalPages, 5))].map((_, index) => index + 1);

  

  return (
    <div className={className}>
      <button onClick={()=>setCurrentPage(currentPage>1?currentPage-1:currentPage)}>Prev</button>
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => setCurrentPage(pageNumber)}
          className={`
            px-4 py-2 rounded-md transition-colors
            ${currentPage === pageNumber
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {pageNumber}
        </button>
      ))}
      {totalPages > 5 && <span>...</span>}
      <button onClick={()=>setCurrentPage(currentPage<totalPages?currentPage+1:currentPage)}>Next</button>
    </div>
  );
}

export default Pagination;