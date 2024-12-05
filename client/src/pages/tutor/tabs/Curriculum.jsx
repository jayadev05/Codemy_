import React, { useState } from 'react'

function Curriculum() {

    const [sections, setSections] = useState([
        { id: 1, name: "Section name", isExpanded: false },
        { id: 2, name: "Section name", isExpanded: false },
        { id: 3, name: "Section name", isExpanded: false },
      ]);
    
    const toggleSection = (id) => {
        setSections(sections.map(section => 
          section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
        ));
      };
    
      const addSection = () => {
        const newId = Math.max(...sections.map(s => s.id), 0) + 1;
        setSections([...sections, { id: newId, name: "Section name", isExpanded: false }]);
      };
  return (
    <>
    <div className="border border-gray-200 rounded-lg p-6">
     <div className="space-y-2">
       {sections.map((section) => (
         <div
           key={section.id}
           className="bg-gray-50 rounded-lg p-4"
         >
           <div className="flex items-center justify-between">
             <button
               onClick={() => toggleSection(section.id)}
               className="flex items-center gap-4 flex-1"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
               <span className="text-sm font-medium">
                 Sections {String(section.id).padStart(2, '0')}: {section.name}
               </span>
             </button>
             <div className="flex items-center gap-2">
               <button className="p-1 hover:bg-gray-200 rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                 </svg>
               </button>
               <div className="relative">
                 <button className="p-1 hover:bg-gray-200 rounded">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                   </svg>
                 </button>
                 {/* Dropdown menu would go here */}
               </div>
               <button className="p-1 hover:bg-gray-200 rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
               </button>
             </div>
           </div>
         </div>
       ))}
    

     <button
       onClick={addSection}
       className="w-full mt-4 px-4 py-2 border border-gray-300 text-orange-500 rounded-md hover:bg-gray-50"
     >
       Add Sections
     </button>
   </div>

  
 </div>
   </>
  )
}

export default Curriculum