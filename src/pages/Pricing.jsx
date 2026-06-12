import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Shield, Crown, Zap, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Pricing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const handleSubscribe = async () => {
    if (!currentUser) {
      toast.error("VIP üyeliğe geçmek için önce giriş yapmalısınız.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await axios.put(`http://localhost:8080/api/subscription/upgrade/${currentUser.id}`);
      
      const updatedUser = res.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success("Tebrikler! Artık VIP Üyesiniz.");
      setTimeout(() => {
        window.location.href = '/my-appointments';
      }, 2000);

    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      <Navbar />
      <ToastContainer position="top-right" theme="colored" />

      <div className="absolute inset-0 z-0 opacity-[0.35] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" patternUnits="userSpaceOnUse" width="32" height="32">
              <circle cx="1" cy="1" r="1" fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 py-20 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-bold px-4 py-2 rounded-full mb-6 border border-amber-200">
            <Crown className="w-4 h-4 fill-amber-500" /> SchedulifyPro Plus
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Sağlığınıza <span className="text-blue-600">Premium</span> Dokunuş
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Sıra beklemeden randevu alın, uzmanlarla sınırsız mesajlaşın ve sağlığınızı güvence altına alın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col transition-transform hover:-translate-y-2 duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-2">Standart Üye</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Sadece ihtiyaç anında kullanım için idealdir.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-slate-900">Ücretsiz</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                <Check className="w-5 h-5 text-emerald-500" /> Binlerce uzmana erişim
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                <Check className="w-5 h-5 text-emerald-500" /> Standart randevu takvimi
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                <Check className="w-5 h-5 text-emerald-500" /> E-Reçete görüntüleme
              </li>
              <li className="flex items-center gap-3 text-slate-400 font-medium text-sm opacity-50">
                <X className="w-5 h-5" /> Uzmanlarla canlı mesajlaşma
              </li>
              <li className="flex items-center gap-3 text-slate-400 font-medium text-sm opacity-50">
                <X className="w-5 h-5" /> Acil / Öncelikli randevu hakkı
              </li>
            </ul>
            <button 
              disabled
              className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-xl border border-slate-200"
            >
              Mevcut Planınız
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative flex flex-col transform scale-105 transition-transform hover:-translate-y-2 duration-300">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                En Popüler
              </span>
            </div>
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" /> VIP Üye
            </h3>
            <p className="text-slate-400 text-sm font-medium mb-6">Sağlığına en yüksek değeri verenler için.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">1.250₺</span>
              <span className="text-slate-400 font-medium"> / ay</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3 text-slate-200 font-medium text-sm">
                <Check className="w-5 h-5 text-amber-400" /> Uzmanlarla 7/24 <strong className="text-white">Canlı Mesajlaşma</strong>
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium text-sm">
                <Check className="w-5 h-5 text-amber-400" /> Her ay <strong className="text-white">2 Ücretsiz Seans</strong> hakkı
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium text-sm">
                <Check className="w-5 h-5 text-amber-400" /> Takvimde <strong className="text-white">Öncelikli Randevu</strong>
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium text-sm">
                <Check className="w-5 h-5 text-amber-400" /> Profilde <strong className="text-white">Altın VIP Rozeti</strong>
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium text-sm">
                <Check className="w-5 h-5 text-amber-400" /> AI Destekli Detaylı Analizler
              </li>
            </ul>
            <button 
              onClick={handleSubscribe}
              disabled={isProcessing || currentUser?.isVip}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
              ) : currentUser?.isVip ? (
                <>Zaten VIP Üyesiniz <Check className="w-5 h-5" /></>
              ) : (
                <>Stripe İle Güvenli Öde <Zap className="w-5 h-5" /></>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Stripe 256-bit SSL Güvencesiyle
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}