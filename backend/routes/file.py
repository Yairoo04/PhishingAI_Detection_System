from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import logging

from utils.common import temp_file
from utils.file_third_party import check_scanii_from_file
from services.pdf_model import predict_pdf_direct

bp = Blueprint("file", __name__)
logger = logging.getLogger(__name__)

ALLOWED_PDF_EXTENSION = {"pdf"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_PDF_EXTENSION

@bp.route("/predict", methods=["POST"])
def predict_file():
    threshold = 0.5

    try:
        if "file" not in request.files or not request.files["file"].filename:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)

        if not allowed_file(filename):
            return jsonify({"error": "Only PDF files are allowed"}), 400

        file_bytes = file.read()
        try:
            scanii_result = check_scanii_from_file(file_bytes, filename)
        except Exception as e:
            logger.warning(f"Scanii failed: {e}")
            scanii_result = {"error": "Scanii scan failed"}

        file.stream.seek(0)

        with temp_file(file, filename) as path:
            pred, proba, features, found_urls, file_details = predict_pdf_direct(path)

            result = "phishing" if proba >= threshold else "benign"

            return jsonify({
                "type": "pdf",
                "prediction": result,
                "score": round(proba * 100, 2),
                "extra": {
                    "urls_found": found_urls,
                    "features": features,
                    "file_details": file_details,
                    "third_party_eval": {"scanii": scanii_result}
                }
            }), 200

    except Exception as e:
        logger.exception("PDF prediction failed")
        return jsonify({"error": str(e)}), 500
