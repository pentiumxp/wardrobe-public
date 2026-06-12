FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=300

WORKDIR /app

COPY requirements.txt .
COPY vendor/wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt

COPY app.py .
COPY wardrobe_app ./wardrobe_app
COPY web ./web

EXPOSE 8765

CMD ["python", "app.py"]
