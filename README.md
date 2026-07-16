# **STARTUP PAPER: RAKSASA**

**Risk-Aware Community Safety & Assurance**

## **1. Executive Summary**

RAKSASA adalah infrastruktur keselamatan kota yang menggabungkan **prediksi risiko kejahatan** , **pelaporan terverifikasi** , dan **asuransi mikro parametrik** untuk keluarga berpenghasilan rendah. Berfokus pada kejahatan jalanan/rumah di pilot kota Jakarta, RAKSASA tidak hanya memetakan bahaya, tetapi memberikan **perlindungan finansial otomatis** saat risiko terjadi. Dengan menjadikan Lurah sebagai verifikator data dan memberinya insentif berbasis kinerja pencegahan, RAKSASA menciptakan ekosistem di mana birokrasi dan warga berpijak pada tujuan yang sama: keamanan yang terukur dan terjamin.

## **2. Problem Statement**

1. **Kerugian Finansial Akut:** Satu kejadian kriminal (pencurian/begal) bisa menghabiskan tabungan berbulan-bulan keluarga miskin, mendorong mereka lebih dalam ke kemiskinan.

2. **Data Tidak Real-Time & Tertutup:** Data kejahatan Polri/BPS terpublikasi dengan lag bulanan. Warga tidak tahu risiko aktual kelurahan mereka hari ini.

3. **Aplikasi Pelaporan Mandul:** Aplikasi yang ada berhenti di "lapor". Tidak ada konsekuensi finansial atau safety net dari laporan tersebut.

4. **Fraud & Hoaks:** Pelaporan bebas tanpa verifikasi rentan disalahgunakan, merusak validitas data dan menghambat respon.

5. **Tidak Ada Insentif Pencegahan bagi Birokrasi:** Lurah tidak punya insentif ekonomi untuk menurunkan angka kejahatan di wilayahnya; seringkali malah cenderung menutupi agar terlihat aman.

## **3. Arsitektur Produk (3 Core Layers)**

### **Layer 1: Actuarial Crime Risk Engine**

Mesin penghitung probabilitas kejahatan per kelurahan menggunakan metode aktuarial.

**Input:** Data historis kejahatan BPS DKI Jakarta, data sosio-ekonomi (kepadatan, pengangguran), dan real-time feed laporan terverifikasi dari warga. **Model:**

Frequency Model: Poisson/Negative Binomial Regression.

Credibility Weighting: $$ \text{RiskScore}{\text{final}} = Z \cdot \text{RealTime}{\text{verified}} + (1-Z) \cdot \text{Historical} $$ (Z naik saat ada lonjakan laporan terverifikasi, Z turun saat sepi kembali ke pola historis).

**Output:** Crime Risk Score (1-100) per kelurahan, prediksi kejadian 24-72 jam, dan dasar harga premi asuransi.

### **Layer 2: Lurah-Verified Community Reporting**

Sistem pelaporan yang memitigasi fraud melalui validasi otoritas terdekat.

#### **Dual-Mode Data:**

Sinyal Mentah (Unverified): Masuk saat warga lapor, muncul di peta sebagai tanda khusus (transparansi awal), TIDAK memicu payout. Data Terverifikasi (Validated): Laporan yang disetujui Lurah, masuk ke Risk Engine secara penuh, dan bisa memicu trigger asuransi. **Emergency SOS:** Tombol panic warga yang langsung mengirim alert ke sesama warga dalam radius 500m (bypass lurah untuk keadaan darurat absolut).

### **Layer 3: Parametric Crime Micro-Insurance**

Asuransi mikro dengan klaim otomatis berbasis data (tanpa surveyor, tanpa klaim manual).

**Mekanisme:** Warga membayar premi mingguan murah (Rp5.000-15.000). Jika parameter trigger tercapai, uang otomatis masuk ke e-wallet. **Trigger Parameter:** Jumlah laporan Terverifikasi di suatu kelurahan > Threshold X dalam 24 jam. **Payout:** Rp500.000 - Rp2.000.000 per kejadian per keluarga.

## **4. SUPER WORKFLOW (End-to-End)**

### **A. Warga Flow (Pelapor & Tertanggung)**

1. Warga melihat kejahatan → Buka RAKSASA → Isi form singkat (Jenis, Waktu, Lokasi).

2. Sistem mencatat sebagai **Sinyal Mentah** (muncul di peta sebagai ikon semi-transparan).

3. Laporan masuk ke antrean Dashboard Lurah.

4. Warga membayar premi mikro mingguan (mockup di MVP).

5. Jika trigger aktif → Notifikasi: "Area Anda terkena dampak. Auto-payout RpX sudah dikirim ke e-wallet."

**B. Lurah Flow (Verifikator & Mitra Pencegahan)**

1. Lurah login ke Dashboard Admin Kelurahan.

2. Melihat antrean laporan masuk + profil risiko kelurahan.

3. **Proses Verifikasi:**

Valid → Status berubah menjadi **Terverifikasi** . Risk Engine ter-update. Lurah mendapat poin Pilar 1. Invalid/Hoaks → Laporan ditolak. Jika warga banding (Appeal) ke Camat dan Lurah salah menolak, Lurah kena penalti. Need Info → Lurah minta detail tambahan ke warga. 4. Lurah melakukan tindakan pencegahan (patroli, siskamling) untuk menurunkan Risk Index bulan depan agar mendapat bonus Pilar 2.

### **C. System Flow (Risk Engine & Payout)**

1. Terima laporan Valid dari Lurah.

2. Eksekusi perhitungan Credibility Model → Update Risk Score Kelurahan.

3. Cek apakah kumulatif laporan valid dalam 24 jam melampaui Threshold Parametrik.

4. Jika Ya → Fire trigger → Auto-payout terhubung ke API e-wallet (mockup di MVP).

## **5. THE BREAKTHROUGH: Lurah Balanced-Scorecard Incentive**

Untuk memastikan Lurah tidak menutupi kejahatan (moral hazard) dan juga aktif mencegah, insentif tidak didasarkan pada "Risk Index rendah", melainkan sistem 3 Pilar:

### **Formula Insentif Bulanan Lurah:**

$$ \text{Total Incentive} = \text{Pilar 1 (Data Integrity)} + \text{Pilar 2 (Risk Mitigation)} + \text{Pilar 3 (Speed)} - \text{Penalty} $$

|**Pilar**|**Mekanisme**|**Tujuan**|**Perhitungan**|
|---|---|---|---|
|**1. Data**<br>**Integrity**|Insentif dasar per laporan yang**divalidasi**|Membayar Lurah untuk jujur; mencegah<br>menutupi kasus|Jumlah Laporan Valid ×<br>RpX|
|**2. Risk**<br>**Mitigation**|Bonus jika Risk Index kelurahan**turun**<br>dibanding bulan sebelumnya (Delta)|Memotivasi tindakan nyata (siskamling,<br>patroli) setelah laporan masuk|(% Penurunan Risk Index<br>× Multiplier)|
|**3.**<br>**Verification**<br>**Speed**|Bonus jika rata-rata waktu verifikasi < 2 jam|Efisiensi respons|Flat Rate jika SLA<br>terpenuhi|
|**Penalty**<br>**(Appeal)**|Potongan jika warga naik Appeal ke Camat<br>dan Lurah kalah banding|Mencegah Lurah semena-mena menolak<br>laporan valid|- RpY per kasus salah<br>tolak|



**Pitch Line untuk Juri:** "Kami tidak menghukum Lurah karena wilayahnya berisiko tinggi. Kami membayar mereka untuk jujur, dan membayar mereka LEBIH BANYAK jika mereka berhasil menurunkan risiko itu. Ini adalah rekayasa insentif birokrasi."

## **6. MVP Definition (30-Hour Scope)**

### **Yang WAJIB Dibangun:**

1. **Actuarial Risk Table & Map:**

Peta Jakarta (Folium/Streamlit) dengan heatmap Risk Score per Kelurahan (gunakan data BPS DKI + asumsi aktuarial).

2. **Warga Reporting UI:**

Form laporan sederhana + tampilan peta.

3. **Lurah Admin Dashboard:** Antrean laporan masuk. Tombol Valid/Tolak. Tampilan skor Pilar 1, 2, 3 (insentif).

4. **Parametric Trigger Simulator:**

Script di backend yang menunjukkan: "Laporan valid ke-5 hari ini di Kel. Menteng → TRIGGER ACTIVATED → Auto-payout terproses."

5. **Simulasi Live Feed (Poisson):**

Script Python yang generate laporan palsu secara stokastik tiap beberapa detik untuk demo.

### **Yang TIDAK Perlu Dibangun (Mockup/Figma saja):**

Integrasi payment gateway real (Midtrans/Xendit). Integrasi e-wallet payout real (OVO/GoPay). Sistem autentikasi komplek (SSO Kemenkes/Kemendagri). Appeal system ke Camat (cukup dijelaskan di slide).

## **7. Data Strategy & Real-Time Approach**

**Mengatasi Lag Data & Tidak Ada API Polisi:**

1. **Baseline Historis:** Gunakan publikasi BPS DKI Jakarta (Statistik Kejahatan) dan data kemiskinan sebagai prior distribution.

2. **Real-Time Synthetic:** Untuk demo hackathon, generate data menggunakan Python ( numpy.random.poisson ) berdasarkan lambda ($\lambda$) tiap kelurahan.

3. **Credibility Blending:** Di pitch, jelaskan bahwa sistem bisa tetap jalan meski data real-time sepi, karena di-backup oleh model historis. Saat ada spike laporan Lurah, sistem merespons secara adaptif.

## **8. Hackathon 30-Hour Execution Plan**

|**Waktu**|**Aktuaris 1**|**Aktuaris 2**|**Ekonom**|
|---|---|---|---|
|**Jam**<br>**0-6**|Kumpul & clean data BPS DKI Jakarta<br>per kelurahan.|Susun model Poisson & formula Risk<br>Score. Susun tabel premi parametrik.|Finalisasi alur Lurah Incentive (3 Pilar).<br>Sketch wireframe UI Warga & Lurah.|
|**Jam**<br>**6-12**|Bangun Risk Engine Python<br>(Calculate score per kelurahan).|Bangun simulasi Poisson live feed (script<br>random reporter).|Susun struktur Pitch Deck & Business<br>Model flow.|
|**Jam**<br>**12-18**|Integrasikan Risk Engine ke Streamlit<br>& Folium Map (Heatmap).|Bangun logic Parametric Trigger di<br>backend.|Bangun Wireframe Dashboard Lurah<br>(Figma/HTML).|
|**Jam**<br>**18-24**|Satukan Map + Live Feed +<br>Dashboard Lurah (Valid/Invalid<br>action).|Uji coba trigger payout & hitung<br>dampaknya.|Finalisasi slide Pitch. Isi konten nilai<br>ekonomi & sosial.|
|**Jam**<br>**24-30**|Bug fixing & backup demo (rekam<br>video).|Latihan demo live. Siapkan jawaban<br>teknis aktuarial.|Latihan pitch (5 menit). Penguatan<br>storytelling. Design polish.|



## **9. Key Pitch Angles (Poin Penilaian Juri)**

1. **Unfair Advantage:** Kalian punya 2 aktuaria dan 1 ekonom. Kalian tidak hanya bikin dashboard, kalian membangun **Risk & Pricing Infrastructure** yang tidak bisa dibuat oleh tim software engineer biasa dalam 30 jam.

2. **Solving the "Bureaucracy Bottleneck":** Kalian mengakui bahwa Lurah adalah single point of failure dalam pelaporan, lalu kalian **meng-flipnya menjadi kekuatan** lewat sistem insentif 3 Pilar. Kalian meng-align kepentingan birokrasi dengan keselamatan warga.

3. **From Reactive to Protective:** Aplikasi keamanan bersifat reaktif (kejahatan terlanjur terjadi). RAKSASA bersifat protektif (memberi uang otomatis pascakejadian agar warga tidak jatuh miskin).

4. **Zero-Fraud Insurance:** Asuransi parametrik menghilangkan biaya klaim, menghilangkan fraud individu, dan memungkinkan premi super murah untuk masyarakat miskin.

#### **Status Finalisasi: LULUS & SIAP EKSEKUSI.**

Silakan langsung bagi tugas sesuai tabel di Poin 8, dan selamat merenggut podium!

