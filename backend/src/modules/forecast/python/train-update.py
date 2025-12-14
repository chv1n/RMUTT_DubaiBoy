import sys
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# -------------------------------
# CONFIG
# -------------------------------
LAGS = [1, 7, 14]
MIN_VAL = 10

# -------------------------------
# CREATE LAG FEATURES
# -------------------------------
def make_lag_df(series, lags):
    data = {}
    for lag in lags:
        data[f"lag_{lag}"] = series.shift(lag)
    return pd.DataFrame(data)

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

    trained = []
    metrics = {}

    for pid in product_ids:
        df_p = df[df["ProductID"] == pid].copy()
        series = df_p["QuantityProduced"].reset_index(drop=True)

        if len(series) < max(LAGS) + MIN_VAL:
            continue

        # -------------------------------
        # Build supervised dataset
        # -------------------------------
        X = make_lag_df(series, LAGS)
        y = series
        data_xy = pd.concat([X, y], axis=1).dropna()

        X = data_xy.drop(columns=["QuantityProduced"])
        y = data_xy["QuantityProduced"]

        split = int(len(y) * 0.8)
        X_train, X_val = X.iloc[:split], X.iloc[split:]
        y_train, y_val = y.iloc[:split], y.iloc[split:]

        if len(y_val) < MIN_VAL:
            continue

        # -------------------------------
        # Train Linear Model
        # -------------------------------
        model = LinearRegression()
        model.fit(X_train, y_train)

        y_pred = model.predict(X_val)

        rmse = np.sqrt(mean_squared_error(y_val, y_pred))
        mae = mean_absolute_error(y_val, y_pred)
        r2 = r2_score(y_val, y_pred)

        # -------------------------------
        # Mean baseline (gate)
        # -------------------------------
        mean_pred = np.full(len(y_val), np.mean(y_train))
        mean_rmse = np.sqrt(mean_squared_error(y_val, mean_pred))

        if rmse <= mean_rmse:
            status = "OK"
            trained.append(int(pid))
        else:
            status = "REJECT"

        metrics[int(pid)] = {
            "model": "LINEAR_LAG",
            "lags": LAGS,
            "rmse": float(rmse),
            "mae": float(mae),
            "r2": float(r2),
            "mean_rmse": float(mean_rmse),
            "train_samples": len(y_train),
            "val_samples": len(y_val),
            "status": status
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
