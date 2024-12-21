import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

function Pagination({ totalData, dataPerPage, currentPage, setCurrentPage, className }) {
   const totalPages = Math.ceil(totalData / dataPerPage);

   console.log(totalPages,"totalpages",totalData,"totaldata")

  
   const generatePageNumbers = () => {
   
  //Show all pages if less than 5
     if (totalPages <= 5) {
       return [...Array(totalPages)].map((_, index) => index + 1);
     }

    
     let pages = [];
     if (currentPage <= 3) {
       // First few pages
       pages = [1, 2, 3, 4, 5];
     } else if (currentPage >= totalPages - 2) {
       // Last few pages
       pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
     } else {
       // Middle pages
       pages = [
         currentPage - 2, 
         currentPage - 1, 
         currentPage, 
         currentPage + 1, 
         currentPage + 2
       ];
     }

     return pages.filter(page => page > 0 && page <= totalPages);
   };

   const pageNumbers = generatePageNumbers();

   return (
     <div className={`flex items-center gap-5 ${className}`}>
       <button 
         disabled={currentPage === 1} 
         className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50' 
         onClick={() => setCurrentPage(currentPage - 1)}
       >
         <ChevronLeft className="h-5 w-5" />
       </button>

       <div className='flex gap-2'>
         {pageNumbers[0] > 1 && (
           <>
             <button 
               onClick={() => setCurrentPage(1)} 
               className='px-4 py-2 border text-sm font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300'
             >
               1
             </button>
             {pageNumbers[0] > 2 && <span className='self-end'>...</span>}
           </>
         )}

         {pageNumbers.map((pageNumber) => (
           <button
             key={pageNumber}
             onClick={() => setCurrentPage(pageNumber)}
             className={`
               px-4 py-2 border text-sm font-medium rounded-md
               ${currentPage === pageNumber
                 ? 'bg-[#ff6738] text-white'
                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
               }
             `}
           >
             {pageNumber}
           </button>
         ))}

         {pageNumbers[pageNumbers.length - 1] < totalPages && (
           <>
             {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className='self-end'>...</span>}
             <button 
               onClick={() => setCurrentPage(totalPages)} 
               className='px-4 py-2 border text-sm font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300'
             >
               {totalPages}
             </button>
           </>
         )}
       </div>

       <button 
         disabled={currentPage === totalPages} 
         className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50' 
         onClick={() => setCurrentPage(currentPage + 1)}
       >
         <ChevronRight className="h-5 w-5" />
       </button>
     </div>
   );
}

export default Pagination;