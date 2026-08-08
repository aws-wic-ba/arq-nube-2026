# Dockerfile multi-stage u optimizado para producción en AWS Fargate
FROM python:3.11-slim

# Definir variables de entorno de Python óptimas para contenedores
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY ./app ./app

# Crear un usuario no-root por seguridad (Principio de menor privilegio)
RUN useradd -u 8888 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer el puerto que usará el Application Load Balancer
EXPOSE 8080

# Comando de inicio usando Uvicorn (worker asíncrono de alto rendimiento)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
