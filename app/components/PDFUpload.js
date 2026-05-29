'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PDFUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Por favor, selecione um arquivo PDF.');
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Por favor, selecione um arquivo PDF.');
    }
  }, []);

  const extractTextFromPdf = async (file) => {
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ 
        data: arrayBuffer, 
        disableFontFace: true, 
        stopAtPages: 0         
      });
      
      const pdf = await loadingTask.promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + "\n";
      }
      
      return fullText;
    } catch (err) {
      console.error("Erro detalhado na extração:", err);
      throw new Error("O navegador não conseguiu processar o PDF.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Sessão expirada. Por favor, faça login novamente.');

      const formData = new FormData();
      formData.append('file', file);
      setProgress(30);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro no upload do arquivo');

      const documentId = data.document.id;
      setProgress(50);

      const extractedText = await extractTextFromPdf(file);
      setProgress(70);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('O PDF não contém texto extraível.');
      }

      const saveResponse = await fetch('/api/kora/save-pdf-text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ documentId, text: extractedText }),
      });

      if (!saveResponse.ok) console.warn('Aviso: Texto extraído, mas não salvo no banco.');

      const newPDF = {
        id: documentId,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        conversations: [],
      };

      const pdfs = JSON.parse(localStorage.getItem('uploaded_pdfs') || '[]');
      pdfs.unshift(newPDF);
      localStorage.setItem('uploaded_pdfs', JSON.stringify(pdfs));
      
      setProgress(100);
      setSuccess(true);
      
      if (onUploadComplete) {
        onUploadComplete(newPDF);
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar arquivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          {!success ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
                }`}
              >
                <input id="file-input" type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-10 w-10 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="text-gray-900 dark:text-white font-medium">Arraste seu PDF ou clique aqui</p>
                    <p className="text-sm text-gray-500">Máximo 10MB por arquivo</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    {progress < 50 ? 'Enviando arquivo...' : progress < 80 ? 'Extraindo texto...' : 'Finalizando...'} {progress}%
                  </p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</> : <><Upload className="h-4 w-4" /> Processar PDF</>}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4 py-6">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">Documento processado!</p>
                <p className="text-sm text-gray-500">Agora você pode conversar com seu PDF.</p>
              </div>
              <button 
                onClick={() => { setFile(null); setSuccess(false); setProgress(0); setError(null); }} 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
              >
                Carregar outro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}