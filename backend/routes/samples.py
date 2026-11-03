# ==========================================
# Sample Data Routes
# ==========================================

import os
import pandas as pd
from flask import Blueprint, jsonify, request

samples_bp = Blueprint("samples", __name__)

# Resolve dataset path relative to the backend directory
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(_BASE_DIR, "dataset", "creditcard.csv")

# Feature columns (everything except Class)
FEATURE_COLS = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']


_cached_df = None
_cached_samples = None

# Fallback samples if creditcard.csv is not yet present on disk
FALLBACK_SAMPLES = [
    {
        "label": 0,
        "features": {
            "Time": 0.0, "Amount": 149.62,
            "V1": -1.359807, "V2": -0.072781, "V3": 2.536347, "V4": 1.378155,
            "V5": -0.338321, "V6": 0.462388, "V7": 0.239599, "V8": 0.098698,
            "V9": 0.363787, "V10": 0.090794, "V11": -0.551600, "V12": -0.617801,
            "V13": -0.991390, "V14": -0.311169, "V15": 1.468177, "V16": -0.470401,
            "V17": 0.207971, "V18": 0.025791, "V19": 0.403993, "V20": 0.251412,
            "V21": -0.018307, "V22": 0.277838, "V23": -0.110474, "V24": 0.066928,
            "V25": 0.128539, "V26": -0.189115, "V27": 0.133558, "V28": -0.021053
        }
    },
    {
        "label": 0,
        "features": {
            "Time": 0.0, "Amount": 2.69,
            "V1": 1.191857, "V2": 0.266151, "V3": 0.166480, "V4": 0.448154,
            "V5": 0.060018, "V6": -0.082361, "V7": -0.078803, "V8": 0.085102,
            "V9": -0.255425, "V10": -0.166974, "V11": 1.612727, "V12": 1.065235,
            "V13": 0.489095, "V14": -0.143772, "V15": 0.635558, "V16": 0.463917,
            "V17": -0.114805, "V18": -0.183361, "V19": -0.145783, "V20": -0.069083,
            "V21": -0.225775, "V22": -0.638672, "V23": 0.101288, "V24": -0.339846,
            "V25": 0.167170, "V26": 0.125895, "V27": -0.008983, "V28": 0.014724
        }
    },
    {
        "label": 0,
        "features": {
            "Time": 1.0, "Amount": 378.66,
            "V1": -1.358354, "V2": -1.340163, "V3": 1.773209, "V4": 0.379780,
            "V5": -0.503198, "V6": 1.800499, "V7": 0.791461, "V8": 0.247676,
            "V9": -1.514654, "V10": 0.207643, "V11": 0.624501, "V12": 0.066084,
            "V13": 0.717293, "V14": -0.165946, "V15": 2.345865, "V16": -2.890083,
            "V17": 1.109969, "V18": -0.121359, "V19": -2.261857, "V20": 0.524980,
            "V21": 0.247998, "V22": 0.771679, "V23": 0.909412, "V24": -0.689281,
            "V25": -0.327642, "V26": -0.139097, "V27": -0.055353, "V28": -0.059752
        }
    },
    {
        "label": 1,
        "features": {
            "Time": 406.0, "Amount": 0.0,
            "V1": -2.312227, "V2": 1.951992, "V3": -1.609851, "V4": 3.997906,
            "V5": -0.522188, "V6": -1.426545, "V7": -2.537387, "V8": 1.391657,
            "V9": -2.770089, "V10": -2.772272, "V11": 3.202033, "V12": -2.899907,
            "V13": -0.595222, "V14": -4.289254, "V15": 0.389724, "V16": -1.140747,
            "V17": -2.830056, "V18": -0.016822, "V19": 0.416956, "V20": 0.126911,
            "V21": 0.517232, "V22": -0.035049, "V23": -0.465211, "V24": 0.320198,
            "V25": 0.044519, "V26": 0.177840, "V27": 0.261145, "V28": -0.143276
        }
    },
    {
        "label": 1,
        "features": {
            "Time": 472.0, "Amount": 529.0,
            "V1": -3.043541, "V2": -3.157307, "V3": 1.088463, "V4": 2.288644,
            "V5": 1.359805, "V6": -1.064823, "V7": 0.325574, "V8": -0.067794,
            "V9": -0.270953, "V10": -0.838587, "V11": -0.414575, "V12": -0.503141,
            "V13": 0.676502, "V14": -1.692029, "V15": 2.000635, "V16": 0.666780,
            "V17": 0.599717, "V18": 1.725321, "V19": 0.283345, "V20": 2.102339,
            "V21": 0.661696, "V22": 0.435477, "V23": 1.375966, "V24": -0.293803,
            "V25": 0.279798, "V26": -0.145362, "V27": -0.252773, "V28": 0.035764
        }
    },
    {
        "label": 1,
        "features": {
            "Time": 4462.0, "Amount": 239.93,
            "V1": -2.303350, "V2": 1.759247, "V3": -0.359745, "V4": 2.330243,
            "V5": -0.821628, "V6": -0.075788, "V7": 0.562320, "V8": -0.399147,
            "V9": -0.238253, "V10": -1.525412, "V11": 2.032912, "V12": -6.560124,
            "V13": 0.022937, "V14": -1.470102, "V15": -0.698826, "V16": -2.282194,
            "V17": -4.781831, "V18": -2.615665, "V19": -1.334441, "V20": -0.430022,
            "V21": -0.294166, "V22": -0.932391, "V23": 0.172726, "V24": -0.087330,
            "V25": -0.156114, "V26": -0.542628, "V27": 0.039566, "V28": -0.153029
        }
    }
]


def _get_dataframe():
    """Load dataframe into memory once for high performance."""
    global _cached_df
    if _cached_df is None:
        if os.path.exists(DATASET_PATH):
            _cached_df = pd.read_csv(DATASET_PATH)
        else:
            _cached_df = None
    return _cached_df


def _load_sample_rows():
    """
    Load a small curated set of labeled samples from the dataset.
    Returns 3 verified fraud and 3 verified genuine rows with
    all feature values and the Class label.
    """
    df = _get_dataframe()
    if df is None:
        return FALLBACK_SAMPLES

    fraud = df[df['Class'] == 1].head(3)
    genuine = df[df['Class'] == 0].head(3)

    samples = []

    for _, row in genuine.iterrows():
        samples.append({
            "label": int(row['Class']),
            "features": {col: float(row[col]) for col in FEATURE_COLS}
        })

    for _, row in fraud.iterrows():
        samples.append({
            "label": int(row['Class']),
            "features": {col: float(row[col]) for col in FEATURE_COLS}
        })

    return samples


@samples_bp.route("/samples", methods=["GET"])
def get_samples():
    """Return a small set of labeled sample transactions from the dataset."""
    global _cached_samples

    try:
        if _cached_samples is None:
            _cached_samples = _load_sample_rows()

        return jsonify(_cached_samples)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@samples_bp.route("/samples/random", methods=["GET"])
def get_random_sample():
    """
    Return a single random labeled sample from the dataset.
    Optional query param: type=fraud|genuine to filter by class.
    Fast: uses cached dataframe in memory.
    """
    try:
        df = _get_dataframe()

        sample_type = request.args.get("type", "").lower()

        if df is None:
            # Pick from fallback samples
            matching = [
                s for s in FALLBACK_SAMPLES
                if (sample_type == "fraud" and s["label"] == 1) or
                   (sample_type == "genuine" and s["label"] == 0) or
                   (not sample_type)
            ]
            import random
            choice = random.choice(matching if matching else FALLBACK_SAMPLES)
            return jsonify(choice)

        if sample_type == "fraud":
            subset = df[df['Class'] == 1]
        elif sample_type == "genuine":
            subset = df[df['Class'] == 0]
        else:
            subset = df

        if subset.empty:
            return jsonify({"error": "No matching samples found"}), 404

        row = subset.sample(n=1).iloc[0]

        return jsonify({
            "label": int(row['Class']),
            "features": {col: float(row[col]) for col in FEATURE_COLS}
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
