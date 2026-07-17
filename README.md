# **STARTUP PAPER: JAGA**

**Guard Your Ground. Warga Jaga Warga**

## **1. Executive Summary**

JAGA adalah platform urban safety net yang menggabungkan **prediksi risiko kejahatan**, **pelaporan terverifikasi**, dan **asuransi mikro parametrik** untuk keluarga berpenghasilan rendah. Berfokus pada kejahatan di kota metropolitan seperti Jakarta, JAGA tidak hanya memetakan bahaya, tetapi memberikan **perlindungan finansial otomatis** saat risiko terjadi. Sistem ini memosisikan seorang administrator lokal sebagai verifikator di setiap wilayah dengan insentif berbasis pencegahan, sehingga warga dan jajaran birokrasi bisa bekerja sama demi mewujudkan lingkungan yang aman dan terukur.

## **2. Problem Statement**

1. **Kerugian Finansial Akut:** Satu kejadian kriminal (pencurian/begal) bisa menghabiskan tabungan berbulan-bulan keluarga miskin, mendorong mereka lebih dalam ke kemiskinan.

2. **Data Tidak Real-Time & Tertutup:** Data kejahatan Polri/BPS terpublikasi dengan lag bulanan. Warga tidak tahu risiko aktual yang ada di sekitar mereka hari ini.

3. **Aplikasi Pelaporan Mandul:** Aplikasi yang ada berhenti di "lapor". Tidak ada konsekuensi finansial atau safety net dari laporan tersebut.

4. **Fraud & Hoaks:** Pelaporan bebas tanpa verifikasi rentan disalahgunakan, merusak validitas data dan menghambat respon.

5. **Tidak Ada Insentif Pencegahan bagi Birokrasi:** Admin atau verifikator tidak punya insentif untuk menurunkan angka kejahatan di wilayahnya; seringkali malah cenderung menutupi agar terlihat aman.

## **3. Arsitektur Produk (3 Core Layers)**

### **Layer 1: Crime Risk Engine**

Mesin penghitung probabilitas kejahatan per kelurahan menggunakan metode aktuarial.

**Input:** Data historis kejahatan BPS DKI Jakarta dan real-time feed laporan terverifikasi dari warga. **Model:**

Frequency Model: Poisson Random Variable.


**Output:** Crime Risk Score (1-100) per kelurahan, prediksi kejadian 24-72 jam, dan dasar harga premi asuransi.

### **Layer 2: Admin-Verified Community Reporting**

Sistem pelaporan yang memitigasi fraud melalui validasi otoritas terdekat.

#### **Dual-Mode Data:**

Sinyal Mentah (Unverified): Masuk saat warga lapor, muncul di peta sebagai tanda khusus (transparansi awal), TIDAK memicu payout. Data Terverifikasi (Validated): Laporan yang disetujui Admin, masuk ke Risk Engine secara penuh, dan bisa memicu trigger asuransi. **Emergency SOS:** Tombol panic warga yang langsung mengirim alert ke sesama warga dalam radius 500m (bypass oleh administrator untuk keadaan darurat absolut).

### **Layer 3: Parametric Crime Micro-Insurance**

Asuransi mikro dengan klaim otomatis berbasis data (tanpa surveyor, tanpa klaim manual).

**Mekanisme:** Warga membayar premi mingguan murah (Rp5.000-15.000). Jika parameter trigger tercapai, uang otomatis masuk ke e-wallet. **Trigger Parameter:** Jumlah laporan Terverifikasi di suatu kelurahan melebihi Threshold kejadian harian. **Payout:** Rp500.000 - Rp1.500.000 per kejadian per keluarga.

## **4. SUPER WORKFLOW (End-to-End)**

### **A. Warga Flow (Pelapor & Tertanggung)**

1. Warga melihat kejahatan → Buka JAGA → Isi form singkat (Jenis Kejadian, Lokasi, Deskripsi Singkat).

2. Sistem mencatat sebagai **Sinyal Mentah** (muncul di peta sebagai ikon semi-transparan).

3. Laporan masuk ke antrean Dashboard Admin.

4. Warga membayar premi mikro mingguan.

5. Jika trigger aktif → Notifikasi: "Area Anda terkena dampak. Auto-payout RpX sudah dikirim ke e-wallet."

**B. Admin Flow (Verifikator & Mitra Pencegahan)**

1. Admin login ke Dashboard Admin setiap region (Kelurahan).

2. Melihat antrean laporan masuk + profil risiko kelurahan.

3. **Proses Verifikasi:**

Valid → Status berubah menjadi **Terverifikasi** . Risk Engine ter-update. Admin mendapat poin Pilar 1. Invalid/Hoaks → Laporan ditolak. Need Info → Admin minta detail tambahan ke warga. 4. Admin melakukan tindakan pencegahan (patroli, siskamling) untuk menurunkan Risk Index bulan depan agar mendapat bonus Pilar 2.

### **C. System Flow (Risk Engine & Payout)**

1. Terima laporan Valid dari Admin.

2. Eksekusi perhitungan Credibility Model → Update Risk Score Kelurahan.

3. Cek apakah kumulatif laporan valid dalam 24 jam melampaui Threshold Parametrik.

4. Jika Ya → Fire trigger → Auto-payout terhubung ke API e-wallet (mockup di MVP).

## **5. THE BREAKTHROUGH: Lurah Balanced-Scorecard Incentive**

Untuk memastikan Admin tidak menutupi kejahatan (moral hazard) dan juga aktif mencegah, insentif tidak didasarkan pada "Risk Index rendah", melainkan sistem 3 Pilar:

### **Formula Insentif Bulanan Lurah:**

$$ \text{Total Incentive} = \text{Pilar 1 (Data Integrity)} + \text{Pilar 2 (Risk Mitigation)} + \text{Pilar 3 (Speed)} - \text{Penalty} $$

|**Pilar**|**Mekanisme**|**Tujuan**|**Perhitungan**|
|---|---|---|---|
|**1. Data**<br>**Integrity**|Insentif dasar per laporan yang**divalidasi**|Membayar kejujuran Admin; mencegah<br>menutupi kasus|Jumlah Laporan Valid ×<br>RpX|
|**2. Risk**<br>**Mitigation**|Bonus jika Risk Index kelurahan**turun**<br>dibanding bulan sebelumnya (Delta)|Memotivasi tindakan nyata (siskamling,<br>patroli) setelah laporan masuk|(% Penurunan Risk Index<br>× Multiplier)|
|**3.**<br>**Verification**<br>**Speed**|Bonus jika rata-rata waktu verifikasi < 2 jam|Efisiensi respons|Flat Rate jika SLA<br>terpenuhi|
|**Penalty**<br>**(Appeal)**|Potongan jika warga naik Appeal ke level birokrasi yang lebih tinggi<br>dan Admin kalah banding|Mencegah Admin semena-mena menolak<br>laporan valid|- RpY per kasus salah<br>tolak|


## **6. Data Strategy & Real-Time Approach**

**Mengatasi Lag Data & Tidak Ada API Polisi:**

1. **Baseline Historis:** Gunakan publikasi BPS DKI Jakarta (Statistik Kejahatan) dan data kemiskinan sebagai prior distribution.

2. **Real-Time Synthetic:** Generate data menggunakan Python ( numpy.random.poisson ) berdasarkan laju tingkat kejadian kriminalitas ($\lambda$) tiap wilayah.

3. **Credibility Blending:** Sistem bisa tetap jalan meski data real-time sepi, karena di-backup oleh model historis. Saat ada spike laporan dari administrator, sistem merespons secara adaptif.
