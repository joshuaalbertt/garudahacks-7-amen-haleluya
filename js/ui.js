import { $, $$, esc, nowHM, maskPhone, maskNik, rupiah } from './util.js';
import { S, U, save, menteng, zoneScore, zoneBase, zoneReportsToday, zoneTrigger } from './state.js';
import { Z, PM, FEED0, band } from './data.js';

export function toast(msg, color){
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = '<i style="background:'+(color||'#2E6B4F')+'"></i><span>'+esc(msg)+'</span>';
  $('#toasts').appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .3s'; el.style.opacity='0'; setTimeout(()=>el.remove(),320); }, 3200);
}
export function pushNotif(dot, title, body){
  S.notifs.unshift({ dot, title, body, time:nowHM() });
  S.notifs = S.notifs.slice(0,10); S.unread = true; save();
  renderNotifs();
  const bd = $('#bell-dot'); if(bd) bd.classList.remove('hidden');
}
export function renderNotifs(){
  $('#notif-list').innerHTML = S.notifs.map(n=>
    '<div class="nrow"><div class="dot" style="background:'+n.dot+'"></div>'+
    '<div style="flex:1;min-width:0"><div class="t">'+esc(n.title)+'</div><div class="b">'+esc(n.body)+'</div></div>'+
    '<div class="tm">'+esc(n.time)+'</div></div>').join('');
}

export function openModal(html, center){
  closeModal();
  const m = document.createElement('div');
  m.className = 'modal'+(center?' center':''); m.id = 'modal-live';
  m.innerHTML = '<div class="mcard">'+html+'</div>';
  m.addEventListener('click', e=>{ if(e.target===m) closeModal(); });
  $('#modal-root').appendChild(m);
}
export function closeModal(){ const m = $('#modal-live'); if(m) m.remove(); }
export const closeX = '<div class="mclose" onclick="A.closeModal()"><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="#4A6356" stroke-width="1.8" stroke-linecap="round"/></svg></div>';

export function setTabIcons(){
  ['beranda','peta','lapor','proteksi','profil'].forEach(t=>{
    const el = $('#tab-'+t), on = U.tab===t;
    el.classList.toggle('on', on);
    $$('.tk', el).forEach(p=>p.setAttribute('stroke', on?'#1B3A2D':'#9AA89D'));
    $$('.tkf', el).forEach(p=>p.setAttribute('fill', on?'#1B3A2D':'#9AA89D'));
    if(t==='lapor'){ const s=$('span',el); if(s) s.style.color = on?'#C4553A':''; }
  });
}

export function renderHome(){
  const m = menteng();
  const h = new Date().getHours();
  const g = h<11?'pagi':h<15?'siang':h<19?'sore':'malam';
  const first = S.user ? S.user.name.split(' ')[0] : '';
  $('#home-greet').textContent = 'Selamat '+g+(first?', '+first+'.':'.');
  $('#home-date').textContent = new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})+' · Jakarta Pusat';
  const sc = $('#home-score'); sc.textContent = m.score;
  sc.style.color = m.score>60?'#E07B5F':m.score>=30?'#D9A55A':'#7FC79E';
  $('#home-status').textContent = m.score>60?'Risiko tinggi — kewaspadaan meningkat.':m.score>=30?'Risiko sedang — tetap waspada.':'Risiko rendah — kondisi terkendali.';
  const bars=[10,9,12,14,13,18,21,20,27,31,35,40];
  $('#home-bars').innerHTML = bars.map((bh,i)=>'<div style="width:6px;border-radius:2px;height:'+bh+'px;background:'+(i===bars.length-1?'#C4553A':'rgba(255,255,255,.'+(12+i*2)+')')+'"></div>').join('');
  $('#home-thresh-n').textContent = m.reportsToday+'/'+m.threshold+' laporan';
  $('#home-thresh-bar').style.width = Math.min(100, m.reportsToday/m.threshold*100)+'%';
  $('#home-vbanner').innerHTML = (S.user && !S.verified) ?
    '<div class="vbanner"><div style="flex:1;min-width:0"><div class="t">Akun belum terverifikasi</div>'+
    '<div class="s">Verifikasi NIK untuk membuka Lapor, Proteksi &amp; bantuan.</div></div>'+
    '<button onclick="A.openNik()">Verifikasi NIK</button></div>' : '';
  const p = S.protection;
  $('#home-protect').innerHTML = p && p.active ?
    '<div class="card" style="padding:15px 17px;display:flex;align-items:center;gap:13px;cursor:pointer" onclick="A.go(\'proteksi\')">'+
      '<div class="hexnum" style="width:40px;height:44px"><span style="width:10px;height:10px;border-radius:50%;background:#C4553A;border:2px solid rgba(255,255,255,.75)"></span></div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">Proteksi keluarga aktif</div>'+
      '<div class="serif" style="font-size:11.5px;color:var(--tanah);margin-top:1px">'+rupiah(m.premium)+'/minggu · bantuan otomatis Rp1,5jt</div></div>'+
      '<span class="pill pill-green"><i></i>Aktif</span></div>'
    :
    '<div class="card" style="padding:15px 17px;display:flex;align-items:center;gap:13px;cursor:pointer" onclick="A.go(\'proteksi\')">'+
      '<div class="hexnum" style="width:40px;height:44px;background:#D4DDD6"><span style="width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid rgba(27,58,45,.3)"></span></div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">Proteksi keluarga belum aktif</div>'+
      '<div class="serif" style="font-size:11.5px;color:var(--tanah);margin-top:1px">Dana bantuan otomatis tanpa klaim — mulai '+rupiah(m.premium)+'/minggu</div></div>'+
      '<span class="pill pill-grey"><i></i>Nonaktif</span></div>';
  const feed = [...S.myFeed, ...FEED0];
  $('#home-feed').innerHTML = feed.map(f=>
    '<div class="card" style="border-radius:14px;padding:13px 15px;display:flex;gap:12px;align-items:flex-start">'+
    '<div style="width:8px;height:8px;border-radius:50%;background:'+f.dot+';margin-top:5px;flex-shrink:0"></div>'+
    '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">'+esc(f.title)+'</div>'+
    '<div class="serif" style="font-size:12px;color:var(--teks2);line-height:1.5;margin-top:1px">'+esc(f.body)+'</div>'+
    '<div style="display:flex;align-items:center;gap:7px;margin-top:8px">'+
    '<span class="pill '+f.pill+'"><i></i>'+esc(f.status)+'</span>'+
    '<span style="font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:var(--tanah)">'+esc(f.time)+' WIB</span>'+
    '</div></div></div>').join('');
}

export function renderChips(){
  const defs=[['semua','Semua'],['tinggi','Tinggi'],['sedang','Sedang'],['rendah','Rendah']];
  $('#chips-filter').innerHTML = defs.map(([k,l])=>
    '<div class="chip-filter'+(U.filter===k?' on':'')+'" onclick="A.setFilter(\''+k+'\')">'+l+'</div>').join('');
}

export function renderZoneSheet(){
  const sh = $('#sheet-zone');
  if(U.selId==null || (U.tab!=='peta' && U.tab!=='beranda')){ sh.classList.add('hidden'); return; }
  const z = Z[U.selId], sc = zoneScore(z[0]), b = band(sc);
  const th = zoneTrigger(z[0]).threshold;
  const reports = Math.min(th, S.zoneReports[z[0]]!=null ? S.zoneReports[z[0]] : Math.round(sc/16));
  const delta = sc - zoneBase(z[0]);
  const trend = delta>0 ? 'Naik '+delta+' poin — laporan warga baru saja terverifikasi.'
    : sc>60 ? 'Naik '+Math.round(sc/4)+' poin dalam 6 jam terakhir. Perlu verifikasi warga sebelum bantuan cair.'
    : sc>=30 ? 'Stabil dalam 6 jam terakhir. Pantau perkembangan laporan.'
    : 'Turun dalam 6 jam terakhir. Kondisi wilayah kondusif.';
  sh.innerHTML =
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">'+
      '<div><div class="lbl" style="margin-bottom:3px">Kelurahan</div>'+
      '<div style="font-size:17px;font-weight:700;letter-spacing:-.3px">'+esc(z[0])+'</div></div>'+
      '<div class="mclose" onclick="A.closeZone()"><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="#4A6356" stroke-width="1.8" stroke-linecap="round"/></svg></div></div>'+
    '<div style="display:flex;align-items:center;gap:18px;margin-bottom:13px">'+
      '<div style="display:flex;align-items:baseline;gap:5px"><span style="font-size:40px;font-weight:700;color:'+b.c+';letter-spacing:-2px;line-height:1">'+sc+'</span><span style="font-size:12px;color:var(--tanah)">/100</span></div>'+
      '<div style="flex:1"><span class="pill '+b.pill+'" style="margin-bottom:6px"><i></i>'+b.status+'</span>'+
      '<div class="serif" style="font-size:12px;color:var(--teks2);line-height:1.5">'+trend+'</div></div></div>'+
    '<div style="background:var(--bg);border-radius:10px;padding:10px 14px;margin-bottom:13px">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:9px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--teks2)">Menuju bantuan otomatis</span>'+
      '<span style="font-size:10.5px;font-weight:600;color:'+b.c+'">'+reports+'/'+th+' laporan</span></div>'+
      '<div style="height:4px;border-radius:2px;background:var(--abu);overflow:hidden"><div style="height:100%;background:'+b.c+';width:'+(reports/th*100)+'%"></div></div></div>'+
    '<div style="display:flex;gap:8px">'+
      '<button class="btn btn-p" style="flex:1;font-size:12.5px;padding:12px" onclick="A.laporFrom(\''+esc(z[0])+'\')">Laporkan kejadian di sini</button>'+
      '<button class="btn btn-o" style="font-size:12.5px;padding:12px 16px" onclick="A.closeZone()">Tutup</button></div>';
  sh.classList.remove('hidden');
}

export function renderLapor(){
  const v = $('#view-lapor');
  if(U.laporSent){
    const st = U.laporStage;
    const pl = [
      { done:true,  title:'Laporan terkirim', sub:nowHM()+' WIB · lokasi & waktu terekam' },
      { done:st>=3, act:st===2, title:'Verifikasi warga · '+esc(U.laporLoc), sub: st>=3?'Terverifikasi · valid':'Sedang berlangsung · rata-rata 2 menit' },
      { done:st>=3, title:'Selesai', sub: st>=3?'Laporan valid & tercatat':'Menunggu verifikasi' },
    ];
    v.innerHTML =
      '<div style="padding:26px 8px 0;display:flex;flex-direction:column;align-items:center;text-align:center">'+
      '<div class="hexnum" style="width:72px;height:78px;background:'+(st>=3?'#2E6B4F':'#B8853C')+';margin-bottom:18px">'+
        (st>=3?'<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 10 17.5 19 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              :'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#fff" stroke-width="2"/><path d="M12 7.5V12l3 2" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>')+'</div>'+
      '<div style="font-size:20px;font-weight:700;letter-spacing:-.4px;margin-bottom:8px">'+(st>=3?'Laporan terverifikasi.':'Laporan terkirim.')+'</div>'+
      '<div class="serif" style="font-size:13.5px;color:var(--teks2);line-height:1.65;max-width:290px;margin-bottom:24px">'+
        (st>=3?'Laporan Anda valid dan sudah tercatat untuk kelurahan '+esc(U.laporLoc)+'. Skor wilayah kini '+zoneScore(U.laporLoc)+'/100.'
              :'Masuk antrean verifikasi warga & Ketua RW '+esc(U.laporLoc)+'. Estimasi selesai: 2 menit.')+'</div>'+
      '<div class="card" style="width:100%;max-width:320px;padding:18px;text-align:left;margin-bottom:22px">'+
        pl.map((p,i)=>'<div class="pl-row"><div class="pl-dotcol">'+
          '<div class="pl-dot" style="background:'+(p.done?'#2E6B4F':p.act?'#B8853C':'#D4DDD6')+';border-color:'+(p.done?'rgba(46,107,79,.3)':p.act?'rgba(200,155,60,.3)':'#EEF3EF')+'"></div>'+
          (i<pl.length-1?'<div class="pl-line"></div>':'')+'</div>'+
          '<div style="padding-bottom:8px"><div class="pl-t" style="color:'+(p.done||p.act?'var(--hutan)':'var(--tanah)')+'">'+p.title+'</div>'+
          '<div class="pl-s">'+p.sub+'</div></div></div>').join('')+'</div>'+
      '<button class="btn btn-dark" onclick="A.laporReset()">Buat laporan baru</button></div>';
    return;
  }
  const cats = ['Pencurian','Perampokan','Penjambretan','Curanmor','Orang mencurigakan','Lainnya'];
  v.innerHTML =
    '<div><div class="h-view">Laporkan kejadian</div>'+
    '<div class="sub-view">Diverifikasi warga sebelum tercatat.</div></div>'+
    (!S.verified ?
      '<div class="vbanner"><div style="flex:1;min-width:0"><div class="t">Perlu verifikasi NIK</div>'+
      '<div class="s">Isi laporan boleh sekarang — verifikasi diminta saat kirim.</div></div>'+
      '<button onclick="A.openNik()">Verifikasi</button></div>' : '')+
    '<div class="card" style="border-radius:12px;padding:13px 15px;display:flex;align-items:center;gap:11px">'+
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><circle cx="12" cy="10" r="3" fill="#C4553A"/><path d="M12 21c4-4.5 7-7.8 7-11a7 7 0 1 0-14 0c0 3.2 3 6.5 7 11Z" stroke="#1B3A2D" stroke-width="1.7"/></svg>'+
      '<div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:600">Kel. '+esc(U.laporLoc)+', Jakarta Pusat</div>'+
      '<div style="font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:var(--tanah);margin-top:1px">GPS terdeteksi · akurat 12 m · skor '+zoneScore(U.laporLoc)+'/100</div></div>'+
      '<span onclick="A.openKelurahan()" style="font-size:10px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--daun);cursor:pointer;padding:6px 2px">Ubah</span></div>'+
    '<div><div class="lbl" style="margin-bottom:9px">Jenis kejadian</div>'+
      '<div id="lapor-cats" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
      cats.map(c=>'<div class="cat'+(U.laporCat===c?' on':'')+'" data-cat="'+c+'" onclick="A.pickCat(\''+c+'\')"><i></i><b>'+c+'</b></div>').join('')+'</div></div>'+
    '<div><div class="lbl" style="margin-bottom:9px">Kronologi singkat</div>'+
      '<textarea id="lapor-text" class="inp" placeholder="Apa yang terjadi? Kapan? Fakta saja — tanpa opini." oninput="A.laporTyping(this.value)">'+esc(U.laporText)+'</textarea></div>'+
    '<div onclick="A.toast(\'Kamera tidak tersedia di prototipe — foto dilewati.\',\'#8B7355\')" style="border:1.5px dashed #D4DDD6;border-radius:11px;padding:15px 16px;display:flex;align-items:center;gap:12px;background:#fff;cursor:pointer">'+
      '<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2.5" stroke="#8B7355" stroke-width="1.7"/><circle cx="12" cy="13" r="3.5" stroke="#8B7355" stroke-width="1.7"/><path d="M8 6l1.2-2h5.6L16 6" stroke="#8B7355" stroke-width="1.7" stroke-linejoin="round"/></svg>'+
      '<div><div style="font-size:12.5px;font-weight:600;color:var(--teks2)">Tambah foto bukti</div>'+
      '<div style="font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:var(--tanah);margin-top:1px">Opsional · mempercepat verifikasi</div></div></div>'+
    '<div class="serif" style="background:rgba(46,107,79,.06);border:1px solid rgba(46,107,79,.18);border-radius:11px;padding:12px 15px;font-size:12px;color:var(--teks2);line-height:1.6">Identitas Anda dirahasiakan. Laporan palsu menurunkan skor kepercayaan dan dapat menonaktifkan proteksi.</div>'+
    '<button id="btn-lapor" class="btn btn-p" style="font-size:14px;padding:15px" '+(U.laporCat?'':'disabled')+' onclick="A.laporSubmit()">Kirim laporan</button>';
}

export function renderProteksi(){
  const v = $('#view-proteksi');
  const p = S.protection, m = menteng();
  if(!(p && p.active)){
    const rows = ['gopay','shopeepay','qris','card'].map(k=>{
      const mm = PM[k];
      const connected = (k==='gopay'||k==='shopeepay') ? S.wallets[k] : true;
      const sub = k==='gopay'||k==='shopeepay'
        ? (connected ? 'Terhubung · '+maskPhone(S.wallets[k]) : 'Belum terhubung — ketuk untuk hubungkan')
        : (k==='qris'?'Bayar via scan QR':'Via JagaPay Gateway (simulasi)');
      return '<div class="mth'+(U.paySel===k?' on':'')+'" onclick="A.pickMethod(\''+k+'\')">'+
        '<div class="radio"></div>'+
        '<div class="paylogo" style="width:34px;height:34px;border-radius:10px;background:'+mm.color+';font-size:13px">'+mm.name[0]+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">'+mm.name+'</div>'+
        '<div style="font-size:10px;color:var(--tanah);margin-top:1px">'+sub+'</div></div>'+
        ((k==='gopay'||k==='shopeepay') && !connected ? '<span class="paylink" onclick="event.stopPropagation();A.openConnect(\''+k+'\')">Hubungkan</span>':'')+
        '</div>';
    }).join('');
    v.innerHTML =
      '<div><div class="h-view">Proteksi keluarga</div>'+
      '<div class="sub-view">Dana bantuan otomatis — tanpa klaim, tanpa formulir.</div></div>'+
      (!S.verified ?
        '<div class="vbanner"><div style="flex:1;min-width:0"><div class="t">Perlu verifikasi NIK</div>'+
        '<div class="s">Perlindungan atas nama sesuai KTP — verifikasi diminta saat aktivasi.</div></div>'+
        '<button onclick="A.openNik()">Verifikasi</button></div>' : '')+
      '<div class="card-dark" style="padding:20px"><div class="kawung"></div><div style="position:relative">'+
        '<div class="lbl-w">Proteksi Keluarga · Jakarta Pusat</div>'+
        '<div style="display:flex;align-items:baseline;gap:7px;margin-top:10px;flex-wrap:wrap"><span style="font-size:32px;font-weight:700;letter-spacing:-1.5px">'+rupiah(m.premium)+'</span><span style="font-size:12px;color:rgba(255,255,255,.45)">/minggu</span></div>'+
        '<div class="serif" style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px">Mengikuti skor wilayah Anda saat ini ('+m.score+'/100) — turun saat lingkungan makin aman</div>'+
        '<div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">'+
          ['Bantuan otomatis Rp1.500.000 saat kondisi wilayah memburuk','Tanpa klaim, tanpa formulir, tanpa survei','Melindungi hingga 4 anggota keluarga'].map(t=>
          '<div style="display:flex;gap:9px;align-items:flex-start"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;margin-top:2px"><path d="M5 12.5 10 17.5 19 7" stroke="#7FC79E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
          '<span class="serif" style="font-size:12.5px;color:rgba(255,255,255,.75);line-height:1.5">'+t+'</span></div>').join('')+
        '</div></div></div>'+
      '<div><div class="lbl" style="margin-bottom:9px">Metode pembayaran</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">'+rows+'</div></div>'+
      '<button class="btn btn-p" style="font-size:14px;padding:15px" '+(U.paySel?'':'disabled')+' onclick="A.payPremium()">Bayar '+rupiah(m.premium)+' &amp; aktifkan</button>'+
      '<div style="text-align:center"><span class="demo-tag">Pembayaran simulasi — tidak ada dana nyata</span></div>';
    return;
  }
  const destKey = S.payoutDest;
  const dest = destKey && S.wallets[destKey] ? PM[destKey].name+' · '+maskPhone(S.wallets[destKey]) : null;
  const hist = S.payoutHistory.map(h=>
    '<div class="card" style="border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px">'+
    '<div style="width:9px;height:9px;border-radius:50%;background:#C4553A;flex-shrink:0;animation:pulse 2s infinite"></div>'+
    '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">'+esc(h.title)+'</div>'+
    '<div class="serif" style="font-size:11.5px;color:var(--tanah);margin-top:1px">'+esc(h.sub)+'</div></div>'+
    '<div style="text-align:right;flex-shrink:0"><div style="font-size:15px;font-weight:700;color:#C4553A">'+esc(h.amt)+'</div>'+
    '<div style="font-size:8.5px;letter-spacing:.8px;text-transform:uppercase;color:var(--tanah);margin-top:1px">'+esc(h.date)+'</div></div></div>').join('');
  v.innerHTML =
    '<div><div class="h-view">Proteksi keluarga</div>'+
    '<div class="sub-view">Dana bantuan otomatis — tanpa klaim.</div></div>'+
    '<div class="card-dark" style="padding:20px"><div class="kawung"></div><div style="position:relative">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:15px">'+
        '<div style="min-width:0"><div class="lbl-w" style="letter-spacing:1.6px">Polis · '+esc(p.policy)+'</div>'+
        '<div style="font-size:16.5px;font-weight:700;margin-top:4px">Proteksi Keluarga Menteng</div></div>'+
        '<div style="display:flex;align-items:center;gap:5px;background:rgba(46,107,79,.4);border:1px solid rgba(255,255,255,.15);border-radius:13px;padding:4px 10px;flex-shrink:0"><span style="width:6px;height:6px;border-radius:50%;background:#7FC79E"></span><span style="font-size:9px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.9)">Aktif</span></div></div>'+
      '<div style="display:flex;gap:16px;margin-bottom:15px;flex-wrap:wrap">'+
        '<div style="min-width:70px"><div style="font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:3px">Iuran minggu ini</div><div style="font-size:15px;font-weight:700">'+rupiah(m.premium)+'<span style="font-size:10px;font-weight:400;color:rgba(255,255,255,.4)">/mgg</span></div></div>'+
        '<div style="min-width:60px"><div style="font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:3px">Bantuan</div><div style="font-size:15px;font-weight:700;color:#E07B5F">Rp1,5jt</div></div>'+
        '<div style="min-width:60px"><div style="font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:3px">Via</div><div style="font-size:15px;font-weight:700">'+PM[p.method].name.split(' ')[0]+'</div></div></div>'+
      '<div style="background:rgba(255,255,255,.07);border-radius:10px;padding:11px 14px">'+
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:9.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.5)">Menuju bantuan otomatis</span>'+
        '<span style="font-size:10.5px;font-weight:600;color:#E07B5F">'+m.reportsToday+'/'+m.threshold+' laporan</span></div>'+
        '<div style="height:5px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden"><div style="height:100%;background:#E07B5F;width:'+Math.min(100,m.reportsToday/m.threshold*100)+'%"></div></div>'+
        '<div class="serif" style="font-size:11.5px;color:rgba(255,255,255,.5);margin-top:8px">'+
        (m.reportsToday>=m.threshold-1 && m.reportsToday<m.threshold ? (m.threshold-m.reportsToday)+' laporan valid lagi sebelum bantuan otomatis cair.':'Bantuan otomatis cair jika '+m.threshold+' laporan valid dalam 24 jam.')+'</div></div>'+
    '</div></div>'+
    '<div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px">'+
      '<div class="paylogo" style="width:36px;height:36px;background:'+(dest?PM[destKey].color:'#D4DDD6')+';font-size:14px">'+(dest?PM[destKey].name[0]:'?')+'</div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:600">Tujuan bantuan</div>'+
      '<div style="font-size:10.5px;color:'+(dest?'var(--tanah)':'var(--sirine)')+';margin-top:1px">'+(dest||'Belum diatur — hubungkan e-wallet')+'</div></div>'+
      '<span class="paylink" onclick="A.openPayManager()">Atur</span></div>'+
    '<div class="card" style="padding:15px 17px;display:flex;align-items:center;gap:13px;cursor:pointer" onclick="A.openFamily()">'+
      '<div class="hexnum" style="width:38px;height:42px;background:#2E6B4F"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="#fff" stroke-width="1.8"/><path d="M3.5 18c.9-2.6 3-3.8 5.5-3.8s4.6 1.2 5.5 3.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="8" r="2.3" stroke="#fff" stroke-width="1.6"/></svg></div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">Anggota keluarga terlindungi</div>'+
      '<div class="serif" style="font-size:11.5px;color:var(--tanah);margin-top:1px">'+S.family.length+' dari 4 anggota</div></div>'+
      '<span class="paylink">Kelola</span></div>'+
    '<div><div style="font-size:14.5px;font-weight:600;margin:2px 2px 10px">Riwayat bantuan</div>'+
    '<div style="display:flex;flex-direction:column;gap:8px">'+
      (hist || '<div class="card" style="border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px">'+
      '<div style="width:9px;height:9px;border-radius:50%;background:#D4DDD6;flex-shrink:0"></div>'+
      '<div style="flex:1"><div style="font-size:13px;font-weight:600">Belum ada bantuan cair</div>'+
      '<div class="serif" style="font-size:11.5px;color:var(--tanah);margin-top:1px">Kondisi wilayah terpantau</div></div>'+
      '<div style="font-size:15px;font-weight:700;color:var(--tanah)">—</div></div>')+
    '</div></div>'+
    '<div><div style="font-size:14.5px;font-weight:600;margin:2px 2px 10px">Cara kerja</div>'+
    '<div class="card" style="border-radius:14px;padding:4px 16px">'+
      [['1','Warga melapor','Laporan dari warga terverifikasi NIK di kelurahan Anda.'],
       ['2','Warga & RW memverifikasi','Setiap laporan dicek. Hanya yang valid yang dihitung.'],
       ['3','Bantuan otomatis','5 laporan valid dalam 24 jam mencairkan Rp1,5jt — tanpa klaim, tanpa formulir.']].map(s=>
      '<div style="display:flex;gap:13px;padding:14px 0;border-bottom:1px solid var(--bg);align-items:flex-start">'+
      '<div class="hexnum" style="width:24px;height:26px;font-size:11px">'+s[0]+'</div>'+
      '<div><div style="font-size:13px;font-weight:600">'+s[1]+'</div>'+
      '<div class="serif" style="font-size:12px;color:var(--teks2);line-height:1.55;margin-top:1px">'+s[2]+'</div></div></div>').join('')+
    '</div></div>';
}

export function renderProfil(){
  const v = $('#view-profil');
  const u = S.user; if(!u) return;
  const init = u.name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const arrow = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#8B7355" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const wc = ['gopay','shopeepay'].filter(k=>S.wallets[k]).length;
  v.innerHTML =
    '<div><div class="h-view">Profil</div></div>'+
    '<div class="card" style="padding:18px;display:flex;align-items:center;gap:15px">'+
      '<div style="width:54px;height:54px;border-radius:50%;background:var(--hutan);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:700;color:#fff;flex-shrink:0">'+esc(init)+'</div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:16px;font-weight:700">'+esc(u.name)+'</div>'+
      '<div class="serif" style="font-size:12px;color:var(--tanah);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(u.email)+'</div>'+
      (S.verified
        ? '<span class="pill pill-green" style="margin-top:7px"><i></i>NIK terverifikasi · '+maskNik(S.nik)+'</span>'
        : '<span class="pill pill-amber" style="margin-top:7px;cursor:pointer" onclick="A.openNik()"><i></i>Belum verifikasi — ketuk untuk verifikasi NIK</span>')+
      '</div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'+
      '<div class="card" style="border-radius:13px;padding:14px;text-align:center"><div style="font-size:23px;font-weight:700;letter-spacing:-1px">'+S.reportsSubmitted+'</div><div style="font-size:8.5px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--tanah);margin-top:3px">Laporan</div></div>'+
      '<div class="card" style="border-radius:13px;padding:14px;text-align:center"><div style="font-size:23px;font-weight:700;letter-spacing:-1px;color:var(--daun)">'+S.reportsVerifiedTotal+'</div><div style="font-size:8.5px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--tanah);margin-top:3px">Terverifikasi</div></div>'+
      '<div class="card" style="border-radius:13px;padding:14px;text-align:center"><div style="font-size:23px;font-weight:700;letter-spacing:-1px;color:var(--sirine)">'+(S.verified?100:'—')+'</div><div style="font-size:8.5px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--tanah);margin-top:3px">Skor percaya</div></div></div>'+
    '<div class="card" style="border-radius:16px;padding:2px 16px">'+
      '<div class="setrow" onclick="A.openNik()"><i style="background:'+(S.verified?'#2E6B4F':'#B8853C')+'"></i><b>Verifikasi identitas (NIK)</b>'+
        '<span style="font-size:10px;font-weight:600;color:'+(S.verified?'var(--daun)':'var(--amber)')+'">'+(S.verified?'Selesai':'Belum')+'</span>'+arrow+'</div>'+
      '<div class="setrow" onclick="A.openFamily()"><i style="background:#2E6B4F"></i><b>Anggota keluarga terlindungi</b>'+
        '<span style="font-size:10px;font-weight:600;color:var(--tanah)">'+S.family.length+'/4</span>'+arrow+'</div>'+
      '<div class="setrow" onclick="A.openPayManager()"><i style="background:#2E6B4F"></i><b>Metode pembayaran &amp; bantuan</b>'+
        '<span style="font-size:10px;font-weight:600;color:var(--tanah)">'+(wc?wc+' e-wallet':'Belum ada')+'</span>'+arrow+'</div>'+
      '<div class="setrow" onclick="A.toast(\'Notifikasi aktif untuk Kel. Menteng.\',\'#8B7355\')"><i style="background:#8B7355"></i><b>Notifikasi &amp; ambang peringatan</b>'+arrow+'</div>'+
      '<div class="setrow" onclick="A.toast(\'Bahasa: Indonesia.\',\'#8B7355\')"><i style="background:#8B7355"></i><b>Bahasa · Indonesia</b>'+arrow+'</div>'+
      '<div class="setrow" onclick="A.confirmLogout()"><i style="background:#C4553A"></i><b style="color:var(--sirine)">Keluar</b>'+arrow+'</div>'+
    '</div>'+
    '<div style="text-align:center;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:var(--tanah);padding-top:4px">JAGA · Guard Your Ground. Warga Jaga Warga.</div>';
}

/* ═══ QR TEST ═══ */
export function qrSvg(seedStr){
  let s = 0; for(const ch of seedStr) s = (s*31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { s = (s*1103515245 + 12345) >>> 0; return s/4294967296; };
  const N = 25; let r = '';
  const inF = (x,y) => (x<7&&y<7) || (x>=N-7&&y<7) || (x<7&&y>=N-7);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    let f;
    if(inF(x,y)){ const lx=x<7?x:x-(N-7), ly=y<7?y:y-(N-7); f=Math.max(Math.abs(lx-3),Math.abs(ly-3))!==2; }
    else f = rnd() < 0.44;
    if(f) r += '<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';
  }
  return '<svg viewBox="0 0 '+N+' '+N+'" style="width:100%;height:100%"><g fill="#1B3A2D">'+r+'</g></svg>';
}
