FROM python:3.11-slim

# Create non-root user
RUN useradd -m -r appuser

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ src/
COPY data/ data/
COPY frontend/ frontend/

# Set Python path so engine is importable
ENV PYTHONPATH=/app/src

# Switch to non-root user
USER appuser

EXPOSE 5000

# Serve via gunicorn — Flask serves both /api and /app (frontend)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--chdir", "src/local_api", "app:app"]
