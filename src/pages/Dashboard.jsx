import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, Check, CheckCircle, User, CalendarDays, Stethoscope, Activity, TrendingUp, PieChart as PieIcon, Download, FileText, X, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar';
import AvatarSettings from '../components/AvatarSettings';
import { useLanguage } from '../context/LanguageContext';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('overview');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const navigate = useNavigate();
  const { t, tBackend } = useLanguage();

  const [selectedAppForReport, setSelectedAppForReport] = useState(null);
  const [reportText, setReportText] = useState('');
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  const fetchAppointments = () => {
    if (currentUser) {
      axios.get(`http://localhost:8080/api/appointments/provider/${currentUser.id}`)
        .then(response => setAppointments(response.data))
        .catch(error => console.error(error));
    }
  };

  const fetchDoctorProfile = () => {
    if (currentUser) {
      axios.get(`http://localhost:8080/api/users/providers`)
        .then(res => {
          const me = res.data.find(d => d.id === currentUser.id);
          if (me) {
            setSpecialty(me.specialty || '');
            setBio(me.bio || '');
          }
        })
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ROLE_PROVIDER') {
      navigate('/login');
      return;
    }
    fetchAppointments();
    fetchDoctorProfile();
  }, [currentUser, navigate]);

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

  const generatePDF = async () => {
    const doc = new jsPDF();
    const reportToken = `RPT-${currentUser.id}-${Date.now().toString().slice(-6)}`;
    const qrData = `Performance Report | Doctor: ${currentUser.fullName} | Token: ${reportToken} | Total Apps: ${appointments.length}`;
    const qrBase64 = await generateQRCodeBase64(qrData);

    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("SchedulifyPro", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Aylik Performans ve Hakedis Raporu", 14, 28);

    if (qrBase64) {
      doc.addImage(qrBase64, 'PNG', 165, 8, 30, 30);
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Uzman Adresi: ${currentUser.fullName}`, 14, 50);
    doc.text(`Uzmanlik Alani: ${specialty || 'Genel Uzman'}`, 14, 57);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 64);
    
    const completedApps = appointments.filter(a => a.status === 'COMPLETED');
    const totalEarned = completedApps.length * 1250;
    
    doc.setFont("helvetica", "bold");
    doc.text(`Toplam Tamamlanan Seans: ${completedApps.length}`, 120, 50);
    doc.text(`Toplam Hakedis Tutari: ${totalEarned.toLocaleString('tr-TR')} TL`, 120, 57);
    doc.setFont("helvetica", "normal");

    const tableColumn = ["Hasta Adi", "Tarih", "Saat Araligi", "Durum", "Ucret"];
    const tableRows = [];

    appointments.forEach(app => {
      const date = new Date(app.startTime).toLocaleDateString('tr-TR');
      const time = `${new Date(app.startTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - ${new Date(app.endTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}`;
      const status = app.status === 'COMPLETED' ? 'Tamamlandi' : app.status === 'CONFIRMED' ? 'Onaylandi' : 'Beklemede';
      const price = "1.250 TL";
      tableRows.push([app.client.fullName, date, time, status, price]);
    });

    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Bu belge SchedulifyPro veri dogrulama و QR kod altyapisi ile uretilmistir resmi mukellef kaydidir.", 14, doc.internal.pageSize.height - 10);
        doc.text(`Sayfa ${i} / ${pageCount}`, 180, doc.internal.pageSize.height - 10);
    }

    doc.save(`SchedulifyPro_Rapor_${currentUser.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleOpenReportModal = (app) => {
    setSelectedAppForReport(app);
    setReportText(app.notes || '');
    setShowReportModal(true);
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    setIsSavingReport(true);
    try {
      await axios.put(`http://localhost:8080/api/appointments/${selectedAppForReport.id}/notes`, {
        notes: reportText
      });
      toast.success(tBackend("Seans raporu ve e-reçete başarıyla kaydedildi!"));
      setShowReportModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    } finally {
      setIsSavingReport(false);
    }
  };

  const getChartData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      name: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      randevu: appointments.filter(app => app.startTime.startsWith(date)).length
    }));
  };

  const getPieData = () => {
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
    const completed = appointments.filter(a => a.status === 'COMPLETED').length;

    return [
      { name: t('dash.pending'), value: pending },
      { name: t('status.confirmed'), value: confirmed },
      { name: t('dash.completed'), value: completed },
    ];
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("İşleniyor...");
    try {
      await axios.put(`http://localhost:8080/api/users/${currentUser.id}/profile`, { specialty, bio });
      toast.update(toastId, { render: tBackend("Profil güncellendi"), type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      toast.update(toastId, { render: tBackend("Bir hata oluştu."), type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleAvatarUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleConfirm = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/appointments/${id}/confirm`);
      toast.success(tBackend("Randevu onaylandı."));
      fetchAppointments();
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/appointments/${id}/complete`);
      toast.success(tBackend("Randevu tamamlandı."));
      fetchAppointments();
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu randevuyu iptal etmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/appointments/${id}`);
      toast.success(tBackend("Randevu iptal edildi."));
      fetchAppointments();
    } catch (error) {
      toast.error(tBackend("Bir hata oluştu."));
    }
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-blue-400 text-sm font-semibold">{`${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
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
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{t('dash.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">{t('dash.subtitle')}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 inline-flex transition-colors">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'overview' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" /> {t('dash.overview')}
              </button>
              <button 
                onClick={() => setActiveTab('appointments')}
                className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'appointments' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarDays className="w-4 h-4" /> {t('dash.appointments')}
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'profile' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" /> {t('dash.profile')}
              </button>
            </div>

            <button 
              onClick={generatePDF}
              className="flex items-center gap-2 font-black text-sm px-5 py-3 rounded-2xl transition-all bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white shadow-sm hover:shadow-lg hover:shadow-blue-600/20 active:scale-95"
            >
              <Download className="w-4 h-4" /> {t('dash.download')}
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 dark:border-slate-800/80 shadow-sm transition-colors">
                <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{t('dash.total')}</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-slate-900 dark:text-white">{appointments.length}</p>
                  <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold mb-1.5 flex items-center"><TrendingUp className="w-3 h-3 mx-1" /> {t('dash.all_time')}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 dark:border-slate-800/80 shadow-sm transition-colors">
                <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{t('dash.pending')}</p>
                <p className="text-4xl font-black text-amber-500 dark:text-amber-400">{appointments.filter(a => a.status === 'PENDING').length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 dark:border-slate-800/80 shadow-sm transition-colors">
                <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{t('dash.completed')}</p>
                <p className="text-4xl font-black text-emerald-500 dark:text-emerald-400">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-slate-800/80 shadow-sm min-h-[400px] flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" /> {t('dash.trend')}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{t('dash.last7')}</span>
                </div>
                <div className="flex-grow w-full h-64 sm:h-80">
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={getChartData()}>
                      <defs>
                        <linearGradient id="colorDoctor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="randevu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDoctor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-slate-800/80 shadow-sm min-h-[400px] flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-slate-900 dark:text-slate-400" /> {t('dash.dist')}
                  </h3>
                </div>
                <div className="flex-grow flex items-center justify-center w-full h-64 sm:h-80">
                  {appointments.length === 0 ? (
                    <div className="text-slate-400 dark:text-slate-500 font-medium text-sm flex flex-col items-center gap-2">
                      <PieIcon className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                      {t('dash.nodata')}
                    </div>
                  ) : (
                    <ResponsiveContainer width="99%" height="100%">
                      <PieChart>
                        <Pie data={getPieData().filter(d => d.value > 0)} innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                          {getPieData().filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[getPieData().indexOf(entry) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800/80 overflow-hidden animate-fade-in transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800/80">
                  <tr>
                    <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm px-4">{t('dash.patient_name')}</th>
                    <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm px-4">{t('dash.date')}</th>
                    <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm px-4">{t('dash.time')}</th>
                    <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm text-center px-4">{t('dash.status')}</th>
                    <th className="p-5 font-bold text-slate-700 dark:text-slate-300 text-sm text-center px-4">{t('dash.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                        {t('dash.no_apps')}
                      </td>
                    </tr>
                  ) : (
                    appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-5 font-bold text-slate-900 dark:text-white px-4">{app.client.fullName}</td>
                        <td className="p-5 text-slate-600 dark:text-slate-400 font-medium px-4">{new Date(app.startTime).toLocaleDateString('tr-TR')}</td>
                        <td className="p-5 font-bold text-slate-700 dark:text-slate-300 px-4">
                          {new Date(app.startTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - 
                          {new Date(app.endTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="p-5 text-center px-4">{getStatusBadge(app.status)}</td>
                        <td className="p-5 flex justify-center gap-2 items-center px-4">
                          {app.documentUrl && (
                            <button 
                              onClick={() => window.open(`http://localhost:8080/uploads/${app.documentUrl}`, '_blank')}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-xl transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-800 flex items-center gap-1 text-xs font-bold"
                            >
                              <Eye className="w-4 h-4" /> {t('dash.view_doc')}
                            </button>
                          )}
                          {app.status === 'PENDING' && (
                            <button onClick={() => handleConfirm(app.id)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-xl transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800">
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          {app.status === 'CONFIRMED' && (
                            <button onClick={() => handleComplete(app.id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {app.status !== 'COMPLETED' && (
                            <button onClick={() => handleDelete(app.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                          {app.status === 'COMPLETED' && (
                            <button 
                              onClick={() => handleOpenReportModal(app)}
                              className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs font-black transition-all flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <FileText className="w-3.5 h-3.5" /> {t('dash.write_report')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800/80 max-w-2xl overflow-hidden p-8 animate-fade-in transition-colors">
            <AvatarSettings user={currentUser} onAvatarUpdate={handleAvatarUpdate} />
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-slate-800/80">
              <div className="bg-slate-900 dark:bg-blue-600 p-4 rounded-2xl text-white shadow-md">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{t('dash.spec_title')}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t('dash.spec_desc')}</p>
              </div>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">{t('dash.spec_label')}</label>
                <input 
                  type="text" 
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:border-slate-900 dark:focus:border-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-white text-sm bg-gray-50/50 dark:bg-slate-800/50"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">{t('dash.bio_label')}</label>
                <textarea 
                  rows="5"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:border-slate-900 dark:focus:border-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-white text-sm bg-gray-50/50 dark:bg-slate-800/50 resize-none"
                />
              </div>
              <button 
                type="submit"
                className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
              >
                {t('dash.save')}
              </button>
            </form>
          </div>
        )}

      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative border border-gray-100 dark:border-slate-800">
            <button onClick={() => !isSavingReport && setShowReportModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
              <X className="w-6 h-6" />
            </button>
            <div className="p-8 text-center border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-200 dark:border-slate-700">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">E-Reçete & Seans Raporu</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                Hasta: <strong className="text-slate-700 dark:text-slate-300">{selectedAppForReport?.client.fullName}</strong>
              </p>
            </div>
            <form onSubmit={handleSaveReport} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Klinik Rapor ve İlaç/Diyet Reçetesi</label>
                <textarea 
                  rows="6"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium text-slate-800 dark:text-white resize-none transition-all"
                  required
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSavingReport || !reportText.trim()}
                className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSavingReport ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : t('dash.save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}