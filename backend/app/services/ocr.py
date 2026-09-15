import os

from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import pytesseract

# ---------------------------------------------------------
# Tesseract configuration
# ---------------------------------------------------------

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ---------------------------------------------------------
# Optional PDF support
# ---------------------------------------------------------

try:
    from pdf2image import convert_from_path

    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False


# ---------------------------------------------------------
# Supported OCR languages
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------

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
    img = ImageEnhance.Sharpness(img).enhance(2.0)

    # Improve text/background contrast
    img = ImageEnhance.Contrast(img).enhance(1.4)

    return img


# ---------------------------------------------------------
# OCR for a single image
# ---------------------------------------------------------

def _ocr_image(image, lang):
    """
    Run Tesseract OCR using PSM 4.

    PSM 4 works well for structured land-record
    documents containing multiple text blocks.
    """

    image = preprocess(image)

    # IMPORTANT:
    # PSM 4 was tested against the land-record image
    # and produced much better recognition.
    config = "--oem 3 --psm 4"

    data = pytesseract.image_to_data(
        image,
        lang=lang,
        config=config,
        output_type=pytesseract.Output.DICT,
    )

    # Preserve OCR line structure.
    # This is important for the extractor because
    # fields such as:
    #
    # District: Dehradun
    # Village: Rampur
    #
    # are much easier to extract when lines are preserved.

    lines = {}
    confidences = []

    for i, word in enumerate(data["text"]):

        word = word.strip()

        try:
            confidence = float(data["conf"][i])
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

        confidences.append(confidence)

    # Convert grouped words into separate lines
    text_lines = [
        " ".join(words)
        for words in lines.values()
    ]

    text = "\n".join(text_lines)

    # Calculate average OCR confidence
    confidence = (
        sum(confidences) / len(confidences)
        if confidences
        else 0.0
    )

    return text, confidence


# ---------------------------------------------------------
# Main OCR function
# ---------------------------------------------------------

def run_ocr(path, lang="eng"):
    """
    Run OCR on an image or PDF.

    Returns:
        text, confidence
    """

    # Validate language
    if lang not in LANGUAGES:
        raise ValueError(
            f"Unsupported OCR language: {lang}"
        )

    # Validate file
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"OCR file not found: {path}"
        )

    extension = os.path.splitext(path)[1].lower()

    # -----------------------------------------------------
    # PDF
    # -----------------------------------------------------

    if extension == ".pdf":

        if not PDF_SUPPORT:
            raise RuntimeError(
                "PDF OCR requires pdf2image and Poppler."
            )

        pages = convert_from_path(
            path,
            dpi=300,
        )

        results = []

        for page in pages:
            results.append(
                _ocr_image(page, lang)
            )

        if not results:
            return "", 0.0

        text = "\n".join(
            result[0]
            for result in results
        )

        confidence = (
            sum(result[1] for result in results)
            / len(results)
        )

        return text, confidence

    # -----------------------------------------------------
    # Image
   

    with Image.open(path) as image:

        return _ocr_image(
            image,
            lang,
        )