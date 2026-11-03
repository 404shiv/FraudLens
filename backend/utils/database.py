# ==========================================
# MongoDB Connection & Utilities
# ==========================================

from pymongo import MongoClient, DESCENDING
from config import (
    MONGO_URI,
    DATABASE_NAME,
    COLLECTION_NAME
)

# Create MongoDB Client with fast 3-second timeout for server selection
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)

# Select Database
database = client[DATABASE_NAME]

# Select Collection
prediction_collection = database[COLLECTION_NAME]


# ==========================================
# Save Prediction
# ==========================================

def save_prediction(data):
    prediction_collection.insert_one(data)


# ==========================================
# Get Prediction History
# ==========================================

def get_prediction_history():
    """
    Retrieve prediction history sorted by created_at descending (newest first).
    Legacy records missing created_at are placed at the end and will never crash.
    """
    try:
        cursor = prediction_collection.find({}, {"_id": 0}).sort("created_at", DESCENDING)
        history = list(cursor)
    except Exception:
        # If server selection or find fails, raise to be handled/logged by caller
        raise

    def _sort_key(doc):
        val = doc.get("created_at")
        if val is not None and isinstance(val, str) and val.strip():
            return (1, str(val))
        return (0, "")

    history.sort(key=_sort_key, reverse=True)
    return history


# ==========================================
# Delete All Prediction History
# ==========================================

def clear_prediction_history():
    prediction_collection.delete_many({})
