/* ═══ Data statis & konfigurasi wilayah pilot ═══ */

/* [nama, skor-awal-tampilan, lat, lng] — 20 kelurahan Jakarta Pusat */
export const Z = [
  ['Menteng',78,-6.1956,106.8322],['Gondangdia',44,-6.1862,106.8330],['Cikini',62,-6.1938,106.8402],
  ['Kebon Sirih',35,-6.1828,106.8258],['Pegangsaan',28,-6.1995,106.8442],['Senen',71,-6.1768,106.8422],
  ['Kwitang',55,-6.1812,106.8372],['Kenari',18,-6.1902,106.8492],['Paseban',40,-6.1972,106.8532],
  ['Kramat',51,-6.1868,106.8468],['Bungur',24,-6.1688,106.8478],['Johar Baru',66,-6.1815,106.8562],
  ['Galur',58,-6.1692,106.8592],['Tanah Tinggi',74,-6.1732,106.8522],['Kampung Rawa',47,-6.1762,106.8602],
  ['Gambir',21,-6.1762,106.8192],['Cideng',31,-6.1752,106.8102],['Petojo Utara',52,-6.1662,106.8142],
  ['Duri Pulo',36,-6.1702,106.8062],['Kebon Melati',39,-6.1932,106.8142],
];

export const CENTER = [-6.1880, 106.8340];
export const PILOT  = { s:-6.238, w:106.772, n:-6.128, e:106.908 };   // batas area pilot
export const HARD   = { s:-6.42,  w:106.55,  n:-5.95,  e:107.12  };   // batas geser maksimum

/* Parameter kelurahan pengguna untuk demo (λ=2 → ambang pencairan = 5 laporan/hari) */
export const MENTENG = { city:'Kota Jakarta Pusat', lambdaDaily:2 };

export const PM = {
  gopay:     { name:'GoPay',              color:'#00AED6' },
  shopeepay: { name:'ShopeePay',          color:'#EE4D2D' },
  qris:      { name:'QRIS',               color:'#1B3A2D' },
  card:      { name:'Kartu debit/kredit', color:'#4A6356' },
};

export const band = s =>
  s > 60  ? { c:'#C4553A', status:'Risiko tinggi', pill:'pill-red'   } :
  s >= 30 ? { c:'#B8853C', status:'Risiko sedang', pill:'pill-amber' } :
            { c:'#2E6B4F', status:'Risiko rendah', pill:'pill-green' };

export const FEED0 = [
  { dot:'#C4553A', title:'Pencurian motor · Jl. Cilacap',              body:'Dua saksi. CCTV warga tersedia. Selesai diverifikasi 14:34.', status:'Terverifikasi',        pill:'pill-green', time:'14:32' },
  { dot:'#B8853C', title:'Penjambretan · Taman Suropati',              body:'Satu pelapor. Menunggu konfirmasi saksi kedua.',              status:'Menunggu review',      pill:'pill-amber', time:'13:58' },
  { dot:'#8B7355', title:'Orang mencurigakan · Jl. HOS Cokroaminoto',  body:'Baru masuk — sedang dicek Ketua RW setempat.',                status:'Menunggu verifikasi',  pill:'pill-grey',  time:'13:21' },
];
