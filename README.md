# FraudLens

**Credit card fraud scoring with honest metrics.**

FraudLens is a full-stack machine learning demo. A **Random Forest** model (trained with **SMOTE** to handle class imbalance) scores credit card transactions through a **Flask** REST API, stores every result in **MongoDB**, and shows everything on a **React + Vite** dashboard.

> **Demo and educational use only.**
> The model is trained on the public Kaggle / ULB credit card fraud dataset: real transactions made by European cardholders over **two days in September 2013**, with the original features hidden by PCA (V1-V28). This project demonstrates an imbalanced-classification pipeline end to end. It is **not** suitable for real banking or payment systems (see [Limitations](#limitations)).

---

## Results

Evaluated once on an untouched test set of **56,746 transactions (95 frauds)**, using a decision threshold of **0.50**.

| Metric | Value |
|:---|:---|
| PR-AUC (headline metric) | **0.817** |
| ROC-AUC | 0.955 |
| Fraud precision | 89.0% |
| Fraud recall | 76.8% (73 of 95 frauds caught) |
| Fraud F1 | 0.825 |
| False alarms | 9 out of 56,651 genuine transactions |
| Missed frauds | 22 |

The model is roughly on par with the first version of this project (PR-AUC about 0.81). The difference with this version is the **pipeline**: no data leakage, a separate validation set, and metrics that are reported honestly.

### Why PR-AUC and not accuracy?

99.83% of the transactions are genuine. A model that answers "genuine" every single time scores **99.83% accuracy while catching zero frauds**. Accuracy is therefore meaningless here. PR-AUC only looks at the fraud class, balancing how many frauds are caught (recall) against how many alerts are false (precision). The dashboard shows PR-AUC for this reason and deliberately does not show accuracy.

---

## How it works

1. **Data:** 283,726 transactions after removing duplicates (473 frauds, about 0.17%). Features are `Time`, `V1`-`V28` (anonymized PCA components) and `Amount`.
2. **Split:** stratified 68% train / 12% validation / 20% test, `random_state=42`.
3. **Preprocessing:** `StandardScaler` is fitted on the training split only, so nothing from validation or test leaks in.
4. **Balancing:** SMOTE is applied to the training split only (192,933 rows become 385,224).
5. **Model:** Random Forest classifier. Its fraud probability is the share of trees that vote "fraud".
6. **Decision:** a transaction is flagged as fraud when the probability is at or above the threshold (**0.50**).

A feature-importance check on the baseline model showed that the decision comes almost entirely from the anonymized V-features (mainly V14, V10, V12, V4 and V17). `Amount` and `Time` contribute very little.

### Threshold policy

The threshold is set to **0.50** on purpose. Tuning it on the validation set (only 57 frauds) gave 0.67, but that choice turned out to be unstable: at 0.72 the validation recall was 80.7% while the test recall was only 69.5%. Since a missed fraud usually costs more than a false alarm, the project uses the neutral 0.50 default.

| Threshold | Frauds caught (of 95) | Missed | False alarms |
|:---|:---:|:---:|:---:|
| **0.50 (used)** | **73** | 22 | 9 |
| 0.67 | 68 | 27 | 5 |
| 0.72 | 66 | 29 | 4 |

---

## Limitations

Please read these before trusting any number in this project.

- **You cannot score a "real" transaction with it.** The model needs 30 inputs, and V1-V28 only exist inside this dataset. They cannot be created from an ordinary transaction (amount, merchant, location).
- **Amount-only input is meaningless.** If only `Amount` is entered, the V-features default to 0, which looks like an average transaction, so the result is almost always "Genuine" (even for huge amounts). Use the dataset samples instead.
- **About 1 in 4 frauds is missed** (recall 76.8%). Some of the "Fraud" samples in the app will come out as Genuine.
- **Small test set.** There are only 95 frauds in the test split, so small differences between models are within noise.
- **Old, narrow data.** Two days of European card data from 2013. `Time` is simply the number of seconds since the first transaction in that file.
- **Nothing is blocked.** The app only scores and flags transactions. It does not stop or quarantine anything.

---

## Features

- **Live scoring:** load a real labeled transaction from the dataset (or fill the form) and get a verdict with fraud and genuine probabilities.
- **Ground-truth comparison:** dataset samples carry the original Kaggle label, so you can see whether the model was right.
- **Desync warning:** editing `Amount` or `Time` after loading a sample shows a warning, because the V-features then belong to a different transaction.
- **Metrics endpoint:** `/metrics` exposes the real evaluation results, and the dashboard reads them from there.
- **Audit ledger:** every prediction is saved to MongoDB with a timestamp and source; the ledger is searchable, filterable, exportable to CSV, and can be cleared (with a confirmation prompt).
- **Resilient storage:** if MongoDB is offline, predictions still work and the response reports `saved: false`.
- **Telemetry chart:** doughnut chart of flagged versus genuine transactions.

---

## Tech stack

| Layer | Technology |
|:---|:---|
| ML | scikit-learn (Random Forest), imbalanced-learn (SMOTE), pandas, NumPy |
| Backend | Python, Flask, Flask-CORS, PyMongo |
| Database | MongoDB |
| Frontend | React, Vite, Tailwind CSS, Chart.js, Axios |

---

## Project structure

```
FraudLens/
├── backend/
│   ├── app.py                   # Flask entry point (127.0.0.1:5000, debug off)
│   ├── config.py                # MongoDB settings (environment variables)
│   ├── predict.py               # Loads model + scaler, applies threshold from metrics.json
│   ├── train_model.py           # Training, validation and evaluation pipeline
│   ├── routes/
│   │   ├── prediction.py        # POST /predict, GET/DELETE /history
│   │   ├── samples.py           # GET /samples, GET /samples/random
│   │   └── metrics.py           # GET /metrics
│   ├── utils/database.py        # MongoDB connection and helpers
│   ├── models/
│   │   ├── fraud_model.pkl      # Deployed model
│   │   ├── scaler.pkl           # Matching scaler (always keep as a pair)
│   │   ├── fraud_model.old.pkl  # Backup of the first model
│   │   ├── scaler.old.pkl       # Backup of the first scaler
│   │   └── metrics.json         # Test-set metrics and threshold policy
│   ├── dataset/creditcard.csv   # Kaggle dataset (download separately)
│   └── notebooks/EDA.ipynb      # Exploratory analysis
├── frontend/
│   ├── src/
│   │   ├── App.jsx, main.jsx
│   │   ├── pages/Home.jsx
│   │   ├── components/          # Navbar, StatsCards, PredictionForm, PredictionResult,
│   │   │                        # PieChart, HistoryTable, Footer
│   │   └── services/api.js      # Axios client (http://127.0.0.1:5000)
│   ├── package.json
│   └── vite.config.js
├── requirements.txt             # Runtime dependencies
├── requirements-notebook.txt    # Extra packages for the notebook only
└── README.md
```

---

## Getting started

### Prerequisites

- **Python 3.11 or newer** (scikit-learn 1.8.0 requires it)
- **Node.js 18+** and npm
- **MongoDB** running locally on the default port. Predictions work without it, but the ledger, history and chart need it.

### 1. Backend

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

> `scikit-learn` is pinned to **1.8.0** on purpose. The saved `.pkl` files were created with that version and may fail to load with another one.

### 2. Dataset

Download `creditcard.csv` from [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) and place it in `backend/dataset/`. The sample cards in the app read from this file.

### 3. Run the API

```bash
cd backend
python app.py
```

The API runs at `http://127.0.0.1:5000`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend expects the API at `http://127.0.0.1:5000` (set in `src/services/api.js`).

### Optional: notebook

```bash
pip install -r requirements-notebook.txt
```

Then open `backend/notebooks/EDA.ipynb` (run it from inside `backend/notebooks/`).

### Optional: retrain the model

```bash
cd backend
python train_model.py
```

This takes several minutes. **Back up `backend/models/` first.** The script evaluates the new model against the deployed one and may replace it. The model and scaler are a matched pair and must never be mixed between versions.

---

## API

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Health check |
| `POST` | `/predict` | Body: `Amount` (required, numeric), `Time`, `V1`-`V28`, optional `source` and `true_label`. Returns `prediction`, `fraud_probability`, `genuine_probability`, `saved`. Invalid input returns `400`; unknown keys are ignored. |
| `GET` | `/metrics` | Model evaluation results from `metrics.json` |
| `GET` | `/history` | Saved predictions, newest first |
| `DELETE` | `/history` | Deletes all saved predictions |
| `GET` | `/samples` | A curated set of labeled genuine and fraud rows from the dataset |
| `GET` | `/samples/random?type=fraud\|genuine` | One random labeled row |

Example:

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"Amount": 45.0, "Time": 1.0}'
```

> This example sends only `Amount` and `Time`, so every V-feature is 0 and the result will be "Genuine" (see [Limitations](#limitations)).

---

## Configuration

All settings are optional environment variables.

| Variable | Default | Purpose |
|:---|:---|:---|
| `HOST` | `127.0.0.1` | API bind address |
| `PORT` | `5000` | API port |
| `DEBUG` | off | Flask debug mode. Do not enable on a network-reachable host. |
| `MONGO_URI` | `mongodb://localhost:27017/` | MongoDB connection string |
| `MONGO_DB_NAME` | `credit_card_fraud_db` | Database name |
| `MONGO_COLLECTION_NAME` | `predictions` | Collection name |

---

## Acknowledgements

Dataset: *Credit Card Fraud Detection*, ULB Machine Learning Group (Universite Libre de Bruxelles) and Worldline, published on [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud). Please follow the citation requirements listed on the dataset page if you reuse it.
