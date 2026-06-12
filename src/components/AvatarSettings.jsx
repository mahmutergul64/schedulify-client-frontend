import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Trash2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';

export default function AvatarSettings({ user, onAvatarUpdate }) {
  const [currentAvatar, setCurrentAvatar] = useState(user.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useLanguage();

  const updateLocalStorage = (newUrl) => {
    const updatedUser = { ...user, avatarUrl: newUrl };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentAvatar(newUrl);
    onAvatarUpdate(updatedUser); 
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yükleyebilirsiniz.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    const toastId = toast.loading("Profil fotoğrafınız yükleniyor...");

    try {
      const res = await axios.post(`http://localhost:8080/api/profile/${user.id}/avatar`, formData);
      updateLocalStorage(res.data);
      toast.update(toastId, { render: "Fotoğraf başarıyla güncellendi!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(toastId, { render: "Fotoğraf yüklenirken hata oluştu.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Profil fotoğrafınızı silmek istediğinize emin misiniz?")) return;
    const toastId = toast.loading("Fotoğrafınız siliniyor...");

    try {
      await axios.delete(`http://localhost:8080/api/profile/${user.id}/avatar`);
      updateLocalStorage(null);
      toast.update(toastId, { render: "Fotoğraf başarıyla silindi.", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(toastId, { render: "Fotoğraf silinirken hata oluştu.", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-gray-100 dark:border-slate-800/80 mb-8 animate-fade-in transition-colors">
      
      <div className="flex items-center justify-center shrink-0">
        {currentAvatar ? (
          <img 
            src={`http://localhost:8080/uploads/${currentAvatar}`} 
            alt="Profil" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/20"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
            <User className="w-12 h-12" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 text-center sm:text-left">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{t('avatar.title')}</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 transition-colors">{t('avatar.desc')}</p>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <label className={`inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer ${isUploading ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed' : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 shadow-md active:scale-95'}`}>
            <Upload className="w-4 h-4" />
            {currentAvatar ? t('avatar.change') : t('avatar.upload')}
            <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} accept="image/*" />
          </label>
          
          {currentAvatar && (
            <button 
              onClick={handleDelete}
              className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
            >
              <Trash2 className="w-4 h-4" />
              {t('avatar.remove')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}