# ==========================================
# Prediction Module
# ==========================================

import os
import json
import warnings
import joblib
import pandas as pd

# Suppress sklearn unpickle version warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Resolve paths relative to this file, not the working directory
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load Trained Model and Scaler
model = joblib.load(os.path.join(_BASE_DIR, "models", "fraud_model.pkl"))
scaler = joblib.load(os.path.join(_BASE_DIR, "models", "scaler.pkl"))

print("Model Loaded Successfully!")
print("Scaler Loaded Successfully!")


def get_decision_threshold():
    """
    Retrieve calibrated decision threshold from metrics.json.
    Falls back to 0.5 if metrics.json is not present or invalid.
    """
    metrics_path = os.path.join(_BASE_DIR, "models", "metrics.json")
    try:
        if os.path.exists(metrics_path):
            with open(metrics_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return float(data.get("optimal_threshold", 0.5))
    except Exception:
        pass
    return 0.5


def predict_transaction(transaction):
    """
    Predict whether a transaction is Fraud (1) or Genuine (0) using
    the calibrated decision threshold from metrics.json.
    """
    # Convert dictionary to DataFrame
    df = pd.DataFrame([transaction])

    # Reindex columns to match exact trained model feature schema and ordering
    expected_columns = getattr(
        model,
        "feature_names_in_",
        ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']
    )
    df = df.reindex(columns=expected_columns, fill_value=0.0)

    # Scale Amount
    df["Amount"] = scaler.transform(df[["Amount"]])

    # Probability
    probability = model.predict_proba(df)[0]
    fraud_prob = float(probability[1])
    genuine_prob = float(probability[0])

    # Decision based on calibrated validation threshold
    threshold = get_decision_threshold()
    prediction = 1 if fraud_prob >= threshold else 0

    return {
        "prediction": int(prediction),
        "fraud_probability": fraud_prob,
        "genuine_probability": genuine_prob
    }
