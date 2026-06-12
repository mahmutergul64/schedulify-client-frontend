import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { ArrowLeft, KeyRound } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSendLink = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sıfırlama linki oluşturuluyor...");

    try {
      await axios.post('https://schedulify-backend-dgce.onrender.com/api/auth/forgot-password', { email });
      toast.update(toastId, { render: "Sıfırlama linki e-posta adresinize gönderildi! 📩", type: "success", isLoading: false, autoClose: 5000 });
    } catch (error) {
      const msg = error.response ? error.response.data : "Bir hata oluştu.";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 4000 });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      <ToastContainer position="top-right" theme="colored" />

      <Link 
        to="/login" 
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-gray-500 hover:text-slate-900 font-bold transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Giriş Ekranına Dön
      </Link>

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-10 relative">
        
        <div className="text-center mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl w-16 h-16 flex items-center justify-center text-slate-900 mx-auto mb-4 border border-gray-100">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Şifrenizi mi Unuttunuz?</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Endişelenmeyin. Kayıtlı e-posta adresinizi girin, size hemen bir sıfırlama linki gönderelim.</p>
        </div>

        <form onSubmit={handleSendLink} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">E-Posta Adresiniz</label>
            <input 
              type="email" 
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-medium text-gray-800 text-sm bg-gray-50/50"
            />
          </div>

          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99]">
            Sıfırlama Linki Gönder
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-600">
            Şifrenizi hatırladınız mı?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
              Giriş Yapın
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}