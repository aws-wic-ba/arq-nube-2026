# Imagen oficial de Python
FROM python:3.12-slim

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos las dependencias
COPY requirements.txt .

# Instalamos dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el proyecto
COPY . .

# Puerto que utiliza Flask
EXPOSE 5000

# Variable para que Flask escuche desde cualquier interfaz
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Ejecutar la aplicación
CMD ["python", "app.py"]