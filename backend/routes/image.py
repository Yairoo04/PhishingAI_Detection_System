from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import cv2
import logging

from utils.common import temp_file
from utils.qr_decoder import decode_qr_from_image
from services.image_model import predict_image_direct
from services.url_model import predict_url_direct

bp = Blueprint("image", __name__)
logger = logging.getLogger(__name__)

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

@bp.route("/predict", methods=["POST"])
def predict_image():
    try:
        if "file" not in request.files or not request.files["file"].filename:
            return jsonify({"error": "No file selected"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)

        if not allowed_file(filename):
            return jsonify({"error": "Invalid file type. Only .png, .jpg, .jpeg accepted"}), 400

        with temp_file(file, filename) as file_path:
            image = cv2.imread(file_path)
            if image is None:
                return jsonify({"error": "Invalid or corrupted image file"}), 400

            # QR Code check
            qr_urls = decode_qr_from_image(image)
            if qr_urls:
                url = qr_urls[0]
                url_pred, url_proba, features = predict_url_direct(url)
                result_label = "phishing" if url_proba >= 0.50 else "benign"
                
                return jsonify({
                    "type": "image",
                    "prediction": result_label,
                    "score": round(url_proba * 100, 2),
                    "extra": {
                        "qr_url": url,
                        "url_score": round(url_proba * 100, 2),
                        "features": features
                    }
                }), 200
            
            # Simple Image Check
            img_pred, img_proba = predict_image_direct(image)
            result_label = "phishing" if img_proba >= 0.50 else "benign"

            return jsonify({
                "type": "image",
                "prediction": result_label,
                "score": round(img_proba * 100, 2),
                "extra": {
                    "image_score": round(img_proba * 100, 2)
                }
            }), 200

    except Exception as e:
        logger.exception("Unexpected error processing image: %s", str(e))
        return jsonify({"error": f"Unexpected error processing image: {str(e)}"}), 500