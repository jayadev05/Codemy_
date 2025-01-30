'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import axiosInstance from '@/config/axiosConfig'

export default function DateRangePicker() {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

 

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(`/admin/sales-report`, {
        params: { startDate, endDate },
        responseType: 'blob',
      });
  
      // Create a URL for the blob data
      const url = window.URL.createObjectURL(response.data);
  
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${startDate}_to_${endDate}.pdf`); // Specify the filename
      document.body.appendChild(link);
  
      // Simulate a click on the link to trigger the download
      link.click();
  
      // Clean up the temporary link and revoke the blob URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error("Error exporting sales report:", error.response || error);
      toast.error("Failed to export sales report. Please try again.");
    }
  };
  

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">From:</label>
        <input
          type="date"
          name="from"
          value={startDate}
          onChange={(e)=> setStartDate(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">To:</label>
        <input
          type="date"
          name="to"
          value={endDate}
          onChange={(e)=> setEndDate(e.target.value)}
          min={startDate}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
      </div>
      <button
        onClick={handleExport}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
      >
        Export Report
      </button>
    </div>
  )
}

