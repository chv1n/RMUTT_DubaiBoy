import sys
import json
import os
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

ALPHA = 0.2
MIN_VAL = 10

try:
    raw_input = sys.stdin.read()
    data = json.loads(raw_input)

    if not data:
        raise Exception("No training data received")

    df = pd.DataFrame(data)

    df["Date"] = pd.to_datetime(df["start_date"])
    df = df.rename(columns={
        "product_id": "ProductID",
        "input_quantity": "QuantityProduced"
    })
    df = df.sort_values("Date")

    product_ids = sorted(df["ProductID"].unique())

    def ema_forecast(series, alpha):
        """ one-step-ahead EMA forecast """
        ema = series[0]
        preds = []
        for t in range(1, len(series)):
            preds.append(ema)
            ema = alpha * series[t] + (1 - alpha) * ema
        return np.array(preds)

    trained = []
    metrics = {}

    for pid in product_ids:
        df_p = df[df["ProductID"] == pid]
        qty = df_p["QuantityProduced"].values

        if len(qty) < MIN_VAL + 1:
            continue

        # 80/20 split
        split = int(len(qty) * 0.8)
        train, val = qty[:split], qty[split:]

        if len(val) < MIN_VAL:
            continue

        # EMA prediction
        all_series = np.concatenate([train, val])
        preds = ema_forecast(all_series, ALPHA)

        # align prediction with validation
        y_pred = preds[split-1:]
        y_true = val

        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)

        trained.append(int(pid))
        metrics[int(pid)] = {
            "model": "EMA",
            "alpha": ALPHA,
            "rmse": float(rmse),
            "mae": float(mae),
            "r2": float(r2),
            "train_samples": len(train),
            "val_samples": len(val)
        }

    print(json.dumps({
        "success": True,
        "trained_models": trained,
        "rows_used": len(df),
        "metrics": metrics
    }))

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e)
    }))
