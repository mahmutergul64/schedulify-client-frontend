# SchedulifyPro - Sağlık Yönetim Sistemi

## Live Demo

[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-blue?style=for-the-badge)](https://schedulify-client-frontend.vercel.app)

*(Note: The backend is hosted on a free Render tier, so the first request might take 1-2 minutes to wake up the server. Please be patient!)*

Bu proje, hastaların doktorlara kolayca ulaşıp randevu alabileceği, doktorların ise kendi çalışma takvimlerini ve tıbbi notlarını yönetebileceği uçtan uca bir sağlık yönetim sistemidir.

## Projenin Amacı
Amacım, karmaşık sağlık süreçlerini basit bir arayüze sığdırmak ve dijitalleşme sürecinde doktor ile hasta arasındaki iletişimi güçlendirmek.

## Öne Çıkan Özellikler
* **Randevu Yönetimi:** Doktorların uygunluklarına göre saat dilimi seçimi ve onay sistemi.
* **Canlı Bildirimler:** Randevu durumu değiştiğinde Websocket (StompJS) ile anlık bildirimler.
* **Doküman Yönetimi:** Tahlil sonuçlarını PDF/JPG olarak yükleme ve reçete oluşturma.
* **Akıllı Yardımcı:** Gemini AI API entegrasyonu ile belirtilere göre doğru uzmanlığa yönlendirme.
* **Kişisel Sağlık Takibi:** Hasta panelinden girilen verilerin (kilo, tansiyon, şeker) interaktif grafiklerle takibi.
* **Globalleşme:** TR, EN ve AR dil seçenekleri; ayrıca gece/gündüz modu.

## Kullanılan Teknolojiler

### Arka Yüz (Backend)
* **Java 17 & Spring Boot 3:** Temel iş mantığı ve REST servisleri.
* **PostgreSQL:** Veri depolama.
* **Spring Security & JWT:** Kimlik doğrulama ve yetkilendirme.

### Ön Yüz (Frontend)
* **React (Vite):** Bileşen tabanlı kullanıcı arayüzü.
* **Tailwind CSS:** Responsive tasarım ve karanlık mod altyapısı.
* **Recharts:** Sağlık verilerini görselleştirme.
* **Lucide React:** İkon setleri.

---
*Geliştirme sürecinde gerçek hayat problemlerine (dosya yükleme, dinamik kategoriler, dil desteği gibi) odaklanarak geliştirilmiştir.*