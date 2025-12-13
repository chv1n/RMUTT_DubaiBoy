import sys
import json
import numpy as np
import pandas as pd
import pickle
import os

TIME_STEP = 14

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "models_xgb"))


def load_model(pid):
    path = os.path.join(MODEL_DIR, f"model_product_{pid}.pkl")
    if not os.path.exists(path):
        raise Exception(f"Model not found: {path}")

    with open(path, "rb") as f:
        return pickle.load(f)


# ✅ ต้องอยู่นอก forecast
def estimate_confidence(model, history):
    if len(history) <= TIME_STEP:
        return None

    residuals = []

    for i in range(TIME_STEP, len(history)):
        seq = history[i - TIME_STEP:i]
        x = np.array(seq).reshape(1, -1)
        pred = model.predict(x)[0]
        actual = history[i]
        residuals.append(actual - pred)

    if not residuals:
        return None

    return float(np.std(residuals))


def forecast(pid, history, steps):
    df = pd.DataFrame(history)
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"])
    df = df.drop_duplicates(subset=["Date"])
    df = df.sort_values("Date")

    qty = df["Quantity"].tolist()

    if len(qty) < TIME_STEP:
        raise Exception(f"Not enough data: need {TIME_STEP}, got {len(qty)}")

    model = load_model(pid)

    # ✅ ตอนนี้เรียกได้แล้ว
    std = estimate_confidence(model, qty)

    seq = qty[-TIME_STEP:]
    preds = []
    intervals_68 = []
    intervals_95 = []

    for _ in range(steps):
        x = np.array(seq).reshape(1, -1)
        pred = float(model.predict(x)[0])
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

        seq = seq[1:] + [pred]

    return {
        "predictions": preds,
        "confidence": {
            "std": std,
            "interval_68": intervals_68,
            "interval_95": intervals_95
        }
    }


if __name__ == "__main__":
    data = json.loads(sys.stdin.read())

    pid = data["productId"]
    history = data["history"]
    days = data["days"]

    result = forecast(pid, history, days)
    print(json.dumps(result))
