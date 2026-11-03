
# MongoDB Configuration

import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")

DATABASE_NAME = os.environ.get("MONGO_DB_NAME", "credit_card_fraud_db")

COLLECTION_NAME = os.environ.get("MONGO_COLLECTION_NAME", "predictions")