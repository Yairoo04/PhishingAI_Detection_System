from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import cv2
import numpy as np
import tensorflow as tf
from pyzbar.pyzbar import decode
from utils.model_registry import ModelRegistry
from utils.common import compute_ensemble_score, preprocess_image_for_cnn, temp_file
from Phishing_URL_Models.feature_extraction import extract_features
import logging
import pandas as pd
import os

bp = Blueprint("image", __name__)
logger = logging.getLogger(__name__)
model_registry = ModelRegistry(os.getenv("MODEL_DIR", "models"))
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg"}
URL_FEATURES = [
    'url_length', 'num_special_chars', 'is_https', 'num_digits', 'domain_length',
    'num_subdomains', 'num_dashes', 'path_length', 'query_length', 'has_ip',
    'has_at_symbol', 'redirect_count', 'num_letters_in_domain', 'num_numbers_in_domain',
    'letter_to_number_ratio', 'has_phishing_keywords', 'num_query_params',
    'query_string_complexity', 'unicode_in_url'
]

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

@bp.route("/predict", methods=["POST"])
def predict_image():
    threshold = 0.5
    try:
        if "file" not in request.files or not request.files["file"].filename:
            return jsonify({"error": "Không có tệp được chọn"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)
        if not allowed_file(filename):
            return jsonify({"error": "Loại tệp không hợp lệ"}), 400

        with temp_file(file, filename) as file_path:
            image = cv2.imread(file_path)
            if image is None:
                logger.error(f"Không thể tải hình ảnh: {file_path}")
                return jsonify({"error": "Tệp hình ảnh không hợp lệ hoặc bị hỏng"}), 400

            qr_codes = decode(image)
            if qr_codes:
                qr_results = []
                for qr in qr_codes:
                    url = qr.data.decode("utf-8")
                    logger.info(f"Phát hiện mã QR: {url}")
                    rf_features = pd.DataFrame([extract_features(url)], columns=URL_FEATURES)
                    rf_model = model_registry.load_model("random_forest_URL", "pickle")
                    rf_pred = rf_model.predict_proba(rf_features)[:, 1][0]
                    ensemble = compute_ensemble_score(rf_pred)
                    result = "Phishing" if ensemble > threshold else "Legitimate"
                    features_dict = rf_features.to_dict(orient='records')[0]
                    qr_results.append({
                        "qr_url": url,
                        "rf_confidence": round(float(rf_pred), 4),
                        "result": result,
                        "features": features_dict
                    })
                return jsonify({"qr_results": qr_results}), 200

            cnn_input = preprocess_image_for_cnn(image)
            cnn_model = model_registry.load_model("cnn_phishing_image", "keras")
            cnn_pred = float(cnn_model.predict(cnn_input, verbose=0)[0][0])
            result = "Phishing" if cnn_pred > threshold else "Legitimate"
            logger.info(f"Dự đoán hình ảnh cho {filename}: cnn_confidence={cnn_pred:.4f}, result={result}")
            return jsonify({
                "cnn_confidence": round(float(cnn_pred), 4),
                "result": result,
                "filename": filename
            }), 200
    except Exception as e:
        logger.error(f"Lỗi dự đoán CNN cho {filename}: {e}")
        return jsonify({"error": f"Dự đoán CNN thất bại: {str(e)}"}), 500