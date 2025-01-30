import React, { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Download, FileText, Image, FileSpreadsheet } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc =
  "/node_modules/pdfjs-dist/build/pdf.worker.entry.js";

const CertificateViewer = ({ certificate }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  const fileUrl = React.useMemo(
    () => `/admin/certificates/${certificate._id}`,
    [certificate._id]
  );

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo("Fetching started...");

     

        const response = await fetch(fileUrl, {
          credentials: "include",
          headers: {
            Accept: certificate.mimeType,
          },
        });

        setDebugInfo(
          (prev) => prev + "\nResponse received: " + response.status
        );
      

        if (!response.ok) {
          throw new Error(
            `Server responded with ${response.status}: ${response.statusText}`
          );
        }

        const blob = await response.blob();
     
        setDebugInfo((prev) => prev + "\nBlob size: " + blob.size);

        const blobUrl = URL.createObjectURL(blob);
        setFileData(blobUrl);
        setLoading(false);
        setDebugInfo((prev) => prev + "\nFile processed successfully");
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Error loading file: ${err.message}`);
        setDebugInfo((prev) => prev + "\nError: " + err.message);
        setLoading(false);
      }
    };

    if (certificate._id) {
      fetchFile();
    }

    return () => {
      if (fileData) {
        URL.revokeObjectURL(fileData);
      }
    };
  }, [fileUrl, certificate._id, certificate.mimeType]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(fileUrl, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename =
        certificate.fileName ||
        `certificate${getFileExtension(certificate.mimeType)}`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Download failed. Please try again.");
      console.error("Download failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (mimeType) => {
    const extensions = {
      "application/pdf": ".pdf",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
    };
    return extensions[mimeType] || "";
  };

  const renderFilePreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-sm text-gray-500">Loading file...</div>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 text-xs text-gray-400 max-w-md overflow-auto">
              {debugInfo}
            </pre>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 text-xs text-gray-400 max-w-md overflow-auto">
              {debugInfo}
            </pre>
          )}
        </div>
      );
    }

    if (!fileData) {
      return (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-700">No file data available</p>
        </div>
      );
    }

    switch (certificate.mimeType) {
      case "application/pdf":
        return <div className="pdf-preview"></div>;

      case "image/jpeg":
      case "image/png":
      case "image/gif":
        return (
          <div className="flex flex-col items-center">
            <img
              src={fileData}
              alt="Certificate"
              className="max-w-full max-h-[450px] object-contain rounded-lg shadow-lg"
              onError={(e) => {
                console.error("Image load error");
                setError("Error loading image");
              }}
            />
          </div>
        );

      default:
        return (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-700">
              Preview not available for this file type ({certificate.mimeType})
            </p>
          </div>
        );
    }
  };

  return (
    <div className="certificate-viewer p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="mr-2 text-blue-600" size={24} />
          <h2 className="text-lg font-semibold truncate">
            {certificate.fileName || "Certificate"}
          </h2>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Download className="mr-2" size={20} />
              Download
            </>
          )}
        </button>
      </div>

      {renderFilePreview()}
    </div>
  );
};

export default CertificateViewer;
