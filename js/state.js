import { RiskEngine } from './engine.js';
import { Z, MENTENG } from './data.js';

export const KEY = 'jaga_demo_v7';

export function fresh(){
  return {
    user:null, verified:false, nik:null,
    wallets:{ gopay:null, shopeepay:null },
    payoutDest:null,
    protection:null,               // {active,method,since,policy,premium}
    zoneN:{},                      // n laporan terverifikasi kumulatif per-kelurahan (kredibilitas Z)
    zoneRT:{},                     // skor realtime per-kelurahan (naik saat ada laporan valid)
    zoneReports:{ 'Menteng':3 },   // laporan valid HARI INI per-kelurahan (menuju ambang pencairan)
    reportsVerifiedTotal:6,
    reportsSubmitted:0,
    family:[ { name:'Andi Wijaya', rel:'Pasangan' }, { name:'Sari Wijaya', rel:'Anak' } ],
    myFeed:[], payoutHistory:[],
    unread:true,
    notifs:[
      { dot:'#C4553A', title:'Skor keamanan turun 18 poin',   body:'Kel. Menteng — 3 laporan valid hari ini. Mendekati ambang bantuan.', time:'14:32' },
      { dot:'#2E6B4F', title:'Verifikasi warga lebih cepat',  body:'Rata-rata verifikasi laporan di Menteng kini 2 menit.',              time:'13:05' },
      { dot:'#8B7355', title:'Selamat datang di JAGA',        body:'Aktifkan proteksi untuk dana bantuan otomatis tanpa klaim.',         time:'09:00' },
    ],
  };
}

export let S;
try {
  const r = localStorage.getItem(KEY);
  S = r ? Object.assign(fresh(), JSON.parse(r)) : fresh();
} catch(e){ S = fresh(); }

export function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
export function resetState(){ S = fresh(); save(); }

export const U = {
  tab:'beranda', filter:'semua', selId:null, notifOpen:false,
  laporCat:null, laporText:'', laporLoc:'Menteng', laporSent:false, laporStage:1,
  paySel:null, pending:null, timers:[],
};
export function timer(fn, ms){
  const t = setTimeout(()=>{ U.timers = U.timers.filter(x=>x!==t); fn(); }, ms);
  U.timers.push(t); return t;
}
export function clearTimers(){ U.timers.forEach(clearTimeout); U.timers = []; }

const N0 = 8, RT_STEP = 4;

export function zoneBase(name){ const z = Z.find(z=>z[0]===name); return z ? z[1] : 44; }
export function zoneN(name){ return S.zoneN[name] != null ? S.zoneN[name] : N0; }
export function zoneRT(name){
  if(S.zoneRT[name] != null) return S.zoneRT[name];
  const Zc = RiskEngine.credibilityZ(N0), B = RiskEngine.getBaseline(MENTENG.city);
  return Math.max(0, Math.min(100, (zoneBase(name) - (1-Zc)*B) / Zc));   // kalibrasi awal
}
export function zoneScore(name){
  return Math.max(0, Math.min(100, Math.round(RiskEngine.jagaRisk(MENTENG.city, zoneN(name), zoneRT(name)))));
}
export function zoneReportsToday(name){
  return (S.zoneReports && S.zoneReports[name] != null) ? S.zoneReports[name] : 0;
}
export function zoneTrigger(name){
  return RiskEngine.payoutTrigger(MENTENG.lambdaDaily, zoneReportsToday(name));
}
/* catat 1 laporan terverifikasi di kelurahan → semua angka mengikuti model */
export function zoneAddVerified(name){
  S.zoneN[name]  = zoneN(name) + 1;
  S.zoneRT[name] = Math.min(100, zoneRT(name) + RT_STEP);
  S.zoneReports[name] = zoneReportsToday(name) + 1;
}

export function menteng(){
  const score   = zoneScore('Menteng');
  const rToday  = zoneReportsToday('Menteng');
  const trig    = zoneTrigger('Menteng');
  const premium = RiskEngine.premiumWeekly(score);
  return { score, threshold:trig.threshold, reportsToday:rToday, triggered:trig.triggered, premium };
}
