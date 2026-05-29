'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Configuracao() {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    uploadAlerts: true,
    reportAlerts: true,
    weeklyDigest: false,
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteForm, setDeleteForm] = useState({ password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('dark_mode') === 'true';
    setSettings(prev => ({ ...prev, darkMode: savedDarkMode }));
    applyTheme(savedDarkMode);

    const notificationSettings = localStorage.getItem('notification_settings');
    if (notificationSettings) {
      try {
        const parsed = JSON.parse(notificationSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', isDark.toString());
  };

  const handleDarkModeToggle = () => {
    const newValue = !settings.darkMode;
    setSettings(prev => ({ ...prev, darkMode: newValue }));
    applyTheme(newValue);
    showMessage('success', 'Tema atualizado com sucesso');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleNotificationToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showMessage('error', 'Por favor, preencha a nova senha e a confirmação');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'As senhas não coincidem');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao alterar senha');

      showMessage('success', '✓ Senha alterada com sucesso');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteForm.password) {
      showMessage('error', 'Digite sua senha para confirmar');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deleteForm.password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar conta');
      }

      localStorage.clear();
      showMessage('success', '✓ Conta deletada. Redirecionando...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Erro ao salvar no servidor');

      localStorage.setItem('notification_settings', JSON.stringify(settings));
      showMessage('success', '✓ Configurações de notificações salvas');
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas preferências de acesso e segurança institucional</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md border animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#004a94]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" /></svg>
                Aparência do Sistema
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-900 dark:text-white">Modo de Visualização</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alterne entre o modo claro e escuro para melhor visibilidade</p>
                </div>
                <button
                  onClick={handleDarkModeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#004a94]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Segurança da Conta
              </h2>
            </div>
            <div className="p-6">
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md hover:border-[#004a94] transition group"
              >
                <p className="font-medium text-gray-900 dark:text-white flex items-center justify-between">
                  Alterar Senha de Acesso 
                  <svg className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </p>
              </button>

              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="mt-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Senha</label>
                      <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Nova Senha</label>
                      <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isLoading} className="flex-1 py-2 bg-[#004a94] text-white rounded-md hover:bg-blue-800 font-semibold transition text-sm">
                      {isLoading ? 'Processando...' : 'Atualizar Senha'}
                    </button>
                    <button type="button" onClick={() => setShowChangePassword(false)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 transition text-sm">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.872a2 2 0 002-2V5a2 2 0 00-2-2h-13a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Zona de Perigo
              </h2>
            </div>
            <div className="p-6">
              <button
                onClick={() => setShowDeleteAccount(!showDeleteAccount)}
                className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition group"
              >
                <p className="font-medium text-red-700 dark:text-red-400 flex items-center justify-between">
                  Excluir Conta Permanentemente
                  <svg className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </p>
              </button>

              {showDeleteAccount && (
                <div className="mt-4 p-4 bg-red-100/50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 space-y-4">
                  <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                    <strong>Atenção:</strong> Esta operação é irreversível. Todos os seus documentos, históricos de chat e preferências serão apagados permanentemente dos servidores.
                  </p>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-red-900 dark:text-red-200 uppercase">Confirme sua senha para prosseguir</label>
                    <input
                      type="password"
                      value={deleteForm.password}
                      onChange={(e) => setDeleteForm({ password: e.target.value })}
                      className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Sua senha"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" onClick={handleDeleteAccount} disabled={isLoading} className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-bold transition text-sm">
                      {isLoading ? 'Processando...' : 'Confirmar Exclusão'}
                    </button>
                    <button type="button" onClick={() => setShowDeleteAccount(false)} className="flex-1 py-2 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 transition text-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}