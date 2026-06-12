import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Giriş yapılıyor...");
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.update(toastId, { render: "Hoş geldiniz! Yönlendiriliyorsunuz...", type: "success", isLoading: false, autoClose: 2000 });
      
      setTimeout(() => {
        if (response.data.role === 'ROLE_PROVIDER') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      toast.update(toastId, { render: "E-posta veya şifre hatalı!", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8 relative">
      <ToastContainer position="top-right" theme="colored" />

      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-gray-500 hover:text-slate-900 font-bold transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
      </Link>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 z-10 relative">
        
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hoş Geldiniz 👋</h2>
            <p className="mt-2 text-sm font-medium text-gray-500">Randevularınızı yönetmek için giriş yapın.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">E-Posta Adresi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm font-medium text-gray-800 bg-gray-50/50"
                placeholder="ornek@mail.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-gray-700">Şifre</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm font-medium text-gray-800 bg-gray-50/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99]"
            >
              Giriş Yap
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
              Hemen Kayıt Ol
            </Link>
          </div>
        </div>

        <div className="hidden md:flex w-full md:w-1/2 bg-slate-950 p-12 lg:p-16 flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-slate-800 rounded-full opacity-50 blur-3xl pointer-events-none z-0"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Schedulify<span className="text-blue-400">Pro</span></h1>
            <p className="text-slate-300 text-lg mb-10 font-medium leading-relaxed">
              Sağlık profesyonelleri ve hastalar için tasarlanmış yeni nesil akıllı randevu yönetim sistemi.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-3 text-slate-100 font-medium">
                <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                <span>Anında randevu onayı ve otomatik e-posta bildirimleri.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-100 font-medium">
                <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                <span>Doktorlara özel gelişmiş kontrol paneli ve hasta geçmişi.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-100 font-medium">
                <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                <span>Tamamlanan seanslar için şeffaf değerlendirme sistemi.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}