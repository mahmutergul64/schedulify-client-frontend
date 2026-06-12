import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, ArrowLeft, CreditCard, Lock, ShieldCheck, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import 'react-toastify/dist/ReactToastify.css';

export default function Booking() {
  const params = useParams();
  const navigate = useNavigate();
  const routeId = params.id || params.doctorId || params.providerId || Object.values(params)[0];

  const [provider, setProvider] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const { t } = useLanguage();

  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const appointmentPrice = "1.250 TL";

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ROLE_CLIENT') {
      toast.error("Randevu almak için hasta hesabıyla giriş yapmalısınız.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    if (!routeId) {
      toast.error("Geçersiz URL parametresi.");
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    axios.get(`https://schedulify-backend-dgce.onrender.com/api/users/providers`)
      .then(res => {
        const found = res.data.find(d => String(d.id) === String(routeId));
        if (found) {
          setProvider(found);
        } else {
          toast.error("Seçtiğiniz uzman sistemde bulunamadı.");
          setTimeout(() => navigate('/'), 2000);
        }
      })
      .catch(err => {
        toast.error("Veriler çekilirken bir hata oluştu.");
        setTimeout(() => navigate('/'), 2000);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [routeId, currentUser, navigate]);

  const handleFormatCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    setCardNumber(formattedValue.substring(0, 19));
  };

  const handleFormatExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value.substring(0, 5));
  };

  const handleProceedToPayment = () => {
    if (!date || !time) {
      toast.error("Lütfen bir tarih ve saat seçin.");
      return;
    }
    
    const selectedDate = new Date(date);
    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      toast.error("Hafta sonu randevu alınamaz! Lütfen hafta içi bir gün seçin.");
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3 || cardName.length < 3) {
      toast.error("Lütfen geçerli kart bilgileri girin.");
      return;
    }

    setIsProcessing(true);

    setTimeout(async () => {
      try {
        const start = `${date}T${time}:00`;
        const endHour = String(parseInt(time.split(':')[0]) + 1).padStart(2, '0');
        const end = `${date}T${endHour}:00:00`;

        await axios.post('https://schedulify-backend-dgce.onrender.com/api/appointments/book', {
          clientId: currentUser.id,
          providerId: provider.id,
          startTime: start,
          endTime: end
        });

        setIsProcessing(false);
        setShowPayment(false);
        toast.success("Ödeme başarılı! Randevunuz oluşturuldu.", { autoClose: 2000 });
        setTimeout(() => navigate('/my-appointments'), 2000);
        
      } catch (error) {
        setIsProcessing(false);
        const errorMsg = error.response && typeof error.response.data === 'string' ? error.response.data : "Randevu alınırken hata oluştu.";
        toast.error(errorMsg);
        setShowPayment(false);
      }
    }, 2500); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col font-sans relative overflow-hidden transition-colors">
        <Navbar />
        <ToastContainer position="top-right" theme="colored" />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col font-sans relative overflow-hidden transition-colors duration-300">
      <Navbar />
      <ToastContainer position="top-right" theme="colored" />

      <div className="w-full max-w-4xl mx-auto px-4 pb-20 pt-10 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> {t('book.back')}
        </button>

        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800/80 overflow-hidden animate-fade-in transition-colors">
          <div className="p-8 sm:p-10 border-b border-gray-100 dark:border-slate-800/80 bg-slate-900 dark:bg-slate-800 text-white flex flex-col sm:flex-row items-center gap-6 transition-colors">
            {provider.avatarUrl ? (
              <img src={`https://schedulify-backend-dgce.onrender.com/uploads/${provider.avatarUrl}`} alt={provider.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 dark:border-slate-700" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center border-4 border-slate-700 dark:border-slate-600 transition-colors">
                <span className="text-3xl font-black text-slate-300">{provider.fullName.charAt(0)}</span>
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-black tracking-tight">{provider.fullName}</h1>
              <p className="text-blue-400 font-bold mt-1">{provider.specialty || t('home.general')}</p>
            </div>
            <div className="sm:ml-auto bg-slate-800 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-700 dark:border-slate-700/50 text-center min-w-[140px] transition-colors">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('book.fee')}</p>
              <p className="text-2xl font-black text-white">{appointmentPrice}</p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
              <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> {t('book.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t('book.date_label')}</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:border-slate-900 dark:focus:border-blue-500 outline-none transition-all font-bold text-slate-800 dark:text-white bg-gray-50/50 dark:bg-slate-800/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t('book.time_label')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((t_time) => (
                    <button
                      key={t_time}
                      onClick={() => setTime(t_time)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border ${time === t_time ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      {t_time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-end transition-colors">
              <button 
                onClick={handleProceedToPayment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                {t('book.pay_btn')} <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col border border-transparent dark:border-slate-800">
            
            <div className="bg-slate-900 dark:bg-slate-800 p-6 text-white relative transition-colors">
              <button onClick={() => !isProcessing && setShowPayment(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-black">Güvenli Ödeme</h3>
              </div>
              <p className="text-slate-400 text-sm font-medium">Randevunuzu kesinleştirmek için işlemi tamamlayın.</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-8 space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 flex items-center justify-between mb-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                    <CalendarIcon className="w-5 h-5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tarih / Saat</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(date).toLocaleDateString('tr-TR')} - {time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tutar</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">{appointmentPrice}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Kart Üzerindeki İsim</label>
                <input 
                  type="text" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  required
                  disabled={isProcessing}
                  placeholder="AD SOYAD"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Kart Numarası</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={handleFormatCardNumber}
                    required
                    disabled={isProcessing}
                    placeholder="0000 0000 0000 0000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 tracking-widest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Son Kul. (AA/YY)</label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={handleFormatExpiry}
                    required
                    disabled={isProcessing}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 text-center tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">CVC</label>
                  <input 
                    type="text" 
                    maxLength="3"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={isProcessing}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 text-center tracking-widest"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className={`w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'}`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500 dark:border-slate-400"></div> İşleniyor...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> {appointmentPrice} Öde ve Onayla
                  </>
                )}
              </button>
            </form>
            
          </div>
        </div>
      )}

    </div>
  );
}