"""
Image Model Service — loads EfficientNet-B0 using Keras 3 (standalone 'keras' package)
which is the same version the model was trained with.

This deliberately avoids tf_keras (TF_USE_LEGACY_KERAS) to prevent the
version-mismatch deserialization errors seen when using tf.keras.models.load_model()
on a Keras-3-format .keras file.
"""
import cv2
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "models"
IMAGE_MODEL_PATH = MODEL_DIR / "cnn_phishing_image.keras"

cnn_model = None


def load_image_model():
    global cnn_model
    if cnn_model is None:
        if not IMAGE_MODEL_PATH.exists():
            raise FileNotFoundError(f"Image CNN model not found: {IMAGE_MODEL_PATH}")
        try:
            # Import Keras 3 directly — completely independent from tf.keras / tf_keras.
            # This is the version the model was saved with, so no format mismatch.
            import keras
            logger.info(f"Loading Image CNN model with Keras {keras.__version__}...")
            cnn_model = keras.models.load_model(
                str(IMAGE_MODEL_PATH),
                compile=False
            )
            logger.info(
                f"Image CNN model loaded successfully. "
                f"Input: {cnn_model.input_shape}, Output: {cnn_model.output_shape}"
            )
        except Exception as e:
            import traceback
            logger.error(f"Failed to load Image CNN model: {e}")
            logger.error(traceback.format_exc())
            raise
    return cnn_model


def predict_image_direct(image_bgr):
    """
    Run the CNN Image model on a screenshot.

    Args:
        image_bgr: numpy array in OpenCV BGR format (from Playwright screenshot).
    Returns:
        (prediction: int, phishing_probability: float)
          prediction = 1 -> phishing
          prediction = 0 -> benign
    """
    model = load_image_model()

    # BGR -> RGB
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    # Determine input size from model (default 128x128)
    input_shape = model.input_shape  # e.g. (None, 128, 128, 3)
    target_h = input_shape[1] if (input_shape and input_shape[1]) else 128
    target_w = input_shape[2] if (input_shape and input_shape[2]) else 128

    img_resized = cv2.resize(image_rgb, (target_w, target_h))
    img_array = np.expand_dims(img_resized, axis=0).astype(np.float32)

    # EfficientNet-B0 preprocessing: scale [0, 255] -> [-1, 1]
    # Use numpy directly to avoid tf/keras version conflicts in preprocessing
    img_preprocessed = (img_array / 127.5) - 1.0

    proba = float(model.predict(img_preprocessed, verbose=0)[0][0])
    pred = 1 if proba >= 0.50 else 0

    logger.info(f"Image model: pred={pred}, proba={proba:.4f}")
    return pred, proba
