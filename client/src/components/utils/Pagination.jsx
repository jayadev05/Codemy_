import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

function Pagination({ totalData, dataPerPage, currentPage, setCurrentPage , className }) {
  const totalPages =  Math.ceil(totalData / dataPerPage);


  // Limit page numbers to prevent overwhelming UI
  const pageNumbers = [...Array(Math.min(totalPages, 5))].map((_, index) => index + 1);

  

  return (
    <div className={className}>
      <button disabled={currentPage === 1} className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50' onClick={()=>setCurrentPage(currentPage>1?currentPage-1:currentPage)}>
      <ChevronLeft className="h-5 w-5" />
      </button>
      <div className='flex gap-3'>
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => setCurrentPage(pageNumber)}
          className={`
            px-4 py-2 border text-sm font-medium rounded-md
            ${currentPage === pageNumber
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {pageNumber}
        </button>
      ))}
      </div>
      
      {totalPages > 5 && <span>...</span>}
      <button  disabled={currentPage === totalPages} className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50' onClick={()=>setCurrentPage(currentPage<totalPages?currentPage+1:currentPage)}>
      <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default Pagination;