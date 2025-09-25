# Guía de Despliegue - Reteki Outreach

## 📋 Índice
1. [Prerrequisitos](#prerrequisitos)
2. [Configuración del Servidor](#configuración-del-servidor)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Configuración de la Aplicación](#configuración-de-la-aplicación)
5. [Configuración de Base de Datos](#configuración-de-base-de-datos)
6. [Configuración de Nginx](#configuración-de-nginx)
7. [Configuración de PM2](#configuración-de-pm2)
8. [Configuración de SSL](#configuración-de-ssl)
9. [Monitoreo y Logs](#monitoreo-y-logs)
10. [Backup y Recuperación](#backup-y-recuperación)
11. [Troubleshooting](#troubleshooting)

## 🔧 Prerrequisitos

### Servidor
- **OS**: Ubuntu 20.04 LTS o superior
- **CPU**: Mínimo 2 vCPUs (4 recomendados)
- **RAM**: Mínimo 4GB (8GB recomendados)
- **Almacenamiento**: 50GB SSD mínimo
- **Red**: Conexión estable a internet

### Software Requerido
- **Node.js**: 18.x LTS o superior
- **npm**: 8.x o superior
- **Nginx**: 1.18 o superior
- **PostgreSQL**: 13 o superior (opcional)
- **Redis**: 6.x o superior (opcional)
- **PM2**: Para gestión de procesos
- **Git**: Para clonar el repositorio

## 🖥️ Configuración del Servidor

### 1. Actualizar el Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js
```bash
# Instalar Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 3. Instalar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Instalar PM2 Globalmente
```bash
sudo npm install -g pm2
```

### 5. Crear Usuario para la Aplicación
```bash
sudo adduser --system --group --home /var/www/reteki-outreach reteki
sudo mkdir -p /var/www/reteki-outreach
sudo chown reteki:reteki /var/www/reteki-outreach
```

## 📦 Instalación de Dependencias

### 1. Clonar el Repositorio
```bash
cd /var/www/reteki-outreach
sudo -u reteki git clone https://github.com/tu-usuario/Reteki-outreach.git .
```

### 2. Instalar Dependencias
```bash
sudo -u reteki npm install
```

### 3. Build de Producción
```bash
sudo -u reteki npm run build
```

## ⚙️ Configuración de la Aplicación

### 1. Variables de Entorno
```bash
sudo -u reteki nano /var/www/reteki-outreach/.env.production
```

```bash
# .env.production
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=tu_api_key_de_produccion
DATABASE_URL=postgresql://usuario:password@localhost:5432/reteki_outreach
REDIS_URL=redis://localhost:6379
SENTRY_DSN=tu_sentry_dsn_si_tienes
```

### 2. Configuración de Vite para Producción
```bash
sudo -u reteki nano /var/www/reteki-outreach/vite.config.prod.ts
```

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ai: ['@google/genai']
          }
        }
      }
    },
    server: {
      port: 3000,
      host: '0.0.0.0'
    }
  };
});
```

## 🗄️ Configuración de Base de Datos

### 1. Instalar PostgreSQL (Opcional)
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Crear Base de Datos
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE reteki_outreach;
CREATE USER reteki_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE reteki_outreach TO reteki_user;
\q
```

### 3. Instalar Redis (Opcional)
```bash
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## 🌐 Configuración de Nginx

### 1. Crear Configuración del Sitio
```bash
sudo nano /etc/nginx/sites-available/reteki-outreach
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Static files
    location /static/ {
        alias /var/www/reteki-outreach/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. Habilitar el Sitio
```bash
sudo ln -s /etc/nginx/sites-available/reteki-outreach /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 Configuración de PM2

### 1. Crear Archivo de Configuración
```bash
sudo -u reteki nano /var/www/reteki-outreach/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'reteki-outreach',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/reteki-outreach',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/reteki-outreach-error.log',
    out_file: '/var/log/pm2/reteki-outreach-out.log',
    log_file: '/var/log/pm2/reteki-outreach.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 2. Crear Directorio de Logs
```bash
sudo mkdir -p /var/log/pm2
sudo chown reteki:reteki /var/log/pm2
```

### 3. Iniciar la Aplicación
```bash
cd /var/www/reteki-outreach
sudo -u reteki pm2 start ecosystem.config.js --env production
sudo -u reteki pm2 save
sudo -u reteki pm2 startup
```

## 🔒 Configuración de SSL

### 1. Instalar Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtener Certificado SSL
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 3. Configurar Renovación Automática
```bash
sudo crontab -e
```

Agregar la línea:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Logs

### 1. Configurar Logrotate
```bash
sudo nano /etc/logrotate.d/reteki-outreach
```

```
/var/log/pm2/reteki-outreach*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 reteki reteki
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
```

### 2. Instalar Monitoreo Básico
```bash
# Instalar htop para monitoreo del sistema
sudo apt install htop -y

# Instalar netstat para monitoreo de red
sudo apt install net-tools -y
```

### 3. Script de Monitoreo
```bash
sudo -u reteki nano /var/www/reteki-outreach/monitor.sh
```

```bash
#!/bin/bash

# Script de monitoreo básico
echo "=== Reteki Outreach Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Memory: $(free -h)"
echo "Disk: $(df -h /)"
echo "PM2 Status:"
pm2 status
echo "Nginx Status:"
systemctl status nginx --no-pager
echo "==============================="
```

```bash
chmod +x /var/www/reteki-outreach/monitor.sh
```

## 💾 Backup y Recuperación

### 1. Script de Backup
```bash
sudo -u reteki nano /var/www/reteki-outreach/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/reteki-outreach"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/reteki-outreach"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de la aplicación
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Backup de la base de datos (si existe)
if [ ! -z "$DATABASE_URL" ]; then
    pg_dump $DATABASE_URL > $BACKUP_DIR/db_$DATE.sql
fi

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 2. Configurar Backup Automático
```bash
sudo crontab -e
```

Agregar:
```bash
0 2 * * * /var/www/reteki-outreach/backup.sh
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. La aplicación no inicia
```bash
# Verificar logs
pm2 logs reteki-outreach

# Verificar puerto
netstat -tlnp | grep :3000

# Reiniciar aplicación
pm2 restart reteki-outreach
```

#### 2. Error de permisos
```bash
# Corregir permisos
sudo chown -R reteki:reteki /var/www/reteki-outreach
sudo chmod -R 755 /var/www/reteki-outreach
```

#### 3. Nginx no sirve la aplicación
```bash
# Verificar configuración
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 4. Error de API Key
```bash
# Verificar variables de entorno
pm2 show reteki-outreach

# Verificar archivo .env
cat /var/www/reteki-outreach/.env.production
```

### Comandos Útiles

```bash
# Estado de la aplicación
pm2 status

# Logs en tiempo real
pm2 logs reteki-outreach --lines 100

# Reiniciar aplicación
pm2 restart reteki-outreach

# Parar aplicación
pm2 stop reteki-outreach

# Monitoreo de recursos
htop

# Verificar puertos
netstat -tlnp

# Verificar espacio en disco
df -h

# Verificar memoria
free -h
```

## ✅ Checklist de Despliegue

### Pre-Despliegue
- [ ] Servidor configurado y actualizado
- [ ] Node.js y npm instalados
- [ ] Nginx instalado y configurado
- [ ] PM2 instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas
- [ ] Build de producción generado
- [ ] Variables de entorno configuradas

### Despliegue
- [ ] Aplicación iniciada con PM2
- [ ] Nginx configurado y funcionando
- [ ] SSL configurado
- [ ] Monitoreo configurado
- [ ] Backup configurado
- [ ] Logs funcionando

### Post-Despliegue
- [ ] Aplicación accesible vía web
- [ ] Funcionalidades probadas
- [ ] Performance validada
- [ ] Monitoreo activo
- [ ] Documentación actualizada

## 📞 Soporte

### Contacto de Emergencia
- **Email**: soporte@reteki.com
- **Teléfono**: [Número de emergencia]
- **Slack**: #reteki-outreach

### Recursos Adicionales
- **Documentación**: [URL de documentación]
- **Repositorio**: [URL del repo]
- **Logs**: `/var/log/pm2/`
- **Configuración**: `/var/www/reteki-outreach/`

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo Reteki

