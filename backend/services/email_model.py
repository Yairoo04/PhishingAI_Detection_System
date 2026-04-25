import pandas as pd
import pickle
import logging
import numpy as np
from pathlib import Path
from utils.feature_extraction import extract_email_features, EMAIL_FEATURES
from utils.url_extractor import extract_urls_from_text

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "models"
EMAIL_MODEL_PATH = MODEL_DIR / "random_forest_email.pkl"

rf_email_model = None

def load_email_model():
    global rf_email_model
    if rf_email_model is None:
        if not EMAIL_MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {EMAIL_MODEL_PATH}")
        with open(EMAIL_MODEL_PATH, "rb") as f:
            rf_email_model = pickle.load(f)
        logger.info("Loaded Email Random Forest model.")
    return rf_email_model

def np_to_python(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, (list, tuple)):
        return [np_to_python(item) for item in obj]
    if isinstance(obj, dict):
        return {k: np_to_python(v) for k, v in obj.items()}
    return obj

def predict_email_direct(file_path: str):
    """
    Extracts features from an .eml file and predicts using the RF model.
    Also extracts all internal URLs.
    """
    df, headers_details, received_details, x_headers_details, security_details, url_details, analysis = \
        extract_email_features(file_path)
    
    model = load_email_model()
    
    X = df[EMAIL_FEATURES].values.astype(np.float32)
    proba = float(model.predict_proba(X)[0, 1])
    pred = int(model.predict(X)[0])
    
    features_dict = np_to_python(df.to_dict(orient='records')[0])
    
    # The URL details are already parsed from headers / body, 
    # extract_email_features returns them.
    found_urls = [u["url"] for u in url_details if "url" in u]
    
    details = {
        "headers": np_to_python(headers_details),
        "received_lines": np_to_python(received_details),
        "x_headers": np_to_python(x_headers_details),
        "security": np_to_python(security_details),
        "analysis": np_to_python(analysis)
    }
    
    return pred, proba, features_dict, found_urls, details
