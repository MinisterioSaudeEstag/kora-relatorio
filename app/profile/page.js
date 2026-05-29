'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, AlertCircle } from 'lucide-react'; 

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) { window.location.href = '/login'; return; }

        const response = await fetch('/api/user/avatar', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erro ao carregar perfil');

        const data = await response.json();
        const profileUser = data.user;
        
        setUser(profileUser);
        setFormData({
          name: profileUser.name || '',
          email: profileUser.email || '',
          phone: profileUser.phone || '',
          location: profileUser.location || '',
        });
        localStorage.setItem('user_data', JSON.stringify(profileUser));
      } catch (error) {
        setError('Erro ao carregar dados do perfil');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.name.trim()) { setError('Nome é obrigatório'); return; }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar alterações');

      const data = await response.json();
      const updatedUser = data.user;

      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // AVISA O HEADER PARA ATUALIZAR
      window.dispatchEvent(new Event('profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Erro ao subir foto');

      const data = await response.json();
      const updatedUser = { ...user, avatar: data.avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      // AVISA O HEADER PARA ATUALIZAR
      window.dispatchEvent(new Event('profileUpdated'));
      setSuccess('Foto atualizada!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading || !user) {
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações de acesso institucional</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center shadow-sm">
              <div className="relative w-32 h-32 mx-auto mb-6 group">
                {avatarPreview || user?.avatar ? (
                  <img src={avatarPreview || user?.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-slate-800 shadow-md" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center shadow-inner">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
                )}

                <label className="absolute bottom-1 right-1 w-8 h-8 bg-[#004a94] rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-blue-700 transition shadow-lg">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h12a2 2 0 012 2v6.5a2.5 2.5 0 01-2.5 2.5H5.5A2.5 2.5 0 013 15.5v-6z" /></svg>
                </label>

                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 mb-6">{user?.email}</p>

              <div className="space-y-3">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 bg-[#004a94] text-white rounded-md hover:bg-[#003366] font-medium transition shadow-sm">
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5" /> {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-3">
                <CheckCircle className="h-5 w-5" /> {success}
              </div>
            )}

            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome Completo</label>
                  <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={!isEditing} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Institucional</label>
                  <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!isEditing} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Localização</label>
                    <input type="text" name="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} disabled={!isEditing} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition outline-none" />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-slate-800">
                  <button type="submit" disabled={isSaving} className="flex-1 px-6 py-2 bg-[#004a94] text-white rounded-md hover:bg-blue-800 font-medium transition disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 px-6 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 rounded-md hover:bg-gray-200 transition font-medium">
                    Cancelar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
