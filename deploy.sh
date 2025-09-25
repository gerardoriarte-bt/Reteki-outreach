#!/bin/bash

# Script de Despliegue - Reteki Outreach
# Uso: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
APP_DIR="/var/www/reteki-outreach"
BACKUP_DIR="/var/backups/reteki-outreach"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Iniciando despliegue de Reteki Outreach en modo: $ENVIRONMENT"
echo "📅 Fecha: $(date)"

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log "❌ Error: No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

# Crear backup antes del despliegue
log "📦 Creando backup de la aplicación actual..."
if [ -d "$APP_DIR" ]; then
    mkdir -p $BACKUP_DIR
    tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .
    log "✅ Backup creado: $BACKUP_DIR/app_backup_$DATE.tar.gz"
fi

# Instalar dependencias
log "📦 Instalando dependencias..."
npm ci --production=false

# Build de producción
log "🔨 Construyendo aplicación para producción..."
npm run build:prod

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    log "❌ Error: El build falló. No se encontró el directorio dist/"
    exit 1
fi

log "✅ Build completado exitosamente"

# Verificar variables de entorno
if [ ! -f ".env.production" ]; then
    log "⚠️  Advertencia: No se encontró .env.production"
    log "📝 Copia env.example a .env.production y configura las variables necesarias"
fi

# Mostrar información del build
log "📊 Información del build:"
ls -la dist/
du -sh dist/

log "🎉 Despliegue completado exitosamente!"
log "📋 Próximos pasos:"
log "   1. Configura las variables de entorno en .env.production"
log "   2. Copia los archivos al servidor de producción"
log "   3. Configura Nginx con el archivo nginx.conf"
log "   4. Inicia la aplicación con PM2 usando ecosystem.config.js"
log "   5. Configura SSL con Let's Encrypt"

echo ""
log "🔗 Archivos importantes creados:"
log "   - dist/ (aplicación construida)"
log "   - ecosystem.config.js (configuración PM2)"
log "   - nginx.conf (configuración Nginx)"
log "   - env.example (ejemplo de variables de entorno)"
