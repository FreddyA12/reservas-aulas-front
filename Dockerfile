# Usa una imagen de Node como base
FROM node:18-alpine

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos de package.json y package-lock.json a /app
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación a /app
COPY . .

# Expone el puerto 5173 para la aplicación en desarrollo (Vite usa 5173 por defecto)
EXPOSE 5173

# Comando por defecto para correr la aplicación en modo desarrollo
CMD ["npm", "run", "dev"]