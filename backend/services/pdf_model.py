import pandas as pd
import pickle
import numpy as np
import logging
from pathlib import Path
from utils.feature_extraction import extract_pdf_features, EXPECTED_PDF_FEATURES

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "models"
PDF_MODEL_PATH = MODEL_DIR / "random_forest_file.pkl"

rf_pdf_model = None

def load_pdf_model():
    global rf_pdf_model
    if rf_pdf_model is None:
        if not PDF_MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {PDF_MODEL_PATH}")
        with open(PDF_MODEL_PATH, "rb") as f:
            rf_pdf_model = pickle.load(f)
        logger.info("Loaded PDF Random Forest model.")
    return rf_pdf_model

def predict_pdf_direct(file_path: str):
    """
    Extracts metadata features from a PDF and predicts using the RF model.
    Returns prediction score, extracted features and discovered URLs.
    """
    data = extract_pdf_features(file_path)
    df = pd.DataFrame([data["features"]], columns=EXPECTED_PDF_FEATURES)
    
    model = load_pdf_model()
    
    X = df[EXPECTED_PDF_FEATURES].values.astype(np.float32)
    proba = float(model.predict_proba(X)[0, 1])
    pred = int(model.predict(X)[0])
    
    found_urls = [u["url"] for u in data["file_details"].get("urls", []) if "url" in u]
    
    return pred, proba, data["features"], found_urls, data["file_details"]
