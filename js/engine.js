/* ═══════════════════════════════════════════════════════════
   JAGA RISK ENGINE — dari backend Python (JagaRiskEngine)
   Rumus:
   - Baseline Index : ((R_city − R_min) / (R_total − R_min)) × M + 1
   - Kredibilitas Z : sqrt(min(n / n_f, 1))          [Limited Fluctuation]
   - JagaRisk       : Z·RealTime + (1−Z)·Baseline
   - Premi mingguan : ceil( base × (JagaRisk / 50) / 100 ) × 100
   - Trigger payout : ceil( λ + z·sqrt(λ) )          [Shewhart Control Limit]
   ═══════════════════════════════════════════════════════════ */

const BASE_RATE = {                     // BPS 2022: crime rate / 100rb penduduk
  'Kota Jakarta Pusat'  : 328,
  'Kota Jakarta Timur'  : 192,
  'Kota Jakarta Selatan': 176,
  'Kota Jakarta Utara'  : 159,
  'Kota Jakarta Barat'  : 129,
};
const R_TOTAL_DKI = 1274;
const R_MIN = 129;
const M = 250;                          // baseline multiplier
const N_F = 20;                         // credibility standard (20 MVP, 1082 produksi)

function baselineIndex(rCity){
  if(rCity <= R_MIN) return 1.0;
  return Math.round(((rCity - R_MIN) / (R_TOTAL_DKI - R_MIN) * M + 1) * 100) / 100;
}

const baselines = {};
Object.entries(BASE_RATE).forEach(([c, r]) => baselines[c] = baselineIndex(r));

export const RiskEngine = {
  baselines,
  getBaseline: c => baselines[c] ?? 1.0,

  credibilityZ: n => Math.round(Math.sqrt(Math.min(n / N_F, 1)) * 10000) / 10000,

  jagaRisk(city, nVerified, realtime){
    const b = this.getBaseline(city);
    const z = this.credibilityZ(nVerified);
    return Math.round(((z * realtime) + ((1 - z) * b)) * 100) / 100;
  },

  premiumWeekly(risk, base = 10000){
    return Math.ceil((base * (risk / 50)) / 100) * 100;   // bulat ke atas Rp100
  },

  payoutTrigger(lambdaDaily, todayVerified, zScalar = 2){
    const lam = lambdaDaily > 0 ? lambdaDaily : 0.1;
    const threshold = Math.ceil(lam + zScalar * Math.sqrt(lam));
    return { threshold, reportsToday: todayVerified, triggered: todayVerified >= threshold };
  },
};
