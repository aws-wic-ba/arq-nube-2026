# Usar una imagen oficial de Nginx muy ligera
FROM nginx:alpine

# Copiar el archivo index.html (tu frontend) a la carpeta pública del servidor
COPY index.html /usr/share/nginx/html/index.html

# Exponer el puerto 80 dentro del contenedor
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]