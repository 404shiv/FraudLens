# ==========================================
# Metrics Routes
# ==========================================

import os
import json
import logging
from flask import Blueprint, jsonify

logger = logging.getLogger(__name__)

metrics_bp = Blueprint("metrics", __name__)

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
METRICS_PATH = os.path.join(_BASE_DIR, "models", "metrics.json")


@metrics_bp.route("/metrics", methods=["GET"])
def get_metrics():
    """
    Return model evaluation metrics, PR-AUC, ROC-AUC, threshold,
    and baseline accuracy from metrics.json.
    """
    try:
        if not os.path.exists(METRICS_PATH):
            return jsonify({
                "error": "Metrics file not found. Please ensure train_model.py has been executed."
            }), 404

        with open(METRICS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        return jsonify(data)

    except Exception as e:
        logger.exception("Failed to load metrics")
        return jsonify({
            "error": str(e)
        }), 500

