import { $, $$, esc, nowHM, maskPhone, maskNik, rupiah } from './util.js';
import { S, U, save, resetState, timer, clearTimers,
         zoneScore, zoneReportsToday, zoneTrigger, zoneAddVerified, menteng } from './state.js';
import { Z, PM, band, MENTENG } from './data.js';
import { toast, pushNotif, renderNotifs, openModal, closeModal, closeX, setTabIcons,
         renderHome, renderChips, renderZoneSheet, renderLapor, renderProteksi, renderProfil, qrSvg } from './ui.js';
import { maps, showMap, refreshZones, destroyMaps } from './maps.js';

const sosWarga = r => Math.round(r*r/1400 + 6);

const A = window.A = {
  toast, closeModal,

  go(tab){
    U.tab = tab; U.notifOpen = false;
    $('#notif-panel').classList.add('hidden'); $('#notif-scrim').classList.add('hidden');
    ['beranda','peta','lapor','proteksi','profil'].forEach(t=>
      $('#view-'+t).classList.toggle('hidden', t!==tab));
    $('#sos-fab').classList.toggle('hidden', !(tab==='beranda'||tab==='peta'));
    setTabIcons();
    if(tab==='beranda'){ renderHome(); showMap('mini'); }
    if(tab==='peta'){ renderChips(); showMap('full'); }
    if(tab==='lapor') renderLapor();
    if(tab==='proteksi') renderProteksi();
    if(tab==='profil') renderProfil();
    renderZoneSheet();
  },
  toggleNotif(){
    U.notifOpen = !U.notifOpen;
    $('#notif-panel').classList.toggle('hidden', !U.notifOpen);
    $('#notif-scrim').classList.toggle('hidden', !U.notifOpen);
    if(U.notifOpen){ S.unread = false; save(); $('#bell-dot').classList.add('hidden'); }
  },

  zoom(kind,dir){ const m = maps[kind]; if(m && m._container.isConnected) dir>0 ? m.zoomIn() : m.zoomOut(); },
  recenter(kind){ const m = maps[kind]; if(m && m._container.isConnected) m.flyTo([-6.1880,106.8340], kind==='mini'?13:13.5); },
  setFilter(f){
    U.filter = f;
    if(U.selId != null){
      const s = zoneScore(Z[U.selId][0]);
      const cat = s>60?'tinggi':s>=30?'sedang':'rendah';
      if(f!=='semua' && f!==cat){ U.selId = null; renderZoneSheet(); }
    }
    renderChips(); refreshZones();
  },
  tapZone(i,kind){
    if(kind==='mini'){ U.selId = i; this.go('peta'); refreshZones(); return; }
    U.selId = U.selId===i ? null : i;
    refreshZones(); renderZoneSheet();
  },
  closeZone(){ U.selId = null; refreshZones(); renderZoneSheet(); },
  laporFrom(name){ U.selId = null; renderZoneSheet(); U.laporLoc = name; U.laporSent = false; this.go('lapor'); },

  openSos(){
    U._sosRadius = U._sosRadius || 500;
    const opts = [300,500,1000];
    openModal(
      '<div style="text-align:center;padding:2px 2px 0">'+
      '<div class="hexnum" style="width:52px;height:57px;margin:0 auto 12px;background:var(--sirine)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3v9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17" r="1.3" fill="#fff"/></svg></div>'+
      '<div class="mtitle" style="color:var(--sirine)">Kirim peringatan darurat</div>'+
      '<div class="msub" style="margin-top:6px">Semua warga JAGA dalam radius pilihan akan menerima peringatan lokasi Anda secara langsung.</div></div>'+
      '<div class="lbl" style="margin:16px 0 8px">Radius peringatan</div>'+
      '<div id="sos-radopts" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'+
      opts.map(r=>'<div class="mth" data-r="'+r+'" onclick="A.sosRadius('+r+')" style="flex-direction:column;align-items:center;gap:3px;padding:14px 6px'+(U._sosRadius===r?';border-color:var(--sirine);background:rgba(196,85,58,.05)':'')+'">'+
        '<div style="font-size:17px;font-weight:700;color:'+(U._sosRadius===r?'var(--sirine)':'var(--hutan)')+'">'+(r>=1000?(r/1000)+' km':r+' m')+'</div>'+
        '<div style="font-size:9px;letter-spacing:.5px;text-transform:uppercase;color:var(--tanah)">± '+sosWarga(r)+' warga</div></div>').join('')+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:18px">'+
      '<button class="btn btn-o" style="flex:1" onclick="A.closeModal()">Batal</button>'+
      '<button class="btn btn-p" style="flex:2" onclick="A.sosSend()">Kirim SOS sekarang</button></div>'+
      '<div style="text-align:center;margin-top:10px"><span class="demo-tag">Simulasi — tidak ada peringatan nyata dikirim</span></div>'
    );
  },
  sosRadius(r){ U._sosRadius = r; this.openSos(); },
  sosSend(){
    if(!S.verified){ U.pending = ()=>A.sosSend(); this.openNik('Verifikasi NIK dulu agar peringatan SOS Anda dipercaya warga sekitar.'); return; }
    const r = U._sosRadius||500, n = sosWarga(r);
    openModal('<div style="text-align:center;padding:22px 6px"><div class="spin big" style="border-top-color:var(--sirine)"></div>'+
      '<div style="font-size:13.5px;font-weight:600;margin-top:14px">Menyiarkan peringatan…</div>'+
      '<div class="serif" style="font-size:12px;color:var(--teks2);margin-top:3px">Radius '+(r>=1000?(r/1000)+' km':r+' m')+' · Kel. '+esc(U.laporLoc)+'</div></div>', true);
    timer(()=>{
      openModal(
        '<div style="text-align:center;padding:8px 4px">'+
        '<div class="hexnum" style="width:60px;height:66px;margin:0 auto 14px;background:var(--sirine)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
        '<div class="mtitle">Peringatan terkirim</div>'+
        '<div class="msub" style="margin-top:6px"><b style="font-style:normal;color:var(--sirine)">'+n+' warga JAGA</b> dalam radius '+(r>=1000?(r/1000)+' km':r+' m')+' menerima peringatan darurat &amp; titik lokasi Anda. Ketua RW '+esc(U.laporLoc)+' ikut diberi tahu.</div>'+
        '<button class="btn btn-dark" style="width:100%;margin-top:18px" onclick="A.closeModal()">Selesai</button>'+
        '<button class="btn btn-o" style="width:100%;margin-top:8px" onclick="A.closeModal();A.laporFrom(\''+esc(U.laporLoc)+'\')">Lanjut buat laporan resmi</button></div>', true);
      pushNotif('#C4553A','SOS Anda tersiar','Peringatan darurat dikirim ke '+n+' warga dalam radius '+(r>=1000?(r/1000)+' km':r+' m')+'.');
      toast('SOS terkirim ke '+n+' warga sekitar.', '#C4553A');
    }, 1600);
  },

  openAccounts(){
    const accs = [
      { name:'Rina Wijaya',  email:'rina.wijaya@gmail.com',    c:'#7B1FA2' },
      { name:'Joshua Albert', email:'amenhaleluya07@gmail.com', c:'#1565C0' },
    ];
    A._accs = accs;
    openModal(
      '<div style="text-align:center;padding:4px 0 10px">'+
        '<svg width="30" height="30" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>'+
        '<div style="font-size:15.5px;font-weight:600;color:#1f1f1f;margin-top:8px">Pilih akun</div>'+
        '<div style="font-size:12px;color:#5f6368;margin-top:2px">untuk melanjutkan ke <b style="color:var(--hutan)">JAGA</b></div></div>'+
      accs.map((a,i)=>'<div class="acc" onclick="A.pickAccount('+i+')">'+
        '<div class="av" style="background:'+a.c+'">'+a.name[0]+'</div>'+
        '<div><div class="nm">'+esc(a.name)+'</div><div class="em">'+esc(a.email)+'</div></div></div>').join('')+
      '<div class="acc" onclick="A.openEmail()">'+
        '<div class="av" style="background:#F1F3F4;color:#5f6368;border:1px solid #dadce0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.5" r="3.4" stroke="#5f6368" stroke-width="1.8"/><path d="M5 19.5c1.1-3.2 3.8-4.7 7-4.7s5.9 1.5 7 4.7" stroke="#5f6368" stroke-width="1.8" stroke-linecap="round"/></svg></div>'+
        '<div class="nm" style="font-weight:500">Gunakan akun lain</div></div>'+
      '<div style="font-size:10.5px;color:#5f6368;line-height:1.6;padding:10px 10px 0;border-top:1px solid var(--bg);margin-top:8px">Prototipe: tidak ada data dikirim ke Google. Akun hanya tersimpan di perangkat Anda.</div>'
    );
  },
  pickAccount(i){ A._loginLoading(A._accs[i], 'google'); },
  openEmail(){
    openModal(
      '<div class="mhead"><div><div class="mtitle">Masuk dengan Email</div>'+
      '<div class="msub">Masukkan nama &amp; email. Prototipe ini tanpa kata sandi.</div></div>'+closeX+'</div>'+
      '<div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">'+
      '<input id="oa-name" class="inp" placeholder="Nama lengkap" maxlength="40">'+
      '<input id="oa-email" class="inp" type="email" placeholder="nama@email.com" maxlength="60">'+
      '<div id="oa-err" class="err-msg hidden"></div>'+
      '<button class="btn btn-dark" onclick="A.emailSubmit()">Lanjutkan</button></div>'
    );
    setTimeout(()=>{ const el=$('#oa-name'); if(el) el.focus(); }, 80);
  },
  emailSubmit(){
    const name = $('#oa-name').value.trim(), email = $('#oa-email').value.trim(), err = $('#oa-err');
    if(name.length<2){ err.textContent='Nama minimal 2 karakter.'; err.classList.remove('hidden'); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ err.textContent='Format email tidak valid.'; err.classList.remove('hidden'); return; }
    A._loginLoading({name, email}, 'email');
  },
  _loginLoading(a, via){
    openModal('<div style="text-align:center;padding:22px 6px"><div class="spin big"></div>'+
      '<div style="font-size:13.5px;font-weight:600;margin-top:14px">'+(via==='google'?'Masuk dengan Google…':'Memverifikasi email…')+'</div>'+
      '<div class="serif" style="font-size:12px;color:var(--teks2);margin-top:3px">'+esc(a.email)+'</div></div>', true);
    timer(()=>{
      S.user = { name:a.name, email:a.email }; save();
      closeModal(); enterApp();
      toast('Masuk sebagai '+a.name.split(' ')[0]+'. Selamat datang di JAGA.');
      if(!S.verified) timer(()=>A.openNik('Satu langkah lagi — verifikasi NIK untuk membuka semua fitur.'), 900);
    }, 1400);
  },
  confirmLogout(){
    openModal(
      '<div class="mtitle">Keluar dari JAGA?</div>'+
      '<div class="msub">Sesi demo di perangkat ini akan dihapus — termasuk verifikasi NIK, e-wallet, dan proteksi simulasi.</div>'+
      '<div style="display:flex;gap:8px;margin-top:18px">'+
      '<button class="btn btn-o" style="flex:1" onclick="A.closeModal()">Batal</button>'+
      '<button class="btn btn-p" style="flex:1" onclick="A.logout()">Keluar</button></div>', true);
  },
  logout(){
    clearTimers(); closeModal();
    resetState();
    destroyMaps();
    Object.assign(U, { tab:'beranda', filter:'semua', selId:null, laporCat:null, laporText:'', laporSent:false, laporStage:1, paySel:null, pending:null });
    $('#scr-app').classList.add('hidden');
    $('#scr-login').classList.remove('hidden');
  },

  openNik(reason){
    if(S.verified){ toast('Identitas Anda sudah terverifikasi.'); return; }
    openModal(
      '<div class="mhead"><div><div class="mtitle">Verifikasi NIK</div>'+
      '<div class="msub">'+esc(reason||'Fitur Lapor, Proteksi & bantuan hanya untuk warga terverifikasi KTP.')+'</div></div>'+closeX+'</div>'+
      '<div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">'+
      '<div><div class="lbl" style="margin-bottom:6px">NIK (16 digit)</div>'+
      '<input id="nik-inp" class="inp" inputmode="numeric" maxlength="16" placeholder="317104••••••••••" oninput="A.nikTyping(this)">'+
      '<div id="nik-count" style="font-size:10px;color:var(--tanah);margin-top:5px">0/16 digit</div></div>'+
      '<div><div class="lbl" style="margin-bottom:6px">Nama sesuai KTP</div>'+
      '<input id="nik-nama" class="inp" maxlength="40" value="'+esc(S.user?S.user.name:'')+'"></div>'+
      '<div id="nik-err" class="err-msg hidden"></div>'+
      '<div class="serif" style="background:rgba(46,107,79,.06);border:1px solid rgba(46,107,79,.18);border-radius:11px;padding:11px 14px;font-size:11.5px;color:var(--teks2);line-height:1.55">Simulasi pengecekan Dukcapil — data tidak dikirim ke mana pun, hanya tersimpan di perangkat Anda.</div>'+
      '<button id="nik-btn" class="btn btn-dark" onclick="A.nikSubmit()">Verifikasi sekarang</button></div>'
    );
    setTimeout(()=>{ const el=$('#nik-inp'); if(el) el.focus(); }, 80);
  },
  nikTyping(el){
    el.value = el.value.replace(/\D/g,'').slice(0,16);
    const c = $('#nik-count'); if(c) c.textContent = el.value.length+'/16 digit';
    el.classList.remove('inp-err');
  },
  nikSubmit(){
    const nik = $('#nik-inp').value, nama = $('#nik-nama').value.trim(), err = $('#nik-err');
    err.classList.add('hidden');
    if(!/^\d{16}$/.test(nik)){ err.textContent='NIK harus tepat 16 digit angka.'; err.classList.remove('hidden'); $('#nik-inp').classList.add('inp-err'); return; }
    if(nama.length<2){ err.textContent='Nama sesuai KTP wajib diisi.'; err.classList.remove('hidden'); return; }
    const btn = $('#nik-btn'); btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:9px"><span class="spin-in"></span>Memeriksa ke Dukcapil…</span>';
    timer(()=>{
      S.verified = true; S.nik = nik;
      if(S.user && nama && nama!==S.user.name) S.user.name = nama;
      save(); closeModal();
      toast('Identitas terverifikasi. Semua fitur terbuka.');
      pushNotif('#2E6B4F','Identitas terverifikasi','NIK '+maskNik(nik)+' cocok dengan data kependudukan (simulasi).');
      renderHome();
      if(U.tab==='lapor') renderLapor();
      if(U.tab==='proteksi') renderProteksi();
      if(U.tab==='profil') renderProfil();
      const p = U.pending; U.pending = null;
      if(p) timer(p, 350);
    }, 1800);
  },
  _requireVerify(reason, next){ if(S.verified) return true; U.pending = next; this.openNik(reason); return false; },

  openFamily(){
    const rows = S.family.length ? S.family.map((f,i)=>{
      const init = f.name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
      return '<div class="fam-row"><div class="fam-av">'+esc(init)+'</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">'+esc(f.name)+'</div>'+
        '<div style="font-size:10.5px;color:var(--tanah)">'+esc(f.rel)+'</div></div>'+
        '<span class="paylink red" onclick="A.removeFamily('+i+')">Hapus</span></div>';
    }).join('') : '<div class="serif" style="font-size:12px;color:var(--teks2);padding:14px 2px;line-height:1.55">Belum ada anggota keluarga. Tambahkan hingga 4 orang agar ikut terlindungi.</div>';
    const full = S.family.length >= 4;
    openModal(
      '<div class="mhead"><div><div class="mtitle">Anggota keluarga</div>'+
      '<div class="msub">Hingga 4 anggota ikut terlindungi dalam satu perlindungan ('+S.family.length+'/4).</div></div>'+closeX+'</div>'+
      '<div style="margin-top:6px">'+rows+'</div>'+
      (full ? '<div class="serif" style="font-size:11.5px;color:var(--tanah);text-align:center;margin-top:12px">Kuota anggota sudah penuh.</div>'
            : '<button class="btn btn-dark" style="width:100%;margin-top:14px" onclick="A.addFamilyForm()">+ Tambah anggota</button>')
    );
  },
  addFamilyForm(){
    const rels = ['Pasangan','Anak','Orang tua','Saudara','Lainnya'];
    openModal(
      '<div class="mhead"><div><div class="mtitle">Tambah anggota</div>'+
      '<div class="msub">Data anggota keluarga yang ikut dilindungi.</div></div>'+closeX+'</div>'+
      '<div style="display:flex;flex-direction:column;gap:12px;margin-top:14px">'+
      '<div><div class="lbl" style="margin-bottom:6px">Nama lengkap</div><input id="fm-name" class="inp" maxlength="40" placeholder="Nama sesuai KTP"></div>'+
      '<div><div class="lbl" style="margin-bottom:6px">Hubungan</div>'+
      '<div id="fm-rels" style="display:flex;flex-wrap:wrap;gap:7px">'+
      rels.map((r,i)=>'<div class="chip-filter'+(i===0?' on':'')+'" style="box-shadow:none" data-rel="'+r+'" onclick="A.pickRel(this)">'+r+'</div>').join('')+'</div></div>'+
      '<div id="fm-err" class="err-msg hidden"></div>'+
      '<div style="display:flex;gap:8px"><button class="btn btn-o" style="flex:1" onclick="A.openFamily()">Batal</button>'+
      '<button class="btn btn-p" style="flex:1" onclick="A.addFamily()">Simpan</button></div></div>'
    );
    A._fmRel = 'Pasangan';
    setTimeout(()=>{ const el=$('#fm-name'); if(el) el.focus(); }, 80);
  },
  pickRel(el){ A._fmRel = el.dataset.rel; $$('#fm-rels .chip-filter').forEach(c=>c.classList.toggle('on', c===el)); },
  addFamily(){
    const name = $('#fm-name').value.trim(), err = $('#fm-err');
    if(name.length<2){ err.textContent='Nama minimal 2 karakter.'; err.classList.remove('hidden'); return; }
    if(S.family.length>=4){ this.openFamily(); return; }
    S.family.push({ name, rel:A._fmRel||'Lainnya' }); save();
    toast(name.split(' ')[0]+' ditambahkan ke keluarga.');
    this.openFamily();
    if(U.tab==='proteksi') renderProteksi();
    if(U.tab==='profil') renderProfil();
  },
  removeFamily(i){
    const nm = S.family[i] ? S.family[i].name : '';
    S.family.splice(i,1); save();
    toast((nm?nm.split(' ')[0]+' d':'D')+'ihapus dari keluarga.', '#8B7355');
    this.openFamily();
    if(U.tab==='proteksi') renderProteksi();
    if(U.tab==='profil') renderProfil();
  },

  pickCat(c){
    U.laporCat = U.laporCat===c ? null : c;
    $$('#lapor-cats .cat').forEach(el=>el.classList.toggle('on', el.dataset.cat===U.laporCat));
    const btn = $('#btn-lapor'); if(btn) btn.disabled = !U.laporCat;
  },
  laporTyping(v){ U.laporText = v; },
  openKelurahan(){
    openModal(
      '<div class="mhead"><div><div class="mtitle">Pilih lokasi kejadian</div>'+
      '<div class="msub">Kelurahan di wilayah pilot Jakarta Pusat.</div></div>'+closeX+'</div>'+
      '<div style="margin-top:10px">'+
      Z.map(z=>{ const sc = zoneScore(z[0]), b = band(sc);   // skor DINAMIS, bukan baseline
        return '<div class="setrow" onclick="A.pickKelurahan(\''+esc(z[0])+'\')">'+
        '<i style="background:'+b.c+'"></i><b>Kel. '+esc(z[0])+'</b>'+
        '<span style="font-size:11px;font-weight:700;color:'+b.c+'">'+sc+'</span></div>'; }).join('')+'</div>'
    );
  },
  pickKelurahan(name){ U.laporLoc = name; closeModal(); renderLapor(); },
  laporSubmit(){
    if(!U.laporCat) return;
    if(!this._requireVerify('Untuk mengirim laporan, verifikasi NIK dulu — laporan anonim tidak dihitung.', ()=>A.laporSubmit())) return;
    U.laporSent = true; U.laporStage = 2;
    S.reportsSubmitted++; save();
    renderLapor();
    timer(()=>{
      U.laporStage = 3;
      const loc = U.laporLoc;
      S.reportsVerifiedTotal++;
      zoneAddVerified(loc);           // n+1, realtime+4 → skor naik via rumus engine
      S.myFeed.unshift({ dot:'#C4553A', title:U.laporCat+' · Kel. '+loc, body:'Laporan Anda — sudah diverifikasi warga & tercatat.', status:'Terverifikasi', pill:'pill-green', time:nowHM() });
      S.myFeed = S.myFeed.slice(0,3);
      save();
      pushNotif('#2E6B4F','Laporan Anda diverifikasi','Skor risiko '+loc+' kini '+zoneScore(loc)+'/100 · '+zoneReportsToday(loc)+'/'+zoneTrigger(loc).threshold+' laporan menuju pencairan.');
      toast('Skor risiko '+loc+' naik ke '+zoneScore(loc)+'/100.', '#C4553A');
      refreshZones();                 // peta ikut update
      if(U.tab==='lapor') renderLapor();
      renderHome();
      if(U.tab==='proteksi') renderProteksi();
      renderZoneSheet();
      A._tryPayout(loc);              // cek pencairan di kelurahan TEMPAT lapor
    }, 4500);
  },
  laporReset(){ U.laporSent = false; U.laporStage = 1; U.laporCat = null; U.laporText = ''; renderLapor(); },

  _tryPayout(loc){
    loc = loc || 'Menteng';
    const trig = zoneTrigger(loc);
    if(!trig.triggered) return;
    if(!(S.protection && S.protection.active)){
      pushNotif('#C4553A','Ambang bantuan terlampaui', trig.threshold+' laporan valid di Kel. '+loc+'. Aktifkan proteksi untuk bantuan otomatis berikutnya.');
      openModal(
        '<div style="text-align:center;padding:8px 4px">'+
        '<div class="hexnum" style="width:52px;height:57px;margin:0 auto 12px;background:var(--amber);font-size:20px">!</div>'+
        '<div class="mtitle">Ambang bantuan terlampaui</div>'+
        '<div class="msub" style="margin-top:6px">'+trig.threshold+' laporan valid hari ini di Kel. '+esc(loc)+'. Warga dengan proteksi aktif menerima Rp1,5jt otomatis. Aktifkan agar Anda ikut terlindungi.</div>'+
        '<button class="btn btn-p" style="width:100%;margin-top:16px" onclick="A.closeModal();A.go(\'proteksi\')">Aktifkan proteksi</button>'+
        '<button class="btn btn-o" style="width:100%;margin-top:8px" onclick="A.closeModal()">Nanti saja</button></div>', true);
      S.zoneReports[loc] = Math.max(0, trig.threshold-1); save(); renderHome(); return;
    }
    if(!S.payoutDest || !S.wallets[S.payoutDest]){
      S._pendingPayout = true; S._pendingZone = loc; save();
      pushNotif('#B8853C','Bantuan Rp1,5jt siap cair','Ambang di Kel. '+loc+' terpicu — hubungkan e-wallet untuk menerima dana.');
      openModal(
        '<div style="text-align:center;padding:8px 4px">'+
        '<div class="hexnum" style="width:56px;height:62px;margin:0 auto 12px;background:var(--sirine)"><span style="font-size:20px">Rp</span></div>'+
        '<div class="mtitle">Bantuan Rp1.500.000 siap cair</div>'+
        '<div class="msub" style="margin-top:6px">Ambang di Kel. '+esc(loc)+' terpicu. Hubungkan e-wallet tujuan agar dana langsung masuk.</div>'+
        '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">'+
        '<button class="btn btn-dark" onclick="A.openConnect(\'gopay\')">Hubungkan GoPay</button>'+
        '<button class="btn btn-o" onclick="A.openConnect(\'shopeepay\')">Hubungkan ShopeePay</button></div></div>', true);
      if(U.tab==='proteksi') renderProteksi();
      return;
    }
    this._doPayout(loc);
  },
  _tryPayoutAll(){
    const hit = Object.keys(S.zoneReports).find(k=>zoneTrigger(k).triggered);
    if(hit) this._tryPayout(hit);
  },
  _doPayout(loc){
    loc = loc || S._pendingZone || 'Menteng';
    const dk = S.payoutDest, w = S.wallets[dk];
    const th = zoneTrigger(loc).threshold;
    S.zoneReports[loc] = 0; S._pendingPayout = false; S._pendingZone = null;
    S.payoutHistory.unshift({ title:'Dana bantuan cair · Kel. '+loc, sub:'Kondisi wilayah memburuk · '+th+' laporan valid · ke '+PM[dk].name+' '+maskPhone(w), amt:'Rp1,5jt', date:'Hari ini' });
    save();
    pushNotif('#C4553A','Bantuan Rp1.500.000 terkirim','Ke '+PM[dk].name+' '+maskPhone(w)+' — didukung '+th+' laporan terverifikasi di '+loc+'.');
    openModal(
      '<div style="text-align:center;padding:10px 4px">'+
      '<div class="hexnum" style="width:64px;height:70px;margin:0 auto 14px;background:var(--sirine)"><span style="font-size:22px">Rp</span></div>'+
      '<div class="mtitle">Dana bantuan cair 🎉</div>'+
      '<div style="font-size:30px;font-weight:700;letter-spacing:-1px;margin:10px 0 4px;color:var(--sirine)">Rp1.500.000</div>'+
      '<div class="msub">Terkirim ke '+PM[dk].name+' '+maskPhone(w)+' — dipicu '+th+' laporan terverifikasi warga di Kel. '+esc(loc)+'. Tanpa klaim, tanpa formulir.</div>'+
      '<button class="btn btn-dark" style="width:100%;margin-top:18px" onclick="A.closeModal()">Mengerti</button></div>', true);
    $('#payout-sub').textContent = 'Rp1.500.000 → '+PM[dk].name+' '+maskPhone(w)+' (simulasi)';
    $('#payout-toast').classList.remove('hidden');
    timer(()=>A.hidePayoutToast(), 9000);
    renderHome();
    if(U.tab==='proteksi') renderProteksi();
  },
  hidePayoutToast(){ $('#payout-toast').classList.add('hidden'); },

  openConnect(k){
    const m = PM[k];
    openModal(
      '<div class="mhead"><div><div class="mtitle">Hubungkan '+m.name+'</div>'+
      '<div class="msub">Masukkan nomor HP terdaftar di '+m.name+'. Kami hanya menyimpan nomor — tanpa PIN, tanpa saldo.</div></div>'+closeX+'</div>'+
      '<div style="display:flex;align-items:center;gap:11px;margin:16px 0 12px">'+
      '<div class="paylogo" style="background:'+m.color+'">'+m.name[0]+'</div>'+
      '<div><div style="font-size:13.5px;font-weight:600">'+m.name+'</div><div style="font-size:10.5px;color:var(--tanah)">Untuk iuran &amp; penerimaan bantuan</div></div></div>'+
      '<input id="cn-phone" class="inp" inputmode="numeric" maxlength="13" placeholder="08xxxxxxxxxx" oninput="this.value=this.value.replace(/\\D/g,\'\');this.classList.remove(\'inp-err\')">'+
      '<div id="cn-err" class="err-msg hidden"></div>'+
      '<button id="cn-btn" class="btn btn-dark" style="width:100%;margin-top:12px" onclick="A.connectSubmit(\''+k+'\')">Hubungkan akun</button>'
    );
    setTimeout(()=>{ const el=$('#cn-phone'); if(el) el.focus(); }, 80);
  },
  connectSubmit(k){
    const ph = $('#cn-phone').value, err = $('#cn-err');
    if(!/^08\d{8,11}$/.test(ph)){ err.textContent='Nomor HP tidak valid — awali 08, panjang 10–13 digit.'; err.classList.remove('hidden'); $('#cn-phone').classList.add('inp-err'); return; }
    const btn = $('#cn-btn'); btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:9px"><span class="spin-in"></span>Menghubungi '+PM[k].name+'…</span>';
    timer(()=>{
      S.wallets[k] = ph;
      if(!S.payoutDest) S.payoutDest = k;
      save(); closeModal();
      toast(PM[k].name+' terhubung · '+maskPhone(ph));
      pushNotif('#2E6B4F', PM[k].name+' terhubung', 'Siap dipakai untuk iuran & bantuan otomatis.');
      if(U.tab==='proteksi') renderProteksi();
      if(U.tab==='profil') renderProfil();
      if(S._pendingPayout && S.payoutDest && S.wallets[S.payoutDest]) A._doPayout(S._pendingZone);
    }, 1600);
  },
  disconnect(k){
    openModal(
      '<div class="mtitle">Putuskan '+PM[k].name+'?</div>'+
      '<div class="msub">'+(S.payoutDest===k?'Ini tujuan bantuan Anda saat ini — bantuan akan tertahan sampai memilih e-wallet lain.':'Anda bisa menghubungkannya lagi kapan saja.')+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:18px">'+
      '<button class="btn btn-o" style="flex:1" onclick="A.openPayManager()">Batal</button>'+
      '<button class="btn btn-p" style="flex:1" onclick="A.disconnectYes(\''+k+'\')">Putuskan</button></div>', true);
  },
  disconnectYes(k){
    S.wallets[k] = null;
    if(S.payoutDest===k){ const other = ['gopay','shopeepay'].find(x=>S.wallets[x]); S.payoutDest = other || null; }
    save();
    toast(PM[k].name+' diputuskan.', '#8B7355');
    this.openPayManager();
    if(U.tab==='proteksi') renderProteksi();
    if(U.tab==='profil') renderProfil();
  },
  openPayManager(){
    const wrow = k => {
      const m = PM[k], w = S.wallets[k];
      return '<div class="payrow"><div class="paylogo" style="background:'+m.color+'">'+m.name[0]+'</div>'+
        '<div style="flex:1;min-width:0"><div class="pn">'+m.name+'</div>'+
        '<div class="ps">'+(w?'Terhubung · '+maskPhone(w):'Belum terhubung')+'</div></div>'+
        (w ? '<span class="paylink red" onclick="A.disconnect(\''+k+'\')">Putuskan</span>'
           : '<span class="paylink" onclick="A.openConnect(\''+k+'\')">Hubungkan</span>')+'</div>';
    };
    const connected = ['gopay','shopeepay'].filter(k=>S.wallets[k]);
    openModal(
      '<div class="mhead"><div><div class="mtitle">Pembayaran &amp; bantuan</div>'+
      '<div class="msub">E-wallet untuk iuran mingguan dan penerimaan bantuan otomatis.</div></div>'+closeX+'</div>'+
      '<div style="margin-top:8px">'+wrow('gopay')+wrow('shopeepay')+
      '<div class="payrow"><div class="paylogo" style="background:#1B3A2D">Q</div>'+
        '<div style="flex:1"><div class="pn">QRIS</div><div class="ps">Selalu tersedia untuk bayar iuran — tanpa perlu terhubung</div></div></div>'+
      '<div class="payrow"><div class="paylogo" style="background:#4A6356">K</div>'+
        '<div style="flex:1"><div class="pn">Kartu debit/kredit</div><div class="ps">Via JagaPay Gateway saat pembayaran iuran</div></div></div></div>'+
      (connected.length ?
        '<div class="lbl" style="margin:16px 0 8px">Tujuan bantuan otomatis</div>'+
        connected.map(k=>'<div class="mth'+(S.payoutDest===k?' on':'')+'" style="margin-bottom:8px" onclick="A.setDest(\''+k+'\')">'+
          '<div class="radio"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">'+PM[k].name+'</div>'+
          '<div style="font-size:10px;color:var(--tanah)">'+maskPhone(S.wallets[k])+'</div></div></div>').join('')
        : '<div class="serif" style="font-size:12px;color:var(--teks2);background:var(--bg);border-radius:10px;padding:11px 14px;margin-top:12px;line-height:1.55">Hubungkan GoPay atau ShopeePay agar bantuan otomatis punya tujuan transfer.</div>')
    );
  },
  setDest(k){
    S.payoutDest = k; save();
    toast('Tujuan bantuan: '+PM[k].name+' '+maskPhone(S.wallets[k]));
    this.openPayManager();
    if(U.tab==='proteksi') renderProteksi();
    if(S._pendingPayout){ closeModal(); this._doPayout(S._pendingZone); }
  },

  pickMethod(k){
    if((k==='gopay'||k==='shopeepay') && !S.wallets[k]){ this.openConnect(k); return; }
    U.paySel = U.paySel===k ? null : k;
    renderProteksi();
  },
  payPremium(){
    if(!U.paySel) return;
    if(!this._requireVerify('Perlindungan diterbitkan atas nama sesuai KTP — verifikasi NIK dulu.', ()=>A.payPremium())) return;
    const k = U.paySel;
    if(k==='qris') return this._payQris();
    if(k==='card') return this._payGateway();
    this._payWallet(k);
  },
  _payWallet(k){
    const m = PM[k], prem = menteng().premium;
    openModal(
      '<div style="text-align:center;padding:8px 4px">'+
      '<div class="paylogo" style="background:'+m.color+';margin:0 auto 12px">'+m.name[0]+'</div>'+
      '<div class="mtitle">Bayar dengan '+m.name+'</div>'+
      '<div class="msub" style="margin-top:6px">Iuran minggu ini · Proteksi Keluarga Menteng</div>'+
      '<div style="font-size:30px;font-weight:700;letter-spacing:-1px;margin:14px 0 2px">'+rupiah(prem)+'</div>'+
      '<div style="font-size:10.5px;color:var(--tanah)">'+m.name+' · '+maskPhone(S.wallets[k])+'</div>'+
      '<button id="pw-btn" class="btn btn-p" style="width:100%;margin-top:18px" onclick="A._payWalletGo(\''+k+'\')">Konfirmasi pembayaran</button>'+
      '<div style="margin-top:10px"><span class="demo-tag">Simulasi — tanpa dana nyata</span></div></div>', true);
  },
  _payWalletGo(k){
    const btn = $('#pw-btn'); btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:9px"><span class="spin-in"></span>Memproses via '+PM[k].name+'…</span>';
    timer(()=>A._activate(k), 2000);
  },
  _payQris(){
    const prem = menteng().premium;
    openModal(
      '<div style="text-align:center;padding:4px 2px">'+
      '<div class="mtitle">Bayar via QRIS</div>'+
      '<div class="msub" style="margin-top:4px">Scan dengan aplikasi e-wallet atau m-banking mana pun.</div>'+
      '<div class="qr-wrap">'+qrSvg('JAGA-'+(S.user?S.user.email:'demo')+'-'+prem)+'</div>'+
      '<div style="font-size:22px;font-weight:700;letter-spacing:-.5px">'+rupiah(prem)+'</div>'+
      '<div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--tanah);margin-top:2px">JAGA · NMID SIMULASI00123 · berlaku 15 menit</div>'+
      '<button id="qr-btn" class="btn btn-dark" style="width:100%;margin-top:16px" onclick="A._payQrisGo()">Saya sudah bayar — cek status</button>'+
      '<div style="margin-top:10px"><span class="demo-tag">QR simulasi — jangan discan sungguhan</span></div></div>', true);
  },
  _payQrisGo(){
    const btn = $('#qr-btn'); btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:9px"><span class="spin-in"></span>Mengecek status pembayaran…</span>';
    timer(()=>A._activate('qris'), 1600);
  },
  _payGateway(){
    const prem = menteng().premium;
    openModal(
      '<div style="border-bottom:1px solid var(--bg);padding-bottom:12px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">'+
      '<div style="display:flex;align-items:center;gap:9px"><div class="paylogo" style="width:30px;height:30px;border-radius:8px;background:#4A6356;font-size:12px">J</div>'+
      '<div><div style="font-size:13.5px;font-weight:700">JagaPay Gateway</div><div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--tanah)">Halaman pembayaran aman · simulasi</div></div></div>'+closeX+'</div>'+
      '<div style="background:var(--bg);border-radius:11px;padding:13px 15px;margin-bottom:14px">'+
      '<div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span style="color:var(--teks2)">Iuran minggu ini</span><b>'+rupiah(prem)+'</b></div>'+
      '<div style="display:flex;justify-content:space-between;font-size:12.5px"><span style="color:var(--teks2)">Biaya layanan</span><b>Rp0</b></div>'+
      '<div style="border-top:1px dashed var(--abu);margin:9px 0"></div>'+
      '<div style="display:flex;justify-content:space-between;font-size:13.5px"><b>Total</b><b style="color:var(--sirine)">'+rupiah(prem)+'</b></div></div>'+
      '<div class="serif" style="font-size:12px;color:var(--teks2);line-height:1.6;margin-bottom:14px">Di aplikasi asli, di sinilah Anda diarahkan ke halaman payment gateway (Midtrans/Xendit) untuk memasukkan data kartu. Prototipe melewati langkah itu — pilih hasil transaksi.</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">'+
      '<button class="btn btn-dark" onclick="A._gatewayResult(true)">Simulasikan pembayaran berhasil</button>'+
      '<button class="btn btn-o" onclick="A._gatewayResult(false)">Simulasikan pembayaran gagal</button></div>'
    );
  },
  _gatewayResult(ok){
    if(!ok){
      openModal(
        '<div style="text-align:center;padding:8px 4px">'+
        '<div class="hexnum" style="width:44px;height:48px;margin:0 auto 12px;background:var(--sirine);font-size:19px">!</div>'+
        '<div class="mtitle">Pembayaran gagal</div>'+
        '<div class="msub" style="margin-top:6px">Bank menolak transaksi (kode 05 — simulasi). Tidak ada dana terpotong.</div>'+
        '<div style="display:flex;gap:8px;margin-top:18px">'+
        '<button class="btn btn-o" style="flex:1" onclick="A.closeModal()">Tutup</button>'+
        '<button class="btn btn-p" style="flex:1" onclick="A._payGateway()">Coba lagi</button></div></div>', true);
      return;
    }
    openModal('<div style="text-align:center;padding:22px 6px"><div class="spin big"></div>'+
      '<div style="font-size:13.5px;font-weight:600;margin-top:14px">Mengonfirmasi ke gateway…</div></div>', true);
    timer(()=>A._activate('card'), 1400);
  },
  _activate(method){
    const prem = menteng().premium;
    S.protection = {
      active:true, method, since:new Date().toISOString().slice(0,10), premium:prem,
      policy:'JG-'+String(Math.floor(1000+Math.random()*9000))+'-'+String(Math.floor(1000+Math.random()*9000)),
    };
    save();
    openModal(
      '<div style="text-align:center;padding:10px 4px">'+
      '<div class="hexnum" style="width:60px;height:66px;margin:0 auto 14px;background:var(--daun)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 10 17.5 19 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
      '<div class="mtitle">Pembayaran berhasil</div>'+
      '<div class="msub" style="margin-top:6px">'+rupiah(prem)+' via '+PM[method].name+' — proteksi keluarga Anda aktif minggu ini.</div>'+
      '<div style="font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--tanah);margin-top:12px">Polis '+esc(S.protection.policy)+'</div>'+
      '<button class="btn btn-dark" style="width:100%;margin-top:16px" onclick="A._activated()">Lihat perlindungan saya</button></div>', true);
    pushNotif('#2E6B4F','Iuran minggu ini terbayar', rupiah(prem)+' via '+PM[method].name+'. Proteksi aktif — bantuan otomatis siap.');
    toast('Proteksi keluarga aktif. Guard your ground.');
  },
  _activated(){
    closeModal(); U.paySel = null;
    renderProteksi(); renderHome();
    if(!S.payoutDest) timer(()=>{ toast('Hubungkan e-wallet sebagai tujuan bantuan.', '#B8853C'); }, 800);
    this._tryPayoutAll();   // kalau ambang kelurahan mana pun sudah terpicu, langsung proses
  },
};

function enterApp(){
  $('#scr-login').classList.add('hidden');
  $('#scr-app').classList.remove('hidden');
  renderNotifs();
  $('#bell-dot').classList.toggle('hidden', !S.unread);
  A.go('beranda');
}
function tickClock(){ const el = $('#sb-time'); if(el) el.textContent = nowHM(); }
setInterval(tickClock, 30000); tickClock();
if(S.user) enterApp();
