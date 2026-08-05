FROM python:3.10-slim

WORKDIR /app

COPY fitConnect/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY fitConnect/. .

EXPOSE 8000

COPY fitConnect/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]