# ==========================================
# Credit Card Fraud Detection - Model Training
# ==========================================

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score
)
from imblearn.over_sampling import SMOTE

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(_BASE_DIR, "dataset", "creditcard.csv")
MODELS_DIR = os.path.join(_BASE_DIR, "models")


def load_dataset():
    print("Loading dataset from:", DATASET_PATH)
    df = pd.read_csv(DATASET_PATH)
    print("Raw dataset shape:", df.shape)
    df = df.drop_duplicates()
    print("Shape after dropping duplicates:", df.shape)
    return df


def split_data(df):
    """
    Split into Train (68%), Validation (12%), and Test (20%) using random_state=42 and stratify.
    Threshold tuning is performed ONLY on the Validation split.
    Final reported evaluation is performed ONLY on the untouched Test split.
    """
    X = df.drop("Class", axis=1)
    y = df["Class"]

    # 80% train+val, 20% test
    X_train_full, X_test, y_train_full, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # From 80%, take 15% for validation (= 12% of total dataset)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_full, y_train_full, test_size=0.15, random_state=42, stratify=y_train_full
    )

    print(f"\nDataset Splits:")
    print(f"  Training set   : {X_train.shape[0]} rows (Frauds: {int(y_train.sum())}, Genuine: {int((y_train == 0).sum())})")
    print(f"  Validation set : {X_val.shape[0]} rows (Frauds: {int(y_val.sum())}, Genuine: {int((y_val == 0).sum())})")
    print(f"  Testing set    : {X_test.shape[0]} rows (Frauds: {int(y_test.sum())}, Genuine: {int((y_test == 0).sum())})")

    return X_train, X_val, X_test, y_train, y_val, y_test


def select_best_threshold(y_true, y_prob):
    """
    Select optimal decision threshold on the validation set by maximizing F1 score,
    ensuring a balanced trade-off between fraud precision and fraud recall.
    """
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_prob)
    # Avoid division by zero
    f1_scores = np.where(
        (precisions[:-1] + recalls[:-1]) > 0,
        2 * (precisions[:-1] * recalls[:-1]) / (precisions[:-1] + recalls[:-1]),
        0.0
    )
    best_idx = int(np.argmax(f1_scores))
    best_thresh = float(thresholds[best_idx])
    # Bound threshold to reasonable detection bounds
    best_thresh = round(float(np.clip(best_thresh, 0.1, 0.9)), 4)
    print(f"Optimal threshold chosen from validation set: {best_thresh} (Val F1: {f1_scores[best_idx]:.4f})")
    return best_thresh


def evaluate_pipeline(model, scaler, X_test_raw, y_test, threshold=0.5):
    """Evaluate a (model, scaler) pair on raw test data using probability scores."""
    X_test_eval = X_test_raw.copy()
    X_test_eval["Amount"] = scaler.transform(X_test_eval[["Amount"]])

    expected_cols = getattr(model, "feature_names_in_", list(X_test_eval.columns))
    X_test_eval = X_test_eval.reindex(columns=expected_cols, fill_value=0.0)

    y_prob = model.predict_proba(X_test_eval)[:, 1]
    y_pred = (y_prob >= threshold).astype(int)

    roc_auc = float(roc_auc_score(y_test, y_prob))
    pr_auc = float(average_precision_score(y_test, y_prob))
    acc = float(accuracy_score(y_test, y_pred))
    baseline_acc = float((y_test == 0).mean())
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "pr_auc": round(pr_auc, 4),
        "roc_auc": round(roc_auc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "accuracy": round(acc, 4),
        "baseline_accuracy": round(baseline_acc, 4),
        "threshold": round(threshold, 4),
        "confusion_matrix": cm
    }


def main():
    df = load_dataset()
    X_train_raw, X_val_raw, X_test_raw, y_train, y_val, y_test = split_data(df)

    # 1. Evaluate OLD Model (Baseline)
    old_model_path = os.path.join(MODELS_DIR, "fraud_model.old.pkl")
    old_scaler_path = os.path.join(MODELS_DIR, "scaler.old.pkl")
    if not os.path.exists(old_model_path):
        old_model_path = os.path.join(MODELS_DIR, "fraud_model.pkl")
        old_scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")

    print("\n--- Evaluating OLD Model Baseline on Test Split ---")
    old_model = joblib.load(old_model_path)
    old_scaler = joblib.load(old_scaler_path)

    # Validation threshold for old model
    X_val_old = X_val_raw.copy()
    X_val_old["Amount"] = old_scaler.transform(X_val_old[["Amount"]])
    old_val_prob = old_model.predict_proba(X_val_old)[:, 1]
    old_threshold = select_best_threshold(y_val, old_val_prob)

    old_metrics = evaluate_pipeline(old_model, old_scaler, X_test_raw, y_test, threshold=old_threshold)
    print("OLD Model Test Results:")
    print(f"  PR-AUC       : {old_metrics['pr_auc']:.4f}")
    print(f"  ROC-AUC      : {old_metrics['roc_auc']:.4f}")
    print(f"  Precision    : {old_metrics['precision']:.4f}")
    print(f"  Recall       : {old_metrics['recall']:.4f}")
    print(f"  F1 Score     : {old_metrics['f1_score']:.4f}")
    print(f"  Accuracy     : {old_metrics['accuracy']:.4f} (Baseline Always Genuine: {old_metrics['baseline_accuracy']:.4f})")
    print(f"  Confusion Mat: {old_metrics['confusion_matrix']}")

    # 2. Train NEW Model with StandardScaler fitted on Training split only
    print("\n--- Training NEW Model ---")
    new_scaler = StandardScaler()
    X_train = X_train_raw.copy()
    X_val = X_val_raw.copy()

    X_train["Amount"] = new_scaler.fit_transform(X_train[["Amount"]])
    X_val["Amount"] = new_scaler.transform(X_val[["Amount"]])

    print("Applying SMOTE on training split...")
    smote = SMOTE(random_state=42)
    X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)
    print(f"Training distribution after SMOTE: {y_train_smote.value_counts().to_dict()}")

    print("Fitting Random Forest (n_estimators=100, random_state=42)...")
    new_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
    )
    new_model.fit(X_train_smote, y_train_smote)

    # 3. Choose threshold on validation set
    new_val_prob = new_model.predict_proba(X_val)[:, 1]
    new_threshold = select_best_threshold(y_val, new_val_prob)

    # 4. Evaluate NEW Model on untouched Test Split
    print("\n--- Evaluating NEW Model on Test Split ---")
    new_metrics = evaluate_pipeline(new_model, new_scaler, X_test_raw, y_test, threshold=new_threshold)
    print("NEW Model Test Results:")
    print(f"  PR-AUC       : {new_metrics['pr_auc']:.4f}")
    print(f"  ROC-AUC      : {new_metrics['roc_auc']:.4f}")
    print(f"  Precision    : {new_metrics['precision']:.4f}")
    print(f"  Recall       : {new_metrics['recall']:.4f}")
    print(f"  F1 Score     : {new_metrics['f1_score']:.4f}")
    print(f"  Accuracy     : {new_metrics['accuracy']:.4f} (Baseline Always Genuine: {new_metrics['baseline_accuracy']:.4f})")
    print(f"  Confusion Mat: {new_metrics['confusion_matrix']}")

    # Always save candidate models first to .new.pkl
    joblib.dump(new_model, os.path.join(MODELS_DIR, "fraud_model.new.pkl"))
    joblib.dump(new_scaler, os.path.join(MODELS_DIR, "scaler.new.pkl"))

    # 5. Model Selection Decision
    print("\n================ MODEL SELECTION COMPARISON ================")
    print(f"Old Model PR-AUC : {old_metrics['pr_auc']:.4f}")
    print(f"New Model PR-AUC : {new_metrics['pr_auc']:.4f}")

    if new_metrics["pr_auc"] >= old_metrics["pr_auc"]:
        kept_model_name = "new"
        reason = f"New model achieved PR-AUC {new_metrics['pr_auc']:.4f} >= Old model PR-AUC {old_metrics['pr_auc']:.4f}."
        active_metrics = new_metrics
        # Swap new model into production
        joblib.dump(new_model, os.path.join(MODELS_DIR, "fraud_model.pkl"))
        joblib.dump(new_scaler, os.path.join(MODELS_DIR, "scaler.pkl"))
        print(f"Result: NEW model KEPT and deployed to fraud_model.pkl! ({reason})")
    else:
        kept_model_name = "old"
        reason = f"Old model PR-AUC ({old_metrics['pr_auc']:.4f}) exceeded New model PR-AUC ({new_metrics['pr_auc']:.4f}). Preserving verified old model."
        active_metrics = old_metrics
        # Keep old model in production
        joblib.dump(old_model, os.path.join(MODELS_DIR, "fraud_model.pkl"))
        joblib.dump(old_scaler, os.path.join(MODELS_DIR, "scaler.pkl"))
        print(f"Result: OLD model KEPT and preserved in fraud_model.pkl! ({reason})")

    # 6. Save final metrics.json
    metrics_payload = {
        "model_type": "Random Forest + SMOTE",
        "kept_model": kept_model_name,
        "selection_reason": reason,
        "pr_auc": active_metrics["pr_auc"],
        "roc_auc": active_metrics["roc_auc"],
        "precision": active_metrics["precision"],
        "recall": active_metrics["recall"],
        "f1_score": active_metrics["f1_score"],
        "accuracy": active_metrics["accuracy"],
        "baseline_accuracy": active_metrics["baseline_accuracy"],
        "optimal_threshold": active_metrics["threshold"],
        "confusion_matrix": active_metrics["confusion_matrix"],
        "splits": {
            "train_size": int(X_train_raw.shape[0]),
            "val_size": int(X_val_raw.shape[0]),
            "test_size": int(X_test_raw.shape[0]),
            "test_frauds": int(y_test.sum()),
            "test_genuine": int((y_test == 0).sum())
        },
        "comparison": {
            "old_model": old_metrics,
            "new_model": new_metrics
        }
    }

    metrics_json_path = os.path.join(MODELS_DIR, "metrics.json")
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"\nFinal metrics successfully written to: {metrics_json_path}")
    return metrics_payload


if __name__ == "__main__":
    main()
