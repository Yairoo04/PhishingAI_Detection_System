import cv2
from pyzbar.pyzbar import decode
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

def decode_qr_from_image(image_path_or_array):
    """
    Decodes QR codes from an image and returns a list of URLs.
    """
    if isinstance(image_path_or_array, str):
        image = cv2.imread(image_path_or_array)
    else:
        image = image_path_or_array
        
    if image is None:
        logger.warning("Empty or invalid image provided to QR decoder.")
        return []
        
    try:
        qr_codes = decode(image)
    except Exception as e:
        logger.error(f"Error during QR decoding: {e}")
        return []
        
    results = []
    if qr_codes:
        for qr in qr_codes:
            text_data = qr.data.decode("utf-8").strip()
            logger.info(f"QR code detected: {text_data}")
            
            try:
                parsed = urlparse(text_data)
                is_url = all([parsed.scheme, parsed.netloc])
            except Exception:
                is_url = False
                
            if is_url:
                results.append(text_data)
                
    return results
