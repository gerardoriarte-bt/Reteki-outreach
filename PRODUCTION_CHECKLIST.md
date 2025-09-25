# ✅ Checklist de Producción - Reteki Outreach

## 🚨 **GAPS CRÍTICOS IDENTIFICADOS Y SOLUCIONADOS**

### **1. ✅ Configuración de Producción**
- [x] Scripts de producción agregados a package.json
- [x] Configuración de Vite optimizada para producción
- [x] Archivo de ejemplo de variables de entorno creado
- [x] Configuración de PM2 creada (ecosystem.config.js)
- [x] Configuración de Nginx creada (nginx.conf)
- [x] Script de despliegue automatizado creado (deploy.sh)

### **2. 🔧 Configuración del Servidor**

#### **Requisitos Mínimos del Servidor:**
- [ ] **OS**: Ubuntu 20.04 LTS o superior
- [ ] **CPU**: Mínimo 2 vCPUs (4 recomendados)
- [ ] **RAM**: Mínimo 4GB (8GB recomendados)
- [ ] **Almacenamiento**: 50GB SSD mínimo
- [ ] **Dominio**: Configurado y apuntando al servidor

#### **Software Requerido:**
- [ ] **Node.js**: 18.x LTS o superior
- [ ] **npm**: 8.x o superior
- [ ] **Nginx**: 1.18 o superior
- [ ] **PM2**: Para gestión de procesos
- [ ] **Git**: Para clonar el repositorio
- [ ] **Certbot**: Para SSL (Let's Encrypt)

### **3. 🔑 Variables de Entorno Críticas**

#### **REQUERIDO - Configurar antes del despliegue:**
- [ ] **GEMINI_API_KEY**: Tu API key de Google Gemini AI
- [ ] **NODE_ENV**: production
- [ ] **PORT**: 3000

#### **Opcional para futuras versiones:**
- [ ] **DATABASE_URL**: Para persistencia de datos
- [ ] **REDIS_URL**: Para caché y sesiones
- [ ] **SENTRY_DSN**: Para monitoreo de errores

### **4. 🚀 Pasos de Despliegue**

#### **Preparación del Servidor:**
```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar Nginx
sudo apt install nginx -y

# 4. Instalar PM2
sudo npm install -g pm2

# 5. Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y
```

#### **Despliegue de la Aplicación:**
```bash
# 1. Clonar repositorio
sudo mkdir -p /var/www/reteki-outreach
sudo chown $USER:$USER /var/www/reteki-outreach
cd /var/www/reteki-outreach
git clone https://github.com/tu-usuario/Reteki-outreach.git .

# 2. Configurar variables de entorno
cp env.example .env.production
nano .env.production  # Editar con tu API key real

# 3. Ejecutar script de despliegue
./deploy.sh production

# 4. Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/reteki-outreach
sudo ln -s /etc/nginx/sites-available/reteki-outreach /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. Configurar SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# 6. Iniciar aplicación con PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **5. 🔒 Seguridad**

#### **Configuraciones de Seguridad:**
- [ ] **HTTPS**: Certificado SSL configurado
- [ ] **Firewall**: Puertos 80, 443 abiertos
- [ ] **API Key**: Encriptada en variables de entorno
- [ ] **Headers de Seguridad**: Configurados en Nginx
- [ ] **Rate Limiting**: Implementado (futuro)

### **6. 📊 Monitoreo**

#### **Monitoreo Básico:**
- [ ] **PM2**: Monitoreo de procesos
- [ ] **Nginx**: Logs de acceso y errores
- [ ] **Sistema**: Uso de CPU, RAM, disco
- [ ] **Aplicación**: Logs de la aplicación

#### **Comandos de Monitoreo:**
```bash
# Estado de la aplicación
pm2 status
pm2 logs reteki-outreach

# Estado del sistema
htop
df -h
free -h

# Estado de Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### **7. 💾 Backup y Recuperación**

#### **Backup Automático:**
- [ ] **Script de backup**: Configurado en deploy.sh
- [ ] **Cron job**: Backup diario a las 2 AM
- [ ] **Retención**: 7 días de backups
- [ ] **Ubicación**: /var/backups/reteki-outreach/

### **8. 🧪 Testing de Producción**

#### **Tests Post-Despliegue:**
- [ ] **Acceso web**: Aplicación accesible vía HTTPS
- [ ] **Funcionalidad**: Generación de mensajes funciona
- [ ] **API**: Gemini AI responde correctamente
- [ ] **Performance**: Tiempo de respuesta < 3 segundos
- [ ] **SSL**: Certificado válido y renovación automática

### **9. 📈 Métricas de Producción**

#### **KPIs a Monitorear:**
- [ ] **Uptime**: > 99%
- [ ] **Tiempo de respuesta**: < 2 segundos
- [ ] **Mensajes generados**: Tracking diario
- [ ] **Uso de API**: Costos de Gemini AI
- [ ] **Errores**: < 1% de requests

### **10. 🆘 Troubleshooting**

#### **Problemas Comunes:**
- [ ] **Aplicación no inicia**: Verificar PM2 logs
- [ ] **Error de API**: Verificar GEMINI_API_KEY
- [ ] **Nginx no sirve**: Verificar configuración
- [ ] **SSL no funciona**: Verificar Certbot
- [ ] **Permisos**: Verificar ownership de archivos

## 🎯 **RESUMEN DE LO QUE FALTA**

### **CRÍTICO - Hacer ANTES del despliegue:**
1. **🔑 Configurar GEMINI_API_KEY** en .env.production
2. **🌐 Configurar dominio** y DNS
3. **🖥️ Preparar servidor** con requisitos mínimos
4. **📋 Ejecutar checklist** de despliegue

### **IMPORTANTE - Hacer DESPUÉS del despliegue:**
1. **🔒 Configurar SSL** con Let's Encrypt
2. **📊 Configurar monitoreo** básico
3. **💾 Configurar backup** automático
4. **🧪 Ejecutar tests** de producción

### **OPCIONAL - Para futuras versiones:**
1. **🗄️ Base de datos** PostgreSQL
2. **⚡ Redis** para caché
3. **📈 Analytics** avanzados
4. **🔐 Autenticación** de usuarios

## 🚀 **COMANDO RÁPIDO DE DESPLIEGUE**

```bash
# 1. Preparar servidor (ejecutar en servidor)
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
sudo apt install certbot python3-certbot-nginx -y

# 2. Desplegar aplicación (ejecutar en servidor)
cd /var/www/reteki-outreach
git pull origin main
cp env.example .env.production
nano .env.production  # Configurar GEMINI_API_KEY
./deploy.sh production
sudo cp nginx.conf /etc/nginx/sites-available/reteki-outreach
sudo ln -s /etc/nginx/sites-available/reteki-outreach /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tu-dominio.com
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

---

**✅ Estado**: Listo para producción con configuración completa
**📅 Última actualización**: Diciembre 2024
**👨‍💻 Mantenido por**: Equipo de Desarrollo Reteki
