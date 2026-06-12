import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isStrongEnough = isMinLength && hasNumber && hasUppercase;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isStrongEnough) {
      toast.error("Lütfen tüm şifre kriterlerini karşılayın!");
      return;
    }
    const toastId = toast.loading("Şifreniz güncelleniyor...");
    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', { 
        token: token, 
        password: password 
      });
      toast.update(toastId, { render: "Şifreniz yenilendi! Giriş ekranına yönlendiriliyorsunuz.", type: "success", isLoading: false, autoClose: 3000 });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      const msg = error.response && typeof error.response.data === 'string' ? error.response.data : "Link geçersiz veya süresi dolmuş.";
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
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Yeni Şifre Belirle</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Hesabınızın güvenliği için güçlü bir şifre kombinasyonu oluşturun.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Yeni Şifreniz</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-bold text-slate-800 bg-gray-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-2.5">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Şifre Kriterleri</p>
            
            <div className="flex items-center gap-2 text-xs font-bold transition-colors">
              <CheckCircle2 className={`w-4 h-4 ${isMinLength ? 'text-emerald-500' : 'text-gray-300'}`} />
              <span className={isMinLength ? 'text-emerald-700' : 'text-gray-500'}>En az 8 karakter uzunluğunda</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold transition-colors">
              <CheckCircle2 className={`w-4 h-4 ${hasNumber ? 'text-emerald-500' : 'text-gray-300'}`} />
              <span className={hasNumber ? 'text-emerald-700' : 'text-gray-500'}>En az 1 adet rakam (0-9)</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold transition-colors">
              <CheckCircle2 className={`w-4 h-4 ${hasUppercase ? 'text-emerald-500' : 'text-gray-300'}`} />
              <span className={hasUppercase ? 'text-emerald-700' : 'text-gray-500'}>En az 1 adet büyük harf (A-Z)</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!isStrongEnough}
            className={`w-full font-bold py-3.5 rounded-xl shadow-md transition-all ${
              isStrongEnough 
                ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.99]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            Şifreyi Güncelle ve Kilitle
          </button>
        </form>
      </div>
    </div>
  );
}