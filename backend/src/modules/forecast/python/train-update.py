import pandas as pd
import numpy as np
from xgboost import XGBRegressor
import pickle
import os

DATA_PATH = "product_history.csv"
MODEL_DIR = "models_xgb"
TIME_STEP = 14

os.makedirs(MODEL_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)
df["Date"] = pd.to_datetime(df["Date"])
df = df.sort_values("Date")

product_ids = sorted(df["ProductID"].unique())

def create_dataset(df_p):
    qty = df_p["QuantityProduced"].values
    X, y = [], []

    for i in range(len(qty) - TIME_STEP):
        X.append(qty[i:i+TIME_STEP])
        y.append(qty[i+TIME_STEP])

    return np.array(X), np.array(y)

# -----------------------
# TRAIN PER PRODUCT
# -----------------------
for pid in product_ids:
    df_p = df[df["ProductID"] == pid]
    X, y = create_dataset(df_p)

    model = XGBRegressor(
        objective="reg:squarederror",
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05
    )
    model.fit(X, y)

    with open(f"{MODEL_DIR}/model_product_{pid}.pkl", "wb") as f:
        pickle.dump(model, f)

    print(f"Saved model → model_product_{pid}.pkl")

print("🎉 All XGBoost models trained!")