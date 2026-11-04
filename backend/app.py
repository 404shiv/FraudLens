# ==========================================
# FraudLens - Credit Card Fraud Detection API
# ==========================================
from dotenv import load_dotenv
load_dotenv()

import os
import sys

# Ensure backend directory is in sys.path for direct script or root package execution
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from flask import Flask
from flask_cors import CORS

from routes.prediction import prediction_bp
from routes.samples import samples_bp
from routes.metrics import metrics_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(prediction_bp)
app.register_blueprint(samples_bp)
app.register_blueprint(metrics_bp)


@app.route("/")
def home():
    return {
        "status": "success",
        "message": "FraudLens API is Running!"
    }


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes")

    app.run(
        host=host,
        port=port,
        debug=debug
    )
