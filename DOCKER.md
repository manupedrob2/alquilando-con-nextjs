# 🐳 Docker - AlquileresApp con Next.js

Este proyecto está completamente dockerizado para facilitar el despliegue y desarrollo.

## 🚀 Comandos Rápidos

### Producción
```bash
# Levantar todo en producción
docker-compose up -d

# Detener todo
docker-compose down

# Ver logs
docker-compose logs -f
```

### Desarrollo
```bash
# Levantar todo en desarrollo (con hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Detener todo
docker-compose -f docker-compose.dev.yml down

# Reconstruir y levantar
docker-compose -f docker-compose.dev.yml up --build -d
```

## 📋 Servicios

### Backend (.NET API)
- **Contenedor:** `alquilando-backend`
- **Puerto:** `5234`
- **URL:** http://localhost:5234
- **Health Check:** http://localhost:5234/api/propiedades

### Frontend (Next.js)
- **Contenedor:** `alquilando-frontend`
- **Puerto:** `3000`
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000

### Base de Datos
- **Volumen:** `db_data`
- **Tipo:** SQLite persistente
- **Ubicación:** `/app/data` en el contenedor

## 🔧 Configuración

### Variables de Entorno

#### Backend
- `ASPNETCORE_ENVIRONMENT`: Production/Development
- `ASPNETCORE_URLS`: http://+:5234

#### Frontend
- `NODE_ENV`: production/development
- `NEXT_PUBLIC_API_URL`: http://localhost:5234/api

### Volúmenes

#### Desarrollo
- Código fuente montado para hot-reload
- Node modules aislados
- Base de datos persistente

#### Producción
- Solo base de datos persistente
- Imágenes optimizadas

## 🏗️ Estructura de Docker

```
alquilando/
├── docker-compose.yml          # Producción
├── docker-compose.dev.yml      # Desarrollo
├── .dockerignore              # Backend ignore
├── AlquileresApp.UI/
│   └── Dockerfile            # Backend producción
└── alquileres-frontend/
    ├── Dockerfile             # Frontend producción
    ├── Dockerfile.dev         # Frontend desarrollo
    └── .dockerignore        # Frontend ignore
```

## 🌐 Acceso a la Aplicación

Una vez levantado, puedes acceder a:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5234
- **API Documentation:** http://localhost:5234/api

## 🔍 Troubleshooting

### Si los contenedores no se inician:
```bash
# Verificar puertos
netstat -tulpn | grep -E ':(3000|5234)'

# Limpiar Docker completamente
docker-compose down -v
docker system prune -f
```

### Reconstruir imágenes:
```bash
# Forzar reconstrucción
docker-compose up --build --force-recreate
```

### Acceder a contenedores:
```bash
# Backend
docker exec -it alquilando-backend bash

# Frontend
docker exec -it alquilando-frontend sh
```

## 🚀 Deploy en Producción

Para deploy en producción:
```bash
# Usar docker-compose.yml
docker-compose -f docker-compose.yml up -d
```

## 📝 Notas

- Los datos de la base de datos persisten en el volumen `db_data`
- En desarrollo se monta el código fuente para hot-reload
- Los health checks verifican que los servicios estén funcionando
- CORS configurado para comunicación entre contenedores
