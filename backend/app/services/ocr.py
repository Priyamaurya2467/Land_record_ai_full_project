import os
import shutil

from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import pytesseract


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

# Works on both Windows and Linux/Render.
# Windows can use:
# C:\Program Files\Tesseract-OCR\tesseract.exe
#
# Render/Linux can use:
# /usr/bin/tesseract

TESSERACT_CMD = (
    os.getenv("TESSERACT_CMD")
    or shutil.which("tesseract")
)

if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD


# =========================================================
# PDF SUPPORT
# =========================================================

try:
    from pdf2image import convert_from_path

    PDF_SUPPORT = True

except ImportError:
    PDF_SUPPORT = False


# =========================================================
# SUPPORTED OCR LANGUAGES
# =========================================================

LANGUAGES = {
    "eng": "English",
    "hin": "Hindi",
    "mar": "Marathi",
    "tam": "Tamil",
    "tel": "Telugu",
    "ben": "Bengali",
    "guj": "Gujarati",
    "kan": "Kannada",
    "mal": "Malayalam",
    "pan": "Punjabi",
    "ori": "Odia",
}


# =========================================================
# IMAGE PREPROCESSING
# =========================================================

def preprocess(img):
    """
    Improve scanned/document images before OCR.
    """

    # Convert to grayscale
    img = img.convert("L")

    # Upscale small documents
    width, height = img.size

    if width < 1800:

        scale = 1800 / width

        img = img.resize(
            (
                int(width * scale),
                int(height * scale),
            )
        )

    # Improve contrast
    img = ImageOps.autocontrast(img)

    # Remove small noise
    img = img.filter(
        ImageFilter.MedianFilter(size=3)
    )

    # Sharpen text
    img = ImageEnhance.Sharpness(
        img
    ).enhance(2.0)

    # Improve text/background contrast
    img = ImageEnhance.Contrast(
        img
    ).enhance(1.4)

    return img


# =========================================================
# OCR FOR SINGLE IMAGE
# =========================================================

def _ocr_image(image, lang):
    """
    Run Tesseract OCR using PSM 4.
    """

    if not TESSERACT_CMD:

        raise RuntimeError(
            "Tesseract OCR is not installed "
            "or cannot be found in PATH."
        )

    image = preprocess(image)

    config = "--oem 3 --psm 4"

    data = pytesseract.image_to_data(
        image,
        lang=lang,
        config=config,
        output_type=pytesseract.Output.DICT,
    )

    lines = {}
    confidences = []

    for i, word in enumerate(data["text"]):

        word = word.strip()

        try:
            confidence = float(
                data["conf"][i]
            )
        except Exception:
            confidence = -1

        if not word or confidence < 0:
            continue

        block_number = data["block_num"][i]
        paragraph_number = data["par_num"][i]
        line_number = data["line_num"][i]

        key = (
            block_number,
            paragraph_number,
            line_number,
        )

        if key not in lines:
            lines[key] = []

        lines[key].append(word)

        confidences.append(
            confidence
        )

    # Preserve OCR line structure
    text_lines = [
        " ".join(words)
        for words in lines.values()
    ]

    text = "\n".join(text_lines)

    # Average OCR confidence
    confidence = (
        sum(confidences)
        / len(confidences)
        if confidences
        else 0.0
    )

    return text, confidence


# =========================================================
# MAIN OCR FUNCTION
# =========================================================

def run_ocr(path, lang="eng"):
    """
    Run OCR on an image or PDF.

    Returns:
        text, confidence
    """

    # -----------------------------------------------------
    # TESSERACT CHECK
    # -----------------------------------------------------

    if not TESSERACT_CMD:

        raise RuntimeError(
            "Tesseract OCR is not installed "
            "or cannot be found in PATH."
        )

    # -----------------------------------------------------
    # LANGUAGE CHECK
    # -----------------------------------------------------

    if lang not in LANGUAGES:

        raise ValueError(
            f"Unsupported OCR language: {lang}"
        )

    # -----------------------------------------------------
    # FILE CHECK
    # -----------------------------------------------------

    if not os.path.exists(path):

        raise FileNotFoundError(
            f"OCR file not found: {path}"
        )

    extension = os.path.splitext(
        path
    )[1].lower()

    # =====================================================
    # PDF
    # =====================================================

    if extension == ".pdf":

        if not PDF_SUPPORT:

            raise RuntimeError(
                "PDF OCR requires pdf2image "
                "and Poppler."
            )

        pages = convert_from_path(
            path,
            dpi=300,
        )

        results = []

        for page in pages:

            results.append(
                _ocr_image(
                    page,
                    lang,
                )
            )

        if not results:

            return "", 0.0

        text = "\n".join(
            result[0]
            for result in results
        )

        confidence = (
            sum(
                result[1]
                for result in results
            )
            / len(results)
        )

        return text, confidence

    # =====================================================
    # IMAGE
    # =====================================================

    with Image.open(path) as image:

        return _ocr_image(
            image,
            lang,
        )