'use client';

import { useState } from 'react';
import Image from "next/image";

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setTotalFiles(files.length);
    setUploadProgress(0);
    
    try {
      // Upload all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        setUploadProgress(i + 1);
      }

      // After all files are uploaded, make a single API call
      const pdfResponse = await fetch('http://localhost:4111/api/workflows/kycWorkflow/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/Users/myhq/Documents/truffles-fe/public/docs'
        }),
      });


      if (!pdfResponse.ok) {
        throw new Error('PDF generation failed');
      }

      const data = await pdfResponse.json();
      setPdfUrl(data.pdfUrl);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Multiple File Upload and PDF Generation</h1>
          <div className="flex flex-col gap-4">
            <input
              type="file"
              onChange={handleFileUpload}
              multiple
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
            {isLoading && (
              <div className="mt-4">
                <p>Uploading files: {uploadProgress} of {totalFiles}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-violet-600 h-2.5 rounded-full" 
                    style={{ width: `${(uploadProgress / totalFiles) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {pdfUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Generated PDF</h2>
            <iframe
              src={pdfUrl}
              className="w-full h-[600px] border rounded-lg"
              title="Generated PDF"
            />
          </div>
        )}
      </main>
    </div>
  );
}
