import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  tr: {
    "nav.messages": "Mesajlar", "nav.dashboard": "Panelim", "nav.admin": "Yönetim", "nav.appointments": "Randevularım", "nav.premium": "Premium'a Geç", "nav.logout": "Çıkış Yap", "nav.pricing": "Fiyatlandırma", "nav.login": "Giriş Yap", "nav.register": "Kayıt Ol",
    "home.title1": "Doğru Uzmanı", "home.title2": "Hemen Bulun", "home.subtitle": "Sağlığınız için en iyi uzmanları keşfedin, yorumları inceleyin ve saniyeler içinde randevunuzu oluşturun.", "home.search": "Doktor adı veya uzmanlık alanı arayın... (Örn: Diyetisyen)", "home.notfound": "Uzman bulunamadı", "home.tryagain": "Farklı bir arama terimiyle tekrar deneyin.", "home.view": "Takvimi Görüntüle", "home.new": "Yeni", "home.general": "Genel Uzman", "cat.all": "Tümü",
    "dash.title": "Doktor Paneli", "dash.subtitle": "Randevularınızı, istatistiklerinizi ve raporlarınızı buradan yönetin.", "dash.overview": "Genel Bakış", "dash.appointments": "Randevular", "dash.profile": "Profil Ayarları", "dash.download": "Rapor İndir (PDF)", "dash.total": "Toplam Randevu", "dash.all_time": "Tüm Zamanlar", "dash.pending": "Onay Bekleyen", "dash.completed": "Tamamlanan", "dash.trend": "Kendi Randevu Trendiniz", "dash.last7": "Son 7 Gün", "dash.dist": "Randevu Durum Dağılımı", "dash.nodata": "Veri bulunamadı", "dash.patient_name": "Hasta Adı", "dash.date": "Tarih", "dash.time": "Saat", "dash.status": "Durum", "dash.actions": "İşlemler", "dash.no_apps": "Henüz randevu talebiniz bulunmamaktadır.", "dash.spec_title": "Uzmanlık Bilgileri", "dash.spec_desc": "Hastaların sizi bulabilmesi için bu alanları doldurun.", "dash.spec_label": "Uzmanlık Alanınız", "dash.bio_label": "Biyografi & Özgeçmiş", "dash.save": "Değişiklikleri Kaydet", "dash.view_doc": "Tahlil Gör", "dash.write_report": "Reçete/Rapor Yaz", "status.pending": "Beklemede", "status.confirmed": "Onaylandı", "status.completed": "Tamamlandı",
    "avatar.title": "Profil Fotoğrafı", "avatar.desc": "Cihazınızdan JPG, PNG veya GIF formatında bir fotoğraf seçin.", "avatar.change": "Değiştir", "avatar.remove": "Kaldır", "avatar.upload": "Yükle",
    "msg.title": "Mesajlar", "msg.search": "Kişilerde ara...", "msg.patient": "Hasta", "msg.placeholder_title": "SchedulifyPro Web Chat", "msg.placeholder_desc": "Mesaj göndermek veya almak için sol taraftaki menüden bir kişi seçin. Sistem uçtan uca şifrelenmiştir.", "msg.type": "Bir mesaj yazın...", "msg.online": "Çevrimiçi",
    "book.back": "Geri Dön", "book.fee": "SEANS ÜCRETİ", "book.title": "Tarih ve Saat Seçimi", "book.date_label": "Randevu Tarihi", "book.time_label": "Uygun Saatler", "book.pay_btn": "Ödemeye Geç",
    "health.title": "Kişisel Sağlık Metriklerim", "health.subtitle": "Günlük sağlık verilerinizi girerek gelişiminizi takip edin.", "health.add": "Yeni Veri Ekle", "health.date": "Ölçüm Tarihi", "health.weight": "Kilo (kg)", "health.bp": "Tansiyon", "health.sugar": "Kan Şekeri (mg/dL)", "health.save": "Veriyi Kaydet", "health.trend": "Kilo ve Kan Şekeri Trendi", "health.nodata": "Henüz veri girilmemiş.",
    "myapp.title": "Randevularım", "myapp.subtitle": "Geçmiş ve gelecek tüm seanslarınızı buradan takip edebilir, değerlendirme yapabilirsiniz.", "myapp.btn_apps": "Randevular", "myapp.btn_health": "Sağlık Takibim", "myapp.btn_profile": "Profil Ayarları", "myapp.back": "Geri", "myapp.upload": "Tahlil Yükle", "myapp.ticket": "Randevu Kartı",
    "role.provider": "Uzman Doktor", "role.admin": "Sistem Yöneticisi", "role.vip": "VIP Hasta", "role.client": "Hasta",
    "cat.psikolog": "Psikolog", "cat.diyetisyen": "Diyetisyen", "cat.dermatolog": "Dermatolog", "cat.diş hekimi": "Diş Hekimi", "cat.dahiliye": "Dahiliye",
    "pay.title": "Güvenli Ödeme", "pay.subtitle": "Randevunuzu kesinleştirmek için işlemi tamamlayın.", "pay.datetime": "Tarih / Saat", "pay.amount": "Tutar", "pay.name": "Kart Üzerindeki İsim", "pay.card": "Kart Numarası", "pay.expiry": "Son Kul. (AA/YY)", "pay.cvc": "CVC", "pay.btn": "Öde ve Onayla", "pay.processing": "İşleniyor...",
    "rate.title": "Seansı Değerlendir", "rate.subtitle": "ile olan deneyiminiz nasıldı?", "rate.label": "Deneyiminizi Paylaşın", "rate.placeholder": "Doktorun yaklaşımı nasıldı? Beklentilerinizi karşıladı mı?", "rate.btn": "Gönder",
    "table.expert": "Uzman", "table.datetime": "Tarih ve Saat", "table.status": "Durum", "table.action": "İşlem",
    "placeholder.weight": "Örn: 72.5", "placeholder.bp": "Örn: 120/80", "placeholder.sugar": "Örn: 95", "placeholder.name": "AD SOYAD",
    "backend.Profil güncellendi": "Profil başarıyla güncellendi!", "backend.Profil fotoğrafı güncellendi!": "Profil fotoğrafı başarıyla güncellendi!", "backend.Profil fotoğrafı kaldırıldı.": "Profil fotoğrafı başarıyla kaldırıldı.", "backend.Randevu başarıyla oluşturuldu.": "Randevu başarıyla oluşturuldu.", "backend.Sağlık verisi başarıyla kaydedildi!": "Sağlık verisi başarıyla kaydedildi!", "backend.Randevu iptal edildi.": "Randevu başarıyla iptal edildi.", "backend.Tıbbi belge başarıyla yüklendi!": "Tıbbi belge başarıyla yüklendi!", "backend.Değerlendirmeniz başarıyla gönderildi!": "Değerlendirmeniz başarıyla gönderildi!", "backend.Randevu onaylandı.": "Randevu başarıyla onaylandı.", "backend.Randevu tamamlandı.": "Randevu başarıyla tamamlandı.", "backend.Seans raporu ve e-reçete başarıyla kaydedildi!": "Seans raporu ve e-reçete başarıyla kaydedildi!", "backend.error_general": "Bir hata oluştu."
  },
  en: {
    "nav.messages": "Messages", "nav.dashboard": "Dashboard", "nav.admin": "Admin Panel", "nav.appointments": "My Appointments", "nav.premium": "Go Premium", "nav.logout": "Log Out", "nav.pricing": "Pricing", "nav.login": "Sign In", "nav.register": "Sign Up",
    "home.title1": "Find the Right", "home.title2": "Specialist Now", "home.subtitle": "Discover the best specialists for your health, review feedback, and book your appointment in seconds.", "home.search": "Search for a doctor or specialty... (e.g., Dietitian)", "home.notfound": "Specialist not found", "home.tryagain": "Please try again with a different search term.", "home.view": "View Calendar", "home.new": "New", "home.general": "General Practitioner", "cat.all": "All",
    "dash.title": "Doctor Panel", "dash.subtitle": "Manage your appointments, statistics, and reports here.", "dash.overview": "Overview", "dash.appointments": "Appointments", "dash.profile": "Profile Settings", "dash.download": "Download Report (PDF)", "dash.total": "Total Apps", "dash.all_time": "All Time", "dash.pending": "Pending", "dash.completed": "Completed", "dash.trend": "Your Appointment Trend", "dash.last7": "Last 7 Days", "dash.dist": "Status Distribution", "dash.nodata": "No data found", "dash.patient_name": "Patient Name", "dash.date": "Date", "dash.time": "Time", "dash.status": "Status", "dash.actions": "Actions", "dash.no_apps": "You have no appointment requests yet.", "dash.spec_title": "Specialty Information", "dash.spec_desc": "Fill these fields so patients can easily find you.", "dash.spec_label": "Your Specialty", "dash.bio_label": "Biography & Resume", "dash.save": "Save Changes", "dash.view_doc": "View File", "dash.write_report": "Write Report", "status.pending": "Pending", "status.confirmed": "Confirmed", "status.completed": "Completed",
    "avatar.title": "Profile Photo", "avatar.desc": "Select a JPG, PNG or GIF photo from your device.", "avatar.change": "Change", "avatar.remove": "Remove", "avatar.upload": "Upload",
    "msg.title": "Messages", "msg.search": "Search contacts...", "msg.patient": "Patient", "msg.placeholder_title": "SchedulifyPro Web Chat", "msg.placeholder_desc": "Select a contact from the left menu to send or receive messages. The system is end-to-end encrypted.", "msg.type": "Type a message...", "msg.online": "Online",
    "book.back": "Go Back", "book.fee": "SESSION FEE", "book.title": "Date and Time Selection", "book.date_label": "Appointment Date", "book.time_label": "Available Times", "book.pay_btn": "Proceed to Payment",
    "health.title": "Personal Health Metrics", "health.subtitle": "Track your progress by entering your daily health data.", "health.add": "Add New Data", "health.date": "Measurement Date", "health.weight": "Weight (kg)", "health.bp": "Blood Pressure", "health.sugar": "Blood Sugar (mg/dL)", "health.save": "Save Data", "health.trend": "Weight and Blood Sugar Trend", "health.nodata": "No data entered yet.",
    "myapp.title": "My Appointments", "myapp.subtitle": "You can track and review all your past and upcoming sessions here.", "myapp.btn_apps": "Appointments", "myapp.btn_health": "Health Tracker", "myapp.btn_profile": "Profile Settings", "myapp.back": "Back", "myapp.upload": "Upload File", "myapp.ticket": "Appt. Card",
    "role.provider": "Specialist", "role.admin": "System Admin", "role.vip": "VIP Patient", "role.client": "Patient",
    "cat.psikolog": "Psychologist", "cat.diyetisyen": "Dietitian", "cat.dermatolog": "Dermatologist", "cat.diş hekimi": "Dentist", "cat.dahiliye": "Internal Medicine",
    "pay.title": "Secure Payment", "pay.subtitle": "Complete the transaction to confirm your appointment.", "pay.datetime": "Date / Time", "pay.amount": "Amount", "pay.name": "Name on Card", "pay.card": "Card Number", "pay.expiry": "Expiry (MM/YY)", "pay.cvc": "CVC", "pay.btn": "Pay and Confirm", "pay.processing": "Processing...",
    "rate.title": "Rate the Session", "rate.subtitle": "How was your experience with", "rate.label": "Share Your Experience", "rate.placeholder": "How was the doctor's approach? Did they meet your expectations?", "rate.btn": "Submit",
    "table.expert": "Specialist", "table.datetime": "Date & Time", "table.status": "Status", "table.action": "Action",
    "placeholder.weight": "e.g., 72.5", "placeholder.bp": "e.g., 120/80", "placeholder.sugar": "e.g., 95", "placeholder.name": "FULL NAME",
    "backend.Profil güncellendi": "Profile successfully updated!", "backend.Profil fotoğrafı güncellendi!": "Profile photo successfully updated!", "backend.Profil fotoğrafı kaldırıldı.": "Profile photo successfully removed.", "backend.Randevu başarıyla oluşturuldu.": "Appointment successfully created.", "backend.Sağlık verisi başarıyla kaydedildi!": "Health data successfully saved!", "backend.Randevu iptal edildi.": "Appointment successfully canceled.", "backend.Tıbbi belge başarıyla yüklendi!": "Medical document successfully uploaded!", "backend.Değerlendirmeniz başarıyla gönderildi!": "Your review has been successfully submitted!", "backend.Randevu onaylandı.": "Appointment successfully confirmed.", "backend.Randevu tamamlandı.": "Appointment successfully completed.", "backend.Seans raporu ve e-reçete başarıyla kaydedildi!": "Session report and e-prescription successfully saved!", "backend.error_general": "An error occurred."
  },
  ar: {
    "nav.messages": "الرسائل", "nav.dashboard": "لوحة القيادة", "nav.admin": "الإدارة", "nav.appointments": "مواعيدي", "nav.premium": "ترقية مميزة", "nav.logout": "تسجيل الخروج", "nav.pricing": "الأسعار", "nav.login": "تسجيل الدخول", "nav.register": "إنشاء حساب",
    "home.title1": "ابحث عن الأخصائي", "home.title2": "المناسب الآن", "home.subtitle": "اكتشف أفضل المتخصصين لصحتك، وراجع التقييمات، واحجز موعدك في ثوانٍ.", "home.search": "ابحث عن طبيب أو تخصص... (مثل: أخصائي تغذية)", "home.notfound": "لم يتم العثور على أخصائي", "home.tryagain": "يرجى المحاولة مرة أخرى باستخدام مصطلح بحث مختلف.", "home.view": "عرض التقويم", "home.new": "جديد", "home.general": "ممارس عام", "cat.all": "الكل",
    "dash.title": "لوحة الطبيب", "dash.subtitle": "إدارة مواعيدك وإحصائياتك وتقاريرك هنا.", "dash.overview": "نظرة عامة", "dash.appointments": "المواعيد", "dash.profile": "إعدادات الملف", "dash.download": "تحميل التقرير (PDF)", "dash.total": "إجمالي المواعيد", "dash.all_time": "كل الوقت", "dash.pending": "قيد الانتظار", "dash.completed": "مكتملة", "dash.trend": "اتجاه مواعيدك", "dash.last7": "آخر 7 أيام", "dash.dist": "توزيع حالة المواعيد", "dash.nodata": "لا توجد بيانات", "dash.patient_name": "اسم المريض", "dash.date": "التاريخ", "dash.time": "الوقت", "dash.status": "الحالة", "dash.actions": "إجراءات", "dash.no_apps": "ليس لديك طلبات مواعيد حتى الآن.", "dash.spec_title": "معلومات التخصص", "dash.spec_desc": "املأ هذه الحقول حتى يتمكن المرضى من العثور عليك.", "dash.spec_label": "تخصصك", "dash.bio_label": "السيرة الذاتية", "dash.save": "حفظ التغييرات", "dash.view_doc": "عرض الملف", "dash.write_report": "كتابة تقرير", "status.pending": "قيد الانتظار", "status.confirmed": "مؤكد", "status.completed": "مكتمل",
    "avatar.title": "صورة الملف الشخصي", "avatar.desc": "حدد صورة بتنسيق JPG أو PNG أو GIF من جهازك.", "avatar.change": "تغيير", "avatar.remove": "إزالة", "avatar.upload": "رفع",
    "msg.title": "الرسائل", "msg.search": "البحث في جهات الاتصال...", "msg.patient": "مريض", "msg.placeholder_title": "محادثة SchedulifyPro", "msg.placeholder_desc": "حدد جهة اتصال من القائمة اليسرى لإرسال أو استقبال الرسائل. النظام مشفر بالكامل.", "msg.type": "اكتب رسالة...", "msg.online": "متصل",
    "book.back": "عد", "book.fee": "رسوم الجلسة", "book.title": "اختيار التاريخ والوقت", "book.date_label": "تاريخ الموعد", "book.time_label": "الأوقات المتاحة", "book.pay_btn": "الانتقال إلى الدفع",
    "health.title": "مقاييس صحتي الشخصية", "health.subtitle": "تتبع تقدمك عن طريق إدخال بياناتك الصحية اليومية.", "health.add": "إضافة بيانات جديدة", "health.date": "تاريخ القياس", "health.weight": "الوزن (كجم)", "health.bp": "ضغط الدم", "health.sugar": "سكر الدم (مجم/ديسيلتر)", "health.save": "حفظ البيانات", "health.trend": "اتجاه الوزن وسكر الدم", "health.nodata": "لم يتم إدخال بيانات بعد.",
    "myapp.title": "مواعيدي", "myapp.subtitle": "يمكنك تتبع ومراجعة جميع جلساتك السابقة والمقبلة هنا.", "myapp.btn_apps": "المواعيد", "myapp.btn_health": "متتبع الصحة", "myapp.btn_profile": "إعدادات الملف الشخصي", "myapp.back": "خلف", "myapp.upload": "رفع ملف", "myapp.ticket": "بطاقة الموعد",
    "role.provider": "أخصائي", "role.admin": "مسؤول النظام", "role.vip": "مريض VIP", "role.client": "مريض",
    "cat.psikolog": "طبيب نفسي", "cat.diyetisyen": "أخصائي تغذية", "cat.dermatolog": "طبيب جلدية", "cat.diş hekimi": "طبيب أسنان", "cat.dahiliye": "باطنية",
    "pay.title": "دفع آمن", "pay.subtitle": "أكمل المعاملة لتأكيد موعدك.", "pay.datetime": "التاريخ / الوقت", "pay.amount": "المبلغ", "pay.name": "الاسم على البطاقة", "pay.card": "رقم البطاقة", "pay.expiry": "تاريخ الانتهاء (MM/YY)", "pay.cvc": "CVC", "pay.btn": "دفع وتأكيد", "pay.processing": "جاري المعالجة...",
    "rate.title": "تقييم الجلسة", "rate.subtitle": "كيف كانت تجربتك مع", "rate.label": "شارك تجربتك", "rate.placeholder": "كيف كان نهج الطبيب؟ هل لبى توقعاتك؟", "rate.btn": "إرسال",
    "table.expert": "أخصائي", "table.datetime": "التاريخ والوقت", "table.status": "الحالة", "table.action": "إجراء",
    "placeholder.weight": "مثال: 72.5", "placeholder.bp": "مثال: 120/80", "placeholder.sugar": "مثال: 95", "placeholder.name": "الاسم الكامل",
    "backend.Profil güncellendi": "تم تحديث الملف الشخصي بنجاح!", "backend.Profil fotoğrafı güncellendi!": "تم تحديث صورة الملف الشخصي بنجاح!", "backend.Profil fotoğrafı kaldırıldı.": "تمت إزالة صورة الملف الشخصي بنجاح.", "backend.Randevu başarıyla oluşturuldu.": "تم إنشاء الموعد بنجاح.", "backend.Sağlık verisi başarıyla kaydedildi!": "تم حفظ البيانات الصحية بنجاح!", "backend.Randevu iptal edildi.": "تم إلغاء الموعد بنجاح.", "backend.Tıbbi belge başarıyla yüklendi!": "تم رفع الوثيقة الطبية بنجاح!", "backend.Değerlendirmeniz başarıyla gönderildi!": "تم إرسال تقييمك بنجاح!", "backend.Randevu onaylandı.": "تم تأكيد الموعد بنجاح.", "backend.Randevu tamamlandı.": "تم اكتمال الموعد بنجاح.", "backend.Seans raporu ve e-reçete başarıyla kaydedildi!": "تم حفظ تقرير الجلسة والوصفة الطبية بنجاح!", "backend.error_general": "حدث خطأ."
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'tr');

  useEffect(() => {
    localStorage.setItem('appLang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang][key] || key;
  
  const tCat = (categoryStr) => {
    if(!categoryStr) return "";
    const cleanStr = categoryStr.replace('.', '').trim().toLowerCase();
    const key = `cat.${cleanStr}`;
    return translations[lang][key] || categoryStr;
  };
  
  const tBackend = (message) => {
    if (!message) return translations[lang]["backend.error_general"];
    const key = `backend.${message.trim()}`;
    return translations[lang][key] || message;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tCat, tBackend }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);