'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setIsAuth(true);

    const uploadedPdfs = localStorage.getItem('uploaded_pdfs');
    if (uploadedPdfs) {
      try {
        const pdfList = JSON.parse(uploadedPdfs);
        setPdfs(pdfList);
        if (pdfList.length > 0) {
          setSelectedPdf(pdfList[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar PDFs:', error);
      }
    }

    const savedMessages = localStorage.getItem('chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!selectedPdf && pdfs.length > 0) {
      setError('Por favor, selecione um documento PDF para fazer perguntas.');
      return;
    }

    if (pdfs.length === 0) {
      setError('Nenhum documento encontrado. Faça upload de um PDF primeiro.');
      return;
    }

    setError('');

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      pdfId: selectedPdf,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInputContent = input;
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/kora/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userInputContent,
          documentId: selectedPdf,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao processar pergunta');
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer, 
        timestamp: new Date().toISOString(),
        koraName: 'Kora',
        pdfId: selectedPdf,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setError(error.message || 'Erro ao processar sua pergunta');
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar o histórico de conversas?')) {
      setMessages([]);
      localStorage.removeItem('chat_history');
    }
  };

  const handleDownloadHistory = () => {
    const pdfFile = pdfs.find(p => p.id === selectedPdf);
    const pdfName = pdfFile?.fileName || 'DocumentoDesconhecido';
    
    const historyText = `HISTÓRICO de CONVERSA - ${pdfName}\n${'='.repeat(60)}\n\n${messages
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'VOCÊ' : 'IA'} (${new Date(msg.timestamp).toLocaleTimeString('pt-BR')}):\n${msg.content}`
      )
      .join('\n\n' + '-'.repeat(40) + '\n\n')}`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(historyText));
    element.setAttribute('download', `chat_${pdfName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004a94]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedPdfFile = pdfs.find(p => p.id === selectedPdf);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Fale com a Kora - Análise Inteligente
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione um documento institucional e faça perguntas para análise técnica.
          </p>
        </div>

        {pdfs.length > 0 ? (
          <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Documento Selecionado:
            </label>
            <div className="flex gap-3 flex-wrap">
              {pdfs.map((pdf) => (
                <button
                  key={pdf.id}
                  onClick={() => setSelectedPdf(pdf.id)}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    selectedPdf === pdf.id
                      ? 'bg-[#004a94] text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-[#004a94] transition-colors'
                  }`}
                >
                  <span className="truncate max-w-xs" title={pdf.fileName}>
                    📄 {pdf.fileName}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
              Tamanho: {selectedPdfFile && ((selectedPdfFile.fileSize / 1024).toFixed(2))} KB • Upload: {selectedPdfFile && new Date(selectedPdfFile.uploadDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        ) : (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Nenhum documento encontrado. <a href="/" className="underline font-bold">Faça upload de um PDF</a> para começar a análise.
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth min-h-100">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#004a94] dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Kora IA - Análise de Documentos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Selecione um arquivo acima e digite sua pergunta. A IA buscará as informações exatas dentro do documento.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        message.role === 'user'
                          ? 'bg-[#004a94] text-white rounded-2xl rounded-tr-none'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl rounded-tl-none'
                      } px-4 py-3 shadow-sm`}
                    >
                      <p className="text-sm mb-1 wrap-break-word">{message.content}</p>
                      <span
                        className={`text-[10px] block mt-1 ${
                          message.role === 'user'
                            ? 'text-blue-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-slate-800/50">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pdfs.length === 0 ? "Faça upload de um PDF para começar..." : "Digite sua pergunta técnica..."}
                disabled={isLoading || pdfs.length === 0}
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#004a94] outline-none transition"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || pdfs.length === 0}
                className="px-6 py-3 bg-[#004a94] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processando...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-2m6 2l6-2" /></svg> Enviar</>
                )}
              </button>
            </form>

            {messages.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap justify-end">
                <button
                  onClick={handleDownloadHistory}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Baixar Histórico
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded border border-red-100 dark:border-red-800 hover:bg-red-100 transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Limpar Chat
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-[#004a94] dark:text-blue-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 100 2h2a1 1 0 100-2H7zm2 5a1 1 0 11-2 0 1 1 0 012 0zm2-1a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" /></svg>
              <h3 className="font-bold text-sm uppercase tracking-wide">Instruções</h3>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Selecione o documento alvo no topo</li>
              <li>• Formule perguntas objetivas</li>
              <li>• A IA utiliza busca semântica (RAG)</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              <h3 className="font-bold text-sm uppercase tracking-wide">Capacidades</h3>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Leitura de PDFs extensos</li>
              <li>• Extração de dados precisos</li>
              <li>• Sincronização de histórico</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 7H7v6h6V7z" /><path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a1 1 0 112 0v1a2 2 0 012 2v2h1a2 2 0 012 2v2h1a2 2 0 012 2v6a2 2 0 01-2 2h-1v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H4a2 2 0 01-2-2v-6a2 2 0 012-2h1V9a2 2 0 012-2h2V6a2 2 0 012-2h1V2z" clipRule="evenodd" /></svg>
              <h3 className="font-bold text-sm uppercase tracking-wide">Recursos</h3>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Exportação de conversas (.txt)</li>
              <li>• Interface responsiva</li>
              <li>• Suporte a Modo Escuro</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}