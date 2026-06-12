import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Eye, EyeOff, User, Stethoscope, ArrowLeft } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {
  const [role, setRole] = useState('ROLE_CLIENT'); 
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        fullName,
        email,
        password,
        role 
      });
      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Kayıt işlemi başarısız. Lütfen tekrar deneyin.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <ToastContainer position="top-right" theme="colored" />

      <div className="w-full max-w-4xl absolute top-6 left-6 md:static md:mb-6 md:self-start md:ml-auto md:mr-auto pl-4">
         <Link to="/" className="text-slate-500 hover:text-slate-900 font-bold text-sm flex items-center gap-2 transition-colors">
           <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
         </Link>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden border border-gray-100 z-10">
        
        <div className="w-full md:w-5/12 bg-slate-900 p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Kariyerinizi ve <span className="text-blue-400">Sağlığınızı</span> Yönetin
          </h2>
          <p className="text-slate-400 font-medium mb-10 text-sm">
            Binlerce mutlu kullanıcıya katılın. Randevularınızı tek bir ekrandan kolayca organize edin.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-1 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-slate-300 font-medium text-sm">7/24 Kesintisiz online randevu sistemi.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-1 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-slate-300 font-medium text-sm">Kişisel verileriniz üst düzey şifrelemeyle güvende.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-1 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-slate-300 font-medium text-sm">Tamamen ücretsiz ve reklamsız hasta arayüzü.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-7/12 p-10 sm:p-12 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">Yeni Hesap Oluştur</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Saniyeler içinde aramıza katılın.</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setRole('ROLE_CLIENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${role === 'ROLE_CLIENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User className="w-4 h-4" /> Hasta
            </button>
            <button
              type="button"
              onClick={() => setRole('ROLE_PROVIDER')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${role === 'ROLE_PROVIDER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Stethoscope className="w-4 h-4" /> Doktor
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Ad Soyad</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">E-Posta Adresi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-medium text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center mt-2"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : "Hesabımı Oluştur"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Zaten hesabınız var mı? <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700">Giriş Yap</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}