# Proyecto de Reservas

Este proyecto utiliza REACT+VITE para construir el sitio web y Docker para la contenedorización. Sigue los pasos a continuación para configurar y ejecutar el proyecto.

## Desplegar a Producción

### 1. Construir la imagen Docker
Crea una imagen Docker para el proyecto usando el siguiente comando:
```sh
docker build -t reservas-aulas-front:latest .
```
Este comando utiliza el Dockerfile presente en la raíz del proyecto para construir una imagen con la etiqueta reservas-aulas-front:latest.

### 2. Ejecutar el contenedor con Docker Compose
Finalmente, usa Docker Compose para iniciar los contenedores definidos en el archivo docker-compose.yml:
```sh
docker-compose up
```
Este comando iniciará todos los servicios definidos en el archivo docker-compose.yml, incluyendo el contenedor con la imagen reservas-aulas-front.

## Configuración del Entorno de Desarrollo
Para configurar el entorno de desarrollo, asegúrate de que el perfil activo sea dev. Puedes establecer el perfil activo en tu archivo de constantes `consts.js` como sigue:

### En `application.yml`
```yaml
export const PROJECT_PROFILE = "dev";
```
Este ajuste configurará el perfil activo para que use las propiedades definidas para el entorno de desarrollo.
