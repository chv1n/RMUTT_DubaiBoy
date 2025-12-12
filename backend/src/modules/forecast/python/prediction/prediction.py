import sys
import json
import numpy as np
import pandas as pd
import pickle
import os

TIME_STEP = 14

# Base directory: .../forecast/python/prediction
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# models_xgb path: .../forecast/python/models_xgb
MODEL_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "models_xgb"))

def load_model(pid):
    path = os.path.join(MODEL_DIR, f"model_product_{pid}.pkl")

    if not os.path.exists(path):
        raise Exception(f"Model not found: {path}")

    with open(path, "rb") as f:
        return pickle.load(f)

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
    seq = qty[-TIME_STEP:]
    results = []

    for _ in range(steps):
        x = np.array(seq).reshape(1, -1)
        pred = float(model.predict(x)[0])
        results.append(pred)
        seq = seq[1:] + [pred]

    return results

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    pid = data["productId"]
    history = data["history"]
    days = data["days"]

    preds = forecast(pid, history, days)
    print(json.dumps({"predictions": preds}))
