# Reteki Outreach - Generador de Mensajes de LinkedIn con IA

Una aplicación web avanzada que utiliza inteligencia artificial para generar mensajes de LinkedIn y emails hiper-personalizados dirigidos específicamente a prospectos del ICP (Ideal Customer Profile) de Reteki.

## 🎯 Resumen del Proyecto

**Reteki Outreach** es una herramienta de prospección B2B que automatiza la generación de mensajes personalizados para diferentes roles de tomadores de decisión, optimizando las campañas de outreach y aumentando las tasas de conversión.

### Valor de Negocio
- **Aumento de conversión**: Mensajes personalizados por rol específico
- **Eficiencia operativa**: Automatización del proceso de personalización
- **Escalabilidad**: Procesamiento de múltiples perfiles simultáneamente
- **ROI mejorado**: Enfoque en el ICP correcto de Reteki

## ✨ Características Principales

### 🎯 Generación Inteligente
- **Mensajes personalizados** usando Google Gemini 2.5 Flash AI
- **Prompts especializados** por rol (Director de TI, Director Financiero, etc.)
- **Dos tipos de mensaje**: LinkedIn (300 caracteres) o Email (1500 caracteres)
- **Procesamiento de URLs** para enriquecer el contexto con información real

### 📊 Gestión de Datos
- **Procesamiento individual** de perfiles de LinkedIn
- **Historial completo** de mensajes enviados con estadísticas
- **Exportación a CSV** para análisis posterior

### ⚙️ Personalización Avanzada
- **Editor de prompts** personalizable por rol
- **Validación de ICP** automática
- **Persistencia local** de configuraciones
- **Interfaz intuitiva** con Material Design

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS con Material Design
- **IA**: Google Gemini 2.5 Flash API
- **Persistencia**: LocalStorage + PostgreSQL (opcional)
- **Build**: Vite con optimizaciones de producción

### Componentes Principales
- **App.tsx**: Componente raíz con gestión de estado
- **ProfileForm.tsx**: Formulario de captura de datos
- **RolePromptEditor.tsx**: Editor de prompts por rol
- **GeneratedMessage.tsx**: Visualizador de mensajes
- **SentMessagesView.tsx**: Historial y estadísticas

### Servicios
- **geminiService.ts**: Integración con Google Gemini AI
- **rolePromptService.ts**: Gestión de prompts por rol
- **urlReaderService.ts**: Procesamiento de URLs externas

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ (LTS recomendado)
- npm 8+ o yarn
- API Key de Google Gemini AI
- Navegador moderno con soporte para ES6+

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/Reteki-outreach.git
   cd Reteki-outreach
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local`:
   ```bash
   GEMINI_API_KEY=tu_api_key_de_gemini_aqui
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

### Build para Producción
```bash
npm run build
npm run preview
```

## 📖 Guía de Uso

### 1. Configuración Inicial
- **Seleccionar rol**: Elige el rol del destinatario (Director de TI, Director Financiero, etc.)
- **Tipo de mensaje**: LinkedIn (300 caracteres) o Email (1500 caracteres)
- **Personalizar prompts**: Opcionalmente edita los prompts para cada rol

### 2. Procesar Perfil Individual
1. Copia el texto completo del perfil de LinkedIn
2. Pega en el campo de texto
3. La IA extraerá automáticamente los datos relevantes
4. Revisa y ajusta los datos extraídos si es necesario
5. Genera el mensaje personalizado
6. Copia o marca como enviado


### 3. Gestionar Historial
- **Ver mensajes enviados**: Historial completo con estadísticas
- **Buscar y filtrar**: Encuentra mensajes específicos
- **Exportar datos**: Descarga en formato CSV
- **Estadísticas**: Métricas de envío por período

## 🎯 ICP de Reteki

La aplicación está completamente optimizada para el perfil de cliente ideal de Reteki:

### Perfil de Cliente Ideal
- **Tamaño de empresa**: 50-500 empleados (prioridad alta)
- **Sectores**: Tecnología, publicidad, educación, hotelería, salud, retail
- **Ubicación**: Colombia (Bogotá, Barranquilla, Cartagena, Cali, Medellín)
- **Antigüedad**: Mínimo 5 años de constitución

### Roles Objetivo
- **Director de TI**: Gestión de equipos, soporte técnico, flexibilidad
- **Director Financiero**: Optimización de costos, ROI, modelo OpEx vs CapEx
- **Gerente de Compras**: Relación costo-beneficio, confiabilidad del proveedor
- **CEO/Gerente General**: Estrategia, productividad, reducción de riesgos

### Pain Points Principales
- Gestión de TI ineficiente que distrae del core business
- Necesidad de flexibilidad tecnológica (arrendamiento 12-84 meses)
- Problemas con soporte tecnológico actual
- Necesidad de capital para inversión en TI
- Necesidad de adaptabilidad tecnológica y soluciones integrales

## 🔧 Configuración Avanzada

### Personalizar Prompts por Rol
1. Selecciona el rol deseado en el dropdown
2. Haz clic en "Editar Prompts para este Rol"
3. Modifica los prompts para LinkedIn y Email
4. Los cambios se guardan automáticamente en localStorage

### Variables de Entorno
```bash
# .env.local
GEMINI_API_KEY=tu_api_key_de_gemini
NODE_ENV=development
```

### Configuración de Vite
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
```

## 📊 Características Técnicas

### Rendimiento
- **Tiempo de carga inicial**: < 3 segundos
- **Tiempo de generación**: < 10 segundos
- **Tamaño del bundle**: < 500KB
- **Lighthouse Score**: > 90

### Seguridad
- **Validación de entrada**: Sanitización de todos los datos
- **API Key segura**: Almacenamiento en variables de entorno
- **Validación de URLs**: Prevención de acceso a recursos locales
- **HTTPS obligatorio** en producción

### Escalabilidad
- **PM2 Cluster Mode**: Múltiples instancias
- **Nginx Load Balancer**: Distribución de carga
- **CDN**: Distribución de contenido estático
- **Caché inteligente**: Optimización de respuestas

## 🚀 Despliegue en Producción

### Requisitos de Servidor
- **CPU**: 2 vCPUs (4 recomendados)
- **RAM**: 4GB (8GB recomendados)
- **Almacenamiento**: 50GB SSD
- **OS**: Ubuntu 20.04 LTS o superior

### Servicios Recomendados
- **Nginx**: Reverse proxy y servidor web
- **PM2**: Gestión de procesos Node.js
- **PostgreSQL**: Base de datos (opcional)
- **Redis**: Caché (opcional)
- **Cloudflare**: CDN y seguridad

### Guía de Despliegue
Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

## 📚 Documentación Completa

- **[TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)**: Documentación técnica detallada
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitectura del sistema
- **[PRD_PRODUCTION.md](./PRD_PRODUCTION.md)**: Product Requirements Document
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: Guía de despliegue

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **TypeScript**: Tipado estático obligatorio
- **ESLint**: Linting automático
- **Prettier**: Formateo de código
- **Commits**: Mensajes descriptivos en español

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

### Contacto Técnico
- **Email**: soporte@reteki.com
- **Slack**: #reteki-outreach
- **Documentación**: [Enlace a documentación completa]

### Recursos Adicionales
- **Repositorio**: [GitHub Repository]
- **Issues**: [GitHub Issues]
- **Wiki**: [GitHub Wiki]

## 🚀 Roadmap

### Versión 1.1 (Q1 2025)
- [ ] Autenticación de usuarios
- [ ] Base de datos para persistencia
- [ ] Analytics avanzados
- [ ] Templates de mensajes

### Versión 1.2 (Q2 2025)
- [ ] Integración con CRM
- [ ] A/B testing de prompts
- [ ] API pública
- [ ] Webhooks

### Versión 2.0 (Q3 2025)
- [ ] Machine Learning personalizado
- [ ] Integración con LinkedIn API
- [ ] Dashboard de analytics
- [ ] Mobile app

## 📊 Métricas de Éxito

### KPIs Principales
- **Mensajes generados por día**
- **Tasa de conversión por rol**
- **Tiempo promedio de generación**
- **Satisfacción del usuario**

### Objetivos de Rendimiento
- **Uptime**: 99.9%
- **Tiempo de respuesta**: < 2 segundos
- **Errores**: < 1%
- **Escalabilidad**: 1000+ usuarios concurrentes

---

**Desarrollado por**: Equipo de Desarrollo Reteki  
**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Estado**: Listo para Producción