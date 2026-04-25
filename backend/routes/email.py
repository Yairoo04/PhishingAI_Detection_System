from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import logging
from services.email_model import predict_email_direct
from utils.common import temp_file
from utils.file_third_party import check_scanii_from_file

bp = Blueprint("email", __name__)
logger = logging.getLogger(__name__)

ALLOWED_EMAIL_EXTENSION = {"eml"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EMAIL_EXTENSION

@bp.route("/predict", methods=["POST"])
def predict_email():
    try:
        if "file" not in request.files or not request.files["file"].filename:
            return jsonify({"error": "No file selected"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)

        if not allowed_file(filename):
            return jsonify({"error": "Only .eml files are accepted"}), 400

        file_bytes = file.read()
        try:
            scanii_result = check_scanii_from_file(file_bytes, filename)
        except Exception as e:
            logger.warning(f"Scanii check failed: {e}")
            scanii_result = {"error": "Scanii scan failed"}
            
        file.stream.seek(0)

        with temp_file(file, filename) as file_path:
            pred, proba, features_dict, found_urls, details = predict_email_direct(file_path)

            result = "phishing" if proba >= 0.50 else "benign"

            response_data = {
                "type": "email",
                "prediction": result,
                "score": round(proba * 100, 2),
                "extra": {
                    "urls_found": found_urls,
                    "features": features_dict,
                    "third_party_eval": {"scanii": scanii_result},
                    "email_details": details
                }
            }

            return jsonify(response_data), 200

    except ValueError as ve:
        logger.error(f"ValueError: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.exception("Unexpected error processing email: %s", str(e))
        return jsonify({"error": f"System error: {str(e)}"}), 500