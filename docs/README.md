# Plataforma de Gestión de Transporte – Estado Aragua

## Descripción
Sistema web para la Secretaría de Transporte del Estado Aragua. Permite registrar y consultar la oferta de transporte público terrestre (organizaciones, vehículos, choferes y rutas) con soporte geoespacial.

## Estructura del proyecto
- `docs/`: Documentación técnica y de requisitos.
- `backend/`: Aplicación Django (API REST).
- `frontend/`: Aplicación React (UI).
- `docker-compose.yml`: Orquestación de servicios.
- `README.md`: Este archivo.

## Requisitos previos
- Docker y Docker Compose instalados.
- PostgreSQL 14+ con PostGIS (para desarrollo local sin Docker).

## Instalación y ejecución

### Con Docker
```bash
docker-compose up -d