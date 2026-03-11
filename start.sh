#!/bin/bash

# 🐳 Script para levantar AlquileresApp con Docker
# Uso: ./start.sh [dev|prod]

set -e

# Función para mostrar ayuda
show_help() {
    echo "🐳 AlquileresApp Docker Launcher"
    echo ""
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "OPCIONES:"
    echo "  dev     - Levantar en modo desarrollo (con hot-reload)"
    echo "  prod    - Levantar en modo producción"
    echo "  down    - Detener todos los contenedores"
    echo "  logs    - Mostrar logs de los contenedores"
    echo "  clean   - Limpiar Docker completamente"
    echo "  help    - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev     # Desarrollo"
    echo "  $0 prod    # Producción"
    echo "  $0 down    # Detener"
}

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker no está corriendo. Por favor inicia Docker primero."
        exit 1
    fi
}

# Función para desarrollo
start_dev() {
    echo "🚀 Iniciando AlquileresApp en modo DESARROLLO..."
    echo "📝 Hot-reload habilitado"
    echo "🔗 URLs:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend:  http://localhost:5234"
    echo ""
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker compose -f docker-compose.dev.yml up --build -d
    echo "✅ Aplicación levantada en modo desarrollo"
}

# Función para producción
start_prod() {
    echo "🚀 Iniciando AlquileresApp en modo PRODUCCIÓN..."
    echo "🔗 URLs:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend:  http://localhost:5234"
    echo ""
    docker compose down 2>/dev/null || true
    docker compose up --build -d
    echo "✅ Aplicación levantada en modo producción"
}

# Función para detener
stop_all() {
    echo "🛑 Deteniendo todos los contenedores..."
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker compose down 2>/dev/null || true
    echo "✅ Contenedores detenidos"
}

# Función para mostrar logs
show_logs() {
    echo "📋 Mostrando logs..."
    if docker compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        docker compose -f docker-compose.dev.yml logs -f
    else
        docker compose logs -f
    fi
}

# Función para limpiar
clean_docker() {
    echo "🧹 Limpiando Docker..."
    docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
    docker compose down -v 2>/dev/null || true
    docker system prune -f
    echo "✅ Docker limpiado"
}

# Main script
case "$1" in
    "dev")
        check_docker
        start_dev
        ;;
    "prod")
        check_docker
        start_prod
        ;;
    "down")
        stop_all
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        clean_docker
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        echo "❌ Debes especificar una opción. Usa 'help' para ver las opciones."
        show_help
        exit 1
        ;;
    *)
        echo "❌ Opción no reconocida: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "🎉 Comando ejecutado exitosamente!"
echo "📝 Para ver los logs usa: $0 logs"
echo "🛑 Para detener usa: $0 down"
