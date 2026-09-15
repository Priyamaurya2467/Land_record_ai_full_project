FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr poppler-utils \
    tesseract-ocr-hin tesseract-ocr-mar tesseract-ocr-tam tesseract-ocr-tel \
    tesseract-ocr-ben tesseract-ocr-guj tesseract-ocr-kan tesseract-ocr-mal \
    tesseract-ocr-pan tesseract-ocr-ori \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
RUN mkdir -p uploads

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]