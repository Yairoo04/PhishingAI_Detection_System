import pandas as pd
import pickle
import logging
from pathlib import Path
from utils.feature_extraction import extract_url_features, URL_FEATURES

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "models"
URL_MODEL_PATH = MODEL_DIR / "random_forest_URL.pkl"

rf_url_model = None

def load_url_model():
    global rf_url_model
    if rf_url_model is None:
        if not URL_MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {URL_MODEL_PATH}")
        with open(URL_MODEL_PATH, "rb") as f:
            rf_url_model = pickle.load(f)
        logger.info("Loaded URL Random Forest model.")
    return rf_url_model

def predict_url_direct(url: str):
    """
    Predicts whether a URL is phishing or legitimate using the RF model.
    """
    feat_dict = extract_url_features(url)
    df = pd.DataFrame([feat_dict], columns=URL_FEATURES)
    
    model = load_url_model()
    
    proba = float(model.predict_proba(df)[0, 1])
    pred = int(model.predict(df)[0])
    
    return pred, proba, feat_dict
