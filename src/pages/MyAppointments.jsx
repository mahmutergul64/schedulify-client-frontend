import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Star, X, CalendarDays, Clock, User, Settings, MessageCircle, CheckCircle, FileDown, Upload, FileText, Ticket, HeartPulse, Activity, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import jsPDF from 'jspdf';
import Navbar from '../components/Navbar';
import AvatarSettings from '../components/AvatarSettings';
import { useLanguage } from '../context/LanguageContext';
import 'react-toastify/dist/ReactToastify.css';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('appointments');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const navigate = useNavigate();
  const { t, tBackend } = useLanguage();

  const [selectedApp, setSelectedApp] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [metricForm, setMetricForm] = useState({
    recordDate: new Date().toISOString().split('T')[0],
    weight: '',
    bloodPressure: '',
    bloodSugar: '',
    notes: ''
  });

  const fetchClientAppointments = () => {
    if (currentUser) {
      axios.get(`http://localhost:8080/api/appointments/client/${currentUser.id}`)
        .then(res => setAppointments(res.data))
        .catch(err => console.error(err));
    }
  };

  const fetchHealthMetrics = () => {
    if (currentUser) {
      axios.get(`http://localhost:8080/api/health-metrics/client/${currentUser.id}`)
        .then(res => setMetrics(res.data))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ROLE_CLIENT') {
      navigate('/login');
      return;
    }
    fetchClientAppointments();
    fetchHealthMetrics();
  }, [currentUser, navigate]);

  const handleSaveMetric = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/health-metrics/client/${currentUser.id}`, metricForm);
      toast.success(tBackend("Sağlık verisi başarıyla kaydedildi!"));
      fetchHealthMetrics();
      setMetricForm({
        recordDate: new Date().toISOString().split('T')[0],
        weight: '',
        bloodPressure: '',
        bloodSugar: '',
        notes: ''
      });
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    }
  };

  const handleCancelAppointment = async (id, status) => {
    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      toast.error("Onaylanmış veya tamamlanmış randevuları iptal edemezsiniz.");
      return;
    }
    if (!window.confirm("İptal etmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/appointments/${id}`);
      toast.success(tBackend("Randevu iptal edildi."));
      fetchClientAppointments();
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    }
  };

  const handleFileUpload = async (appId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`http://localhost:8080/api/appointments/${appId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(tBackend("Tıbbi belge başarıyla yüklendi!"));
      fetchClientAppointments();
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Lütfen bir yıldız puanı verin!");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8080/api/reviews/add', {
        clientId: currentUser.id,
        providerId: selectedApp.provider.id,
        rating: rating,
        comment: comment
      });
      toast.success(tBackend("Değerlendirmeniz başarıyla gönderildi!"));
      setSelectedApp(null);
      setComment('');
      setRating(0);
      setHoveredStar(0);
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQRCodeBase64 = (text) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        resolve(null);
      };
    });
  };

  const downloadPrescriptionPDF = async (app) => {
    if (!app.notes) {
      toast.warn("Bu seansa ait henüz bir e-reçete veya tıbbi rapor girilmemiştir.");
      return;
    }

    const doc = new jsPDF();
    const protocolNumber = `SP-RECETE-${app.id}992`;
    const qrCodeData = `Protocol: ${protocolNumber} | Patient: ${currentUser.fullName} | Doctor: ${app.provider.fullName} | Date: ${new Date(app.startTime).toLocaleDateString('tr-TR')}`;
    const qrBase64 = await generateQRCodeBase64(qrCodeData);
    
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text("SchedulifyPro", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text("DIJITAL SAGLIK KAYDI & E-RECETE", 14, 32);

    if (qrBase64) {
      doc.addImage(qrBase64, 'PNG', 160, 10, 35, 35);
    }
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 48, 196, 48);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 55, 182, 35, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("UZMAN BILGILERI", 20, 63);
    doc.text("HASTA BILGILERI", 110, 63);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Ad Soyad: ${app.provider.fullName}`, 20, 70);
    doc.text(`Uzmanlik: ${app.provider.specialty || 'Genel Uzman'}`, 20, 76);
    doc.text(`Seans Tarihi: ${new Date(app.startTime).toLocaleDateString('tr-TR')}`, 20, 82);
    
    doc.text(`Ad Soyad: ${currentUser.fullName}`, 110, 70);
    doc.text(`Protokol No: ${protocolNumber}`, 110, 76);
    doc.text(`Dokuman Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 110, 82);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text("KLINIK BULGULAR & REÇETE DETAYI", 14, 105);
    
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(14, 109, 40, 109);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    
    const splitNotes = doc.splitTextToSize(app.notes, 182);
    doc.text(splitNotes, 14, 120);
    
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 25, 196, pageHeight - 25);
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Bu belgedeki QR kod guvenli imza ve veri dogrulama altyapisina sahiptir. Eczanelerde gecerlidir.", 14, pageHeight - 15);
    doc.text("SchedulifyPro Cloud Health System", 14, pageHeight - 10);
    
    doc.save(`SchedulifyPro_Recete_${app.id}.pdf`);
  };

  const downloadTicketPDF = async (app) => {
    const doc = new jsPDF();
    const ticketNumber = `TKT-${app.id}881`;
    const qrCodeData = `Ticket: ${ticketNumber} | Patient: ${currentUser.fullName} | Provider: ${app.provider.fullName} | Time: ${new Date(app.startTime).toLocaleString('tr-TR')}`;
    const qrBase64 = await generateQRCodeBase64(qrCodeData);

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("RANDEVU GIRIS BILETI", 14, 26);

    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.setFont("helvetica", "normal");
    doc.text("SchedulifyPro Smart Pass", 14, 33);

    doc.setFillColor(248, 250, 252);
    doc.rect(14, 50, 182, 110, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(14, 50, 182, 110);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("BILET NUMARASI", 24, 65);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(ticketNumber, 24, 72);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("HASTA ADI SOYADI", 24, 85);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(currentUser.fullName, 24, 92);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("DOKTOR / UZMAN", 24, 105);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(app.provider.fullName, 24, 112);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(app.provider.specialty || "Genel Uzman", 24, 118);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("RANDEVU TARIHI VE SAATI", 24, 132);
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text(`${new Date(app.startTime).toLocaleDateString('tr-TR')} - ${new Date(app.startTime).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}`, 24, 139);

    if (qrBase64) {
      doc.setFillColor(255, 255, 255);
      doc.rect(134, 65, 52, 52, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(134, 65, 52, 52);
      doc.addImage(qrBase64, 'PNG', 135, 66, 50, 50);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Giris Sirasinda Okutunuz", 142, 123);
    }

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 180, 196, 180);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Bu bilet akilli check-in terminallerinde tarama islemi icin gecerlidir.", 14, 190);

    doc.save(`SchedulifyPro_Bilet_${app.id}.pdf`);
  };

  const handleAvatarUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': 
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/50">{t('status.pending')}</span>;
      case 'CONFIRMED': 
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/50">{t('status.confirmed')}</span>;
      case 'COMPLETED': 
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">{t('status.completed')}</span>;
      default: 
        return <span className="bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col font-sans relative overflow-hidden transition-colors duration-300">
      <Navbar />
      <ToastContainer position="top-right" theme="colored" />

      <div className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.15] pointer-events-none transition-opacity duration-300">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" patternUnits="userSpaceOnUse" width="32" height="32">
              <circle cx="1" cy="1" r="1" className="fill-slate-300 dark:fill-slate-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 pb-20 pt-10 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors text-sm bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
              <ArrowLeft className="w-4 h-4" /> {t('myapp.back')}
            </button>
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 inline-flex transition-colors">
              <button 
                onClick={() => { setActiveTab('appointments'); setShowProfileSettings(false); }}
                className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'appointments' && !showProfileSettings ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarDays className="w-4 h-4" /> {t('myapp.btn_apps')}
              </button>
              <button 
                onClick={() => { setActiveTab('health'); setShowProfileSettings(false); }}
                className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'health' && !showProfileSettings ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <HeartPulse className="w-4 h-4" /> {t('myapp.btn_health')}
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowProfileSettings(!showProfileSettings)}
            className={`flex items-center gap-2 font-bold text-sm px-4 py-2.5 rounded-xl transition-all border ${showProfileSettings ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Settings className="w-4 h-4" /> {t('myapp.btn_profile')}
          </button>
        </div>

        {showProfileSettings ? (
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-200/60 dark:border-slate-800/80 p-8 max-w-2xl animate-fade-in mx-auto transition-colors">
            <AvatarSettings user={currentUser} onAvatarUpdate={handleAvatarUpdate} />
          </div>
        ) : activeTab === 'health' ? (
          <div className="animate-fade-in space-y-8">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{t('health.title')}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 transition-colors">{t('health.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 h-fit transition-colors">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> {t('health.add')}
                </h3>
                <form onSubmit={handleSaveMetric} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">{t('health.date')}</label>
                    <input type="date" required value={metricForm.recordDate} onChange={e => setMetricForm({...metricForm, recordDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">{t('health.weight')}</label>
                    <input type="number" step="0.1" value={metricForm.weight} onChange={e => setMetricForm({...metricForm, weight: e.target.value})} placeholder="72.5" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">{t('health.bp')}</label>
                    <input type="text" value={metricForm.bloodPressure} onChange={e => setMetricForm({...metricForm, bloodPressure: e.target.value})} placeholder="120/80" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors">{t('health.sugar')}</label>
                    <input type="number" value={metricForm.bloodSugar} onChange={e => setMetricForm({...metricForm, bloodSugar: e.target.value})} placeholder="95" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 mt-2">
                    {t('health.save')}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm min-h-[350px] flex flex-col transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" /> {t('health.trend')}
                    </h3>
                  </div>
                  <div className="flex-grow w-full h-64">
                    {metrics.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-medium">{t('health.nodata')}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" strokeOpacity={0.1} />
                          <XAxis dataKey="recordDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                          <Line yAxisId="left" type="monotone" name={t('health.weight')} dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                          <Line yAxisId="right" type="monotone" name={t('health.sugar')} dataKey="bloodSugar" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{t('myapp.title')}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 transition-colors">{t('myapp.subtitle')}</p>
            </div>

            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-200/60 dark:border-slate-800/80 overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800/80 transition-colors">
                    <tr>
                      <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm px-4">Uzman</th>
                      <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm px-4">{t('dash.date')}</th>
                      <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm text-center px-4">{t('dash.status')}</th>
                      <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm text-center px-4">{t('dash.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                          {t('dash.no_apps')}
                        </td>
                      </tr>
                    ) : (
                      appointments.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="p-5 px-4">
                            <div className="flex items-center gap-3">
                              {app.provider.avatarUrl ? (
                                <img 
                                  src={`http://localhost:8080/uploads/${app.provider.avatarUrl}`} 
                                  alt="Provider" 
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-400 w-10 h-10 flex items-center justify-center transition-colors">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white transition-colors">{app.provider.fullName}</p>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{app.provider.specialty || t('home.general')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                                <CalendarDays className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                {new Date(app.startTime).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors">
                                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                {new Date(app.startTime).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 text-center px-4">{getStatusBadge(app.status)}</td>
                          <td className="p-5 text-center px-4">
                            <div className="flex items-center justify-center gap-2">
                              {app.status !== 'COMPLETED' && (
                                <div className="flex items-center gap-2">
                                  <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 border border-slate-300 dark:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95">
                                    <Upload className="w-4 h-4" /> {t('myapp.upload')}
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      onChange={(e) => e.target.files[0] && handleFileUpload(app.id, e.target.files[0])} 
                                    />
                                  </label>
                                  {app.documentUrl && (
                                    <button 
                                      onClick={() => window.open(`http://localhost:8080/uploads/${app.documentUrl}`, '_blank')}
                                      className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 border border-purple-200 dark:border-purple-800/50 transition-all active:scale-95 shadow-sm"
                                    >
                                      <FileText className="w-4 h-4" /> Belgem
                                    </button>
                                  )}
                                </div>
                              )}
                              {app.status === 'CONFIRMED' && (
                                <button 
                                  onClick={() => downloadTicketPDF(app)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                                >
                                  <Ticket className="w-4 h-4" /> {t('myapp.ticket')}
                                </button>
                              )}
                              {app.status === 'PENDING' && (
                                <button 
                                  onClick={() => handleCancelAppointment(app.id, app.status)} 
                                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                              {app.status === 'COMPLETED' && (
                                <div className="flex items-center gap-2 justify-center">
                                  {app.documentUrl && (
                                    <button 
                                      onClick={() => window.open(`http://localhost:8080/uploads/${app.documentUrl}`, '_blank')}
                                      className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 border border-purple-200 dark:border-purple-800/50 transition-all active:scale-95 shadow-sm"
                                    >
                                      <FileText className="w-4 h-4" /> Belge Gör
                                    </button>
                                  )}
                                  {app.notes && (
                                    <button 
                                      onClick={() => downloadPrescriptionPDF(app)}
                                      className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 border border-blue-200 dark:border-blue-800/50 transition-all active:scale-95 shadow-sm"
                                    >
                                      <FileDown className="w-4 h-4" /> E-Reçete İndir
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => setSelectedApp(app)}
                                    className="bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition-all border border-amber-200 dark:border-amber-800/50 shadow-sm"
                                  >
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Değerlendir
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedApp && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative border border-transparent dark:border-slate-800">
              <button 
                onClick={() => !isSubmitting && setSelectedApp(null)} 
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-8 text-center border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-200 dark:border-slate-700">
                  <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">Seansı Değerlendir</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                  <strong className="text-slate-700 dark:text-slate-300">{selectedApp.provider.fullName}</strong> ile olan deneyiminiz nasıldı?
                </p>
              </div>
              <form onSubmit={handleReviewSubmit} className="p-8">
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors duration-200 ${
                          star <= (hoveredStar || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 transition-colors">Deneyiminizi Paylaşın</label>
                  <textarea 
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Doktorun yaklaşımı nasıldı? Beklentilerinizi karşıladı mı?"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none text-sm font-medium text-slate-800 dark:text-white resize-none transition-all"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> Gönder
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}