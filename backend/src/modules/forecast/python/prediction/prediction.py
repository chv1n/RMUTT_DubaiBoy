import sys
import json
import numpy as np
import pandas as pd

ALPHA = 0.2
MIN_HISTORY = 10


def ema_series(values, alpha):
    """คำนวณ EMA ทั้ง series"""
    ema_vals = [values[0]]
    for v in values[1:]:
        ema_vals.append(alpha * v + (1 - alpha) * ema_vals[-1])
    return ema_vals


def estimate_confidence_ema(values, alpha):
    """
    คำนวณ std ของ residuals จาก EMA
    ใช้เป็น uncertainty
    """
    if len(values) < MIN_HISTORY:
        return None

    ema_vals = ema_series(values, alpha)
    residuals = np.array(values) - np.array(ema_vals)

    if len(residuals) < 2:
        return None

    return float(np.std(residuals, ddof=1))


def forecast_ema(history, steps, alpha):
    df = pd.DataFrame(history)
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"])
    df = df.drop_duplicates(subset=["Date"])
    df = df.sort_values("Date")

    qty = df["Quantity"].tolist()

    if len(qty) < MIN_HISTORY:
        raise Exception(f"Not enough data: need ≥ {MIN_HISTORY}, got {len(qty)}")

    # ✅ คำนวณ EMA จาก history ทั้งหมด
    ema_vals = ema_series(qty, alpha)
    last_ema = ema_vals[-1]

    # ✅ uncertainty
    std = estimate_confidence_ema(qty, alpha)

    preds = []
    intervals_68 = []
    intervals_95 = []

    for _ in range(steps):
        pred = float(last_ema)
        preds.append(pred)

        if std is not None:
            intervals_68.append({
                "lower": pred - std,
                "upper": pred + std
            })
            intervals_95.append({
                "lower": pred - 1.96 * std,
                "upper": pred + 1.96 * std
            })

        # EMA update (ใช้ค่าที่พยากรณ์เอง)
        last_ema = alpha * pred + (1 - alpha) * last_ema

    return {
        "predictions": preds,
        "confidence": {
            "std": std,
            "interval_68": intervals_68,
            "interval_95": intervals_95
        },
        "model": "EMA",
        "alpha": alpha
    }


if __name__ == "__main__":
    data = json.loads(sys.stdin.read())

    history = data["history"]
    days = data["days"]

    result = forecast_ema(history, days, ALPHA)
    print(json.dumps(result))
