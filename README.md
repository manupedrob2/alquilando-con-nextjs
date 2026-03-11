# AlquileresApp con Next.js

Proyecto completo de alquileres con backend en .NET Core y frontend en Next.js.

## 🏗️ Arquitectura

### Backend (.NET Core API)
- **Framework:** .NET 9.0
- **Base de datos:** SQLite con Entity Framework Core
- **Autenticación:** JWT Tokens
- **Arquitectura:** Clean Architecture con Casos de Uso

### Frontend (Next.js)
- **Framework:** Next.js 14 con App Router
- **Estilos:** Tailwind CSS
- **Lenguaje:** TypeScript
- **Estado:** Context API para autenticación

## 🚀 Cómo ejecutar el proyecto

### Backend
```bash
cd AlquileresApp.UI
dotnet run --urls="http://localhost:5234"
```

### Frontend
```bash
cd alquileres-frontend
npm install
npm run dev
```

## 📡 Endpoints de la API

### Autenticación
- `POST /api/usuarios/login` - Iniciar sesión
- `POST /api/usuarios/register` - Registrarse
- `GET /api/usuarios/perfil` - Obtener perfil

### Propiedades
- `GET /api/propiedades` - Listar propiedades
- `GET /api/propiedades/destacadas` - Propiedades destacadas
- `GET /api/propiedades/filtrar` - Filtrar propiedades
- `GET /api/propiedades/{id}` - Obtener propiedad

### Reservas
- `POST /api/reservas` - Crear reserva
- `GET /api/reservas/mis-reservas` - Mis reservas
- `DELETE /api/reservas/{id}` - Cancelar reserva

### Imágenes
- `POST /api/imagenes/upload` - Subir imagen
- `GET /api/imagenes/propiedad/{id}` - Imágenes de propiedad

### Promociones
- `GET /api/promociones` - Listar promociones
- `GET /api/promociones/activas` - Promociones activas

## 🔐 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|------|
| admi@gmail.com | password123 | Administrador |
| milagrosguasco11@gmail.com | password123 | Cliente |
| maria.garcia@test.com | password456 | Cliente |

## 🛠️ Tecnologías Utilizadas

### Backend
- .NET 9.0
- Entity Framework Core
- SQLite
- JWT Authentication
- AutoMapper
- FluentValidation

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- Lucide Icons

## � Estructura del Proyecto

```
alquilando/
├── AlquileresApp.Core/          # Lógica de negocio
├── AlquileresApp.Data/           # Acceso a datos
├── AlquileresApp.UI/            # API REST
└── alquileres-frontend/         # Frontend Next.js
    ├── src/
    │   ├── app/               # Páginas (App Router)
    │   ├── components/        # Componentes React
    │   ├── lib/              # Utilidades y API
    │   └── contexts/         # Contextos de estado
    └── package.json
```

## 🎯 Características Principales

- ✅ Autenticación con JWT
- ✅ Gestión de propiedades
- ✅ Sistema de reservas
- ✅ Carga de imágenes
- ✅ Promociones y descuentos
- ✅ Filtros de búsqueda
- ✅ Diseño responsive
- ✅ TypeScript para tipado seguro

## 🚀 Deploy

El proyecto está configurado para deploy en:
- **Backend:** Azure App Service o cualquier servicio .NET
- **Frontend:** Vercel, Netlify o cualquier servicio Node.js

## 📝 Notas

- El backend corre en `http://localhost:5234`
- El frontend corre en `http://localhost:3000`
- CORS configurado para desarrollo local
- Base de datos SQLite en `AlquileresApp.Data/Alquilando.db`
- `AlquileresApp.Data`: Maneja la conexión y acceso a la base de datos.

---

## 🚀 Cómo ejecutar

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/manupedrob/AlquileresApp.git
   cd AlquileresApp
