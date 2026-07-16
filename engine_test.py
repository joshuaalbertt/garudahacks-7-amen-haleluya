import math
import pandas as pd
from typing import Dict, Tuple

class JagaRiskEngine:
    def __init__(self, n_f_demo: int = 20, baseline_multiplier: int = 250):
        """
        Initializes the Jaga Risk Engine with baseline data and parameters.
        """
        # BPS 2022 Data: Crime Rate per 100,000 Population
        self.baseline_data = {
            "Kota Jakarta Pusat": 328,
            "Kota Jakarta Timur": 192,
            "Kota Jakarta Selatan": 176,
            "Kota Jakarta Utara": 159,
            "Kota Jakarta Barat": 129
        }

        self.R_TOTAL_DKI = 1274  # Aggregate DKI Jakarta Rate
        self.R_MIN = min(self.baseline_data.values()) # 129 (Jakarta Barat)
        self.M = baseline_multiplier

        # Credibility Standard
        self.n_f = n_f_demo # Use 20 for MVP, 1082 for Production

        # Pre-calculate baselines
        self.baselines = {city: self._calc_baseline_index(rate) for city, rate in self.baseline_data.items()}

    def _calc_baseline_index(self, r_city: float) -> float:
        """
        Calculates the Relative Gravity Baseline Index.
        Formula: ((R_city - R_min) / (R_total - R_min)) * M + 1
        """
        if r_city <= self.R_MIN:
            return 1.0

        denominator = self.R_TOTAL_DKI - self.R_MIN
        numerator = r_city - self.R_MIN

        index = (numerator / denominator) * self.M + 1
        return round(index, 2)

    def get_baseline(self, city_name: str) -> float:
        """Returns the pre-calculated baseline for a city."""
        return self.baselines.get(city_name, 1.0)

    def calculate_z(self, n_verified_reports: int) -> float:
        """
        Calculates the Credibility Weight (Z) using Limited Fluctuation Credibility.
        Formula: sqrt(min(n / n_f, 1))
        """
        z = math.sqrt(min(n_verified_reports / self.n_f, 1.0))
        return round(z, 4)

    def calculate_jaga_risk(self, city_name: str, n_verified_reports: int, realtime_score: float) -> float:
        """
        Core Engine: Blends Baseline and RealTime scores using Credibility Z.
        Formula: Z * RealTime + (1 - Z) * Baseline
        """
        baseline = self.get_baseline(city_name)
        z = self.calculate_z(n_verified_reports)

        final_score = (z * realtime_score) + ((1 - z) * baseline)
        return round(final_score, 2)

    def calculate_premium(self, jaga_risk: float, base_premium: float = 10000) -> float:
        """
        Calculates the dynamic weekly premium based on JagaRisk.
        Formula: Base Premium * (JagaRisk / 50)
        """
        premium = base_premium * (jaga_risk / 50)
        return math.ceil(premium / 100) * 100 # Round up to nearest 100 Rupiah

    def check_payout_trigger(self, lambda_avg_daily: float, today_verified_reports: int, z_scalar: float = 2.0) -> Dict:
        """
        Evaluates if the parametric trigger (Shewhart Control Limit) is met.
        Formula: ceil(lambda + z * sqrt(lambda))
        """
        if lambda_avg_daily <= 0:
            lambda_avg_daily = 0.1 # Safe default for kelurahan with no history

        threshold = math.ceil(lambda_avg_daily + z_scalar * math.sqrt(lambda_avg_daily))
        is_triggered = today_verified_reports >= threshold

        return {
            "threshold_required": threshold,
            "reports_today": today_verified_reports,
            "is_triggered": is_triggered
        }

# ==========================================
# USAGE EXAMPLE / DEMO LOGIC
# ==========================================
if __name__ == "__main__":
    # 1. Initialize Engine
    engine = JagaRiskEngine(n_f_demo=20, baseline_multiplier=250)

    print("=== JAGA BASELINE INDICES (Relative Gravity Model) ===")
    for city, idx in engine.baselines.items():
        print(f"{city}: {idx}")

    print("\n=== SCENARIO 1: Kelurahan in Jakpus, 0 Valid Reports (Pure Baseline) ===")
    # Realtime score is irrelevant here because Z=0
    risk_1 = engine.calculate_jaga_risk("Kota Jakarta Pusat", n_verified_reports=0, realtime_score=80)
    prem_1 = engine.calculate_premium(risk_1)
    print(f"JagaRisk: {risk_1} | Weekly Premium: Rp {prem_1:,}")

    print("\n=== SCENARIO 2: Kelurahan in Jakpus, 20 Valid Reports (Full Credibility Z=1, Worsening Realtime) ===")
    # Z=1, so it fully trusts the RealTimeScore of 80
    risk_2 = engine.calculate_jaga_risk("Kota Jakarta Pusat", n_verified_reports=20, realtime_score=80)
    prem_2 = engine.calculate_premium(risk_2)
    print(f"JagaRisk: {risk_2} | Weekly Premium: Rp {prem_2:,}")

    print("\n=== SCENARIO 3: Parametric Trigger Evaluation ===")
    # Average 4 crimes/day. Threshold = ceil(4 + 2*sqrt(4)) = 8
    # Today we have 8 verified reports! Trigger should fire.
    trigger_status = engine.check_payout_trigger(lambda_avg_daily=4, today_verified_reports=8)
    print(f"Trigger Fired: {trigger_status['is_triggered']} | Threshold: {trigger_status['threshold']} | Reports Today: {trigger_status['reports_today']}")
