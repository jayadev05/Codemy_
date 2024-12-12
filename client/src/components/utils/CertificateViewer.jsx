import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Download, FileText, Image, FileSpreadsheet } from 'lucide-react';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const CertificateViewer = ({ certificate }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  // Memoized file URL to avoid recreating on each render
  const fileUrl = React.useMemo(() => 
    `http://localhost:3000/admin/certificates/${certificate._id}`, 
    [certificate._id]
  );

  // Reset page number when certificate changes
  useEffect(() => {
    setPageNumber(1);
  }, [certificate]);

  // Helper function to get file icon based on mime type
  const getFileIcon = useCallback((mimeType) => {
    const iconMap = {
      'application/pdf': FileText,
      'application/msword': FileSpreadsheet,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileSpreadsheet,
      'image/jpeg': Image,
      'image/png': Image,
      'image/gif': Image,
    };
    return iconMap[mimeType] || FileText;
  }, []);

  // Render different file types
  const renderFilePreview = () => {
    const { mimeType } = certificate;

    switch (mimeType) {
      case 'application/pdf':
        return (
          <div className="pdf-preview">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex justify-center items-center h-64">
                  Loading PDF...
                </div>
              }
              error={
                <div className="text-red-500 text-center p-4">
                  Error loading PDF
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={600}
              />
            </Document>
            {numPages > 1 && (
              <div className="pdf-navigation mt-4 flex justify-center items-center space-x-4">
                <button 
                  onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                  disabled={pageNumber <= 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {pageNumber} of {numPages}</span>
                <button 
                  onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                  disabled={pageNumber >= numPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return (
          <div className="flex flex-col items-center">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
              title="Document Preview"
            />
            <a 
              href={fileUrl}
              download
              className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <Download className="mr-2" size={20} />
              Download Document
            </a>
          </div>
        );

      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return (
          <div className="flex flex-col items-center">
            <img
              src={fileUrl}
              alt="Certificate"
              className="max-w-full max-h-[450px] object-contain rounded-lg"
            />
            <a 
              href={fileUrl}
              download
              className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <Download className="mr-2" size={20} />
              Download Image
            </a>
          </div>
        );

      default:
        return (
          <div className="text-center p-8 bg-gray-100 rounded-lg flex flex-col items-center">
            <p className="text-gray-700 mb-4">
              This file type cannot be previewed directly.
            </p>
            <a 
              href={fileUrl}
              download
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <Download className="mr-2" size={20} />
              Download File
            </a>
          </div>
        );
    }
  };

  // Main render
  return (
    <div className="certificate-viewer">
      <div className="flex items-center mb-4">
        {React.createElement(getFileIcon(certificate.mimeType), { 
          className: "mr-2 text-blue-600", 
          size: 24 
        })}
        <h2 className="text-lg font-semibold truncate">
          {certificate.fileName || 'Certificate'}
        </h2>
      </div>
      {renderFilePreview()}
    </div>
  );
};

export default CertificateViewer;