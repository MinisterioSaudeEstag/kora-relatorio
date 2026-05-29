'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import React from 'react';
import dynamic from 'next/dynamic';

const PDFUpload = dynamic(() => import('./components/PDFUpload'), { 
  ssr: false 
});

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');
  const [userProfile, setUserProfile] = useState(null);
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      router.replace('/login');
      return;
    }

    const userData = localStorage.getItem('user_data');
    try {
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || 'Usuário');
        setUserProfile(user);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }

    const uploadedPdfs = localStorage.getItem('uploaded_pdfs');
    if (uploadedPdfs) {
      try {
        const pdfList = JSON.parse(uploadedPdfs);
        setPdfs(pdfList);
      } catch (error) {
        console.error('Erro ao carregar PDFs:', error);
      }
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#004a94]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const totalConversations = pdfs.reduce((sum, pdf) => sum + (pdf.conversations?.length || 0), 0);
  const recentPdfs = pdfs.slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="bg-[#004a94] rounded-xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Bem-vindo, {userProfile?.name || userName}! 👋
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl opacity-90">
                Acesse a inteligência de dados do Ministério da Saúde. Faça upload de seus documentos PDF e obtenha análises precisas e relatórios automatizados.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Documentos Indexados</h3>
            <p className="text-3xl font-bold text-[#004a94] dark:text-blue-400">{pdfs.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Total de Consultas</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalConversations}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Volume de Dados</h3>
            <p className="text-3xl font-bold text-blue-500 dark:text-blue-300">
              {((pdfs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0)) / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#004a94] rounded-full"></span>
            Enviar Novos Documentos
          </h2>
          <PDFUpload onUploadComplete={(newPDF) => setPdfs(prevPdfs => [newPDF, ...prevPdfs])} />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#004a94] rounded-full"></span>
            Histórico de Análises
          </h2>
          {recentPdfs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Nenhum documento processado recentemente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPdfs.map((pdf) => (
                <div key={pdf.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H4a2 2 0 01-2-2V5a2 2 0 012-2h5.582l4.923 4.923c.38.38.926.635 1.478.635h2.045a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h4.582" />
                      </svg>
                    </div>
                    <div className="flex-1 truncate">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{pdf.fileName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(pdf.fileSize / 1024).toFixed(2)} KB • {new Date(pdf.uploadDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}