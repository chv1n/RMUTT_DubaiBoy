import sys
import json
import os
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
import pickle
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models_xgb")
TIME_STEP = 14

os.makedirs(MODEL_DIR, exist_ok=True)

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

    def create_dataset(df_p):
        qty = df_p["QuantityProduced"].values
        X, y = [], []
        for i in range(len(qty) - TIME_STEP):
            X.append(qty[i:i+TIME_STEP])
            y.append(qty[i+TIME_STEP])
        return np.array(X), np.array(y)

    trained = []
    metrics = {}

    for pid in product_ids:
        df_p = df[df["ProductID"] == pid]

        if len(df_p) <= TIME_STEP + 5:
            continue

        X, y = create_dataset(df_p)

        # ✅ Train / Validation split (80/20)
        split_idx = int(len(X) * 0.8)
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]

        model = XGBRegressor(
            objective="reg:squarederror",
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05
        )
        model.fit(X_train, y_train)

        # ✅ Predict
        y_pred = model.predict(X_val)

        # ✅ Metrics
        rmse = np.sqrt(mean_squared_error(y_val, y_pred))
        mae = mean_absolute_error(y_val, y_pred)
        r2 = r2_score(y_val, y_pred)

        with open(os.path.join(MODEL_DIR, f"model_product_{pid}.pkl"), "wb") as f:
            pickle.dump(model, f)

        trained.append(int(pid))

    print(json.dumps({
        "success": True,
        "trained_models": trained,
        "rows_used": len(df),
    }))

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e)
    }))
