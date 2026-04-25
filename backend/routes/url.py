from flask import Blueprint, request, jsonify
import urllib.parse
import logging
import base64
import cv2
import numpy as np

from utils.url_screenshot import get_screenshot_base64
from utils.url_third_party import (
    check_virustotal,
    check_google_safe_browsing,
    check_urlvoid,
)

from services.url_model import predict_url_direct
from services.image_model import predict_image_direct

bp = Blueprint("url", __name__)
logger = logging.getLogger(__name__)

def base64_to_cv2(base64_string):
    try:
        if base64_string.startswith("data:image"):
            base64_string = base64_string.split(",")[1]
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logger.warning(f"Could not convert base64 to cv2 image: {e}")
        return None

@bp.route("/predict", methods=["POST"])
@bp.route("/scan", methods=["POST"])
def predict_url_endpoint():
    try:
        data = request.get_json(silent=True)
        if not data or ("url" not in data and "text" not in data):
            return jsonify({"error": "Missing 'url' or 'text'"}), 400

        input_text = data.get("url", data.get("text", "")).strip()
        if not input_text:
            return jsonify({"error": "Input cannot be empty"}), 400

        # 1. URL Model Prediction (Random Forest)
        url_pred, url_proba, features = predict_url_direct(input_text)
        
        # 2. Screenshot Capture (Playwright)
        screenshot_b64 = get_screenshot_base64(input_text)
        screenshot_url = (
            f"data:image/png;base64,{screenshot_b64}"
            if screenshot_b64
            else "https://via.placeholder.com/400?text=No+Screenshot"
        )
        
        # 3. Vision Model Prediction (EfficientNet)
        image_score = None
        if screenshot_b64:
            cv_img = base64_to_cv2(screenshot_b64)
            if cv_img is not None:
                try:
                    img_pred, img_proba = predict_image_direct(cv_img)
                    image_score = round(img_proba * 100, 2)
                except Exception as e:
                    logger.error(f"Image prediction on screenshot failed: {e}")

        # 4. Multi-Modal Fusion Logic
        if image_score is not None:
            vision_proba = image_score / 100.0
            
            # Use stronger URL weight (70% URL, 30% Vision)
            # as image model shows consistent bias (~35%)
            fusion_score = (url_proba * 0.7) + (vision_proba * 0.3)
            
            # Confidence Override:
            # If URL model is very certain (>85%), trust it completely
            # If Vision model is very certain (>85%), trust it completely
            if url_proba > 0.85 or vision_proba > 0.85:
                final_score_val = max(url_proba, vision_proba)
            # If they conflict significantly, favor the URL model but damp it
            elif url_proba > 0.6 and vision_proba < 0.4:
                final_score_val = (url_proba * 0.8) + (vision_proba * 0.2)
            else:
                final_score_val = fusion_score
        else:
            final_score_val = url_proba

        # Determine final classification
        result = "phishing" if final_score_val >= 0.50 else "benign"

        # 5. Third Party Enrichment
        parsed = urllib.parse.urlparse(input_text)
        domain = parsed.netloc or parsed.path
        third_party = {
            "virusTotal": check_virustotal(input_text),
            "googleSafeBrowsing": check_google_safe_browsing(input_text),
            "urlVoid": check_urlvoid(domain),
        }

        logger.info(f"URL={input_text} | url_prob={url_proba:.4f} | img_prob={image_score} | final={final_score_val:.4f} | result={result}")

        return jsonify({
            "type": "url",
            "prediction": result,
            "score": round(final_score_val * 100, 2),
            "analysis_mode": "multi-modal" if image_score is not None else "url-only",
            "extra": {
                "url_score": round(url_proba * 100, 2),
                "image_score": image_score,
                "screenshot_url": screenshot_url,
                "features": features,
                "third_party_eval": third_party
            }
        }), 200

    except Exception as e:
        logger.exception("URL prediction failed")
        return jsonify({"error": str(e)}), 500
