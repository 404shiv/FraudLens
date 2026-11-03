# ==========================================
# Prediction Routes
# ==========================================

import logging
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

from predict import predict_transaction
from utils.database import (
    save_prediction,
    get_prediction_history,
    clear_prediction_history
)

logger = logging.getLogger(__name__)

prediction_bp = Blueprint("prediction", __name__)

FEATURE_KEYS = {"Time"} | {f"V{i}" for i in range(1, 29)} | {"Amount"}
VALID_SOURCES = {"manual", "dataset_sample", "preset"}


# ==========================================
# Predict Transaction
# ==========================================

@prediction_bp.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({
                "error": "Invalid or missing JSON payload"
            }), 400

        if "Amount" not in data or data["Amount"] is None or isinstance(data["Amount"], bool):
            return jsonify({
                "error": "Missing or invalid numeric 'Amount'"
            }), 400

        try:
            amount_val = float(data["Amount"])
        except (ValueError, TypeError):
            return jsonify({
                "error": "Amount must be a numeric value"
            }), 400

        # Filter features: accept only Time, V1-V28, Amount and ignore anything else
        clean_transaction = {}
        for key in FEATURE_KEYS:
            if key in data and data[key] is not None and not isinstance(data[key], bool):
                try:
                    clean_transaction[key] = float(data[key])
                except (ValueError, TypeError):
                    clean_transaction[key] = 0.0
            else:
                clean_transaction[key] = 0.0

        clean_transaction["Amount"] = amount_val

        # Metadata extraction
        source = data.get("source")
        if source not in VALID_SOURCES:
            source = "manual"

        # Check for true_label / datasetLabel
        true_label = None
        for label_key in ("true_label", "datasetLabel"):
            if label_key in data and data[label_key] is not None and not isinstance(data[label_key], bool):
                try:
                    true_label = int(data[label_key])
                    break
                except (ValueError, TypeError):
                    pass

        # Predict
        result = predict_transaction(clean_transaction)

        # Merge clean transaction data with prediction result and metadata for DB
        prediction_data = {
            **clean_transaction,
            **result,
            "source": source,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        if true_label is not None:
            prediction_data["true_label"] = true_label

        # Save to MongoDB in an isolated try/except block
        saved = False
        try:
            save_prediction(prediction_data)
            saved = True
        except Exception as db_err:
            logger.warning("Failed to persist prediction to MongoDB: %s", db_err)
            saved = False

        response_data = {
            **result,
            "saved": saved
        }

        return jsonify(response_data)

    except Exception as e:
        logger.exception("Prediction request failed")
        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# Get Prediction History
# ==========================================

@prediction_bp.route("/history", methods=["GET"])
def history():
    try:
        data = get_prediction_history()
        return jsonify(data)
    except Exception as e:
        logger.exception("Failed to fetch history")
        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# Clear Prediction History
# ==========================================

@prediction_bp.route("/history", methods=["DELETE"])
def clear_history():
    try:
        clear_prediction_history()
        return jsonify({
            "message": "History Cleared Successfully"
        })
    except Exception as e:
        logger.exception("Failed to clear history")
        return jsonify({
            "error": str(e)
        }), 500
