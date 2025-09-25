# Documentación Técnica - Reteki Outreach

## 📋 Índice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Componentes Principales](#componentes-principales)
6. [Servicios y APIs](#servicios-y-apis)
7. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
8. [Flujo de Datos](#flujo-de-datos)
9. [Seguridad](#seguridad)
10. [Rendimiento](#rendimiento)
11. [Mantenimiento](#mantenimiento)

## 🎯 Resumen del Proyecto

**Reteki Outreach** es una aplicación web que utiliza inteligencia artificial para generar mensajes de LinkedIn y emails hiper-personalizados dirigidos a prospectos específicos del ICP (Ideal Customer Profile) de Reteki.

### Objetivos Principales
- Generar mensajes personalizados para diferentes roles (Director de TI, Director Financiero, etc.)
- Procesar perfiles de LinkedIn individuales o en lote
- Mantener un historial de mensajes enviados
- Proporcionar prompts personalizables por rol
- Integrar con Google Gemini AI para generación de contenido

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External APIs │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (Gemini AI)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   LocalStorage  │    │   File System   │
│   (Persistencia)│    │   (Logs)        │
└─────────────────┘    └─────────────────┘
```

### Patrón de Arquitectura
- **Frontend**: Single Page Application (SPA) con React
- **Backend**: Servidor de desarrollo con Vite
- **Persistencia**: LocalStorage del navegador
- **APIs Externas**: Google Gemini AI para generación de contenido

## 🛠️ Stack Tecnológico

### Frontend
- **React 19**: Framework principal
- **TypeScript**: Tipado estático
- **Vite**: Build tool y servidor de desarrollo
- **Tailwind CSS**: Framework de estilos
- **React Hooks**: Gestión de estado

### Backend/APIs
- **Google Gemini AI**: Generación de contenido
- **Node.js**: Runtime para herramientas de build
- **Vite Dev Server**: Servidor de desarrollo

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **TypeScript Compiler**: Compilación de TypeScript
- **Git**: Control de versiones

## 📁 Estructura del Proyecto

```
Reteki-outreach/
├── public/                     # Archivos estáticos
├── src/
│   ├── components/            # Componentes React
│   │   ├── icons/            # Iconos SVG
│   │   ├── GeneratedMessage.tsx
│   │   ├── PasteProfile.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── ResultsView.tsx
│   │   ├── RolePromptEditor.tsx
│   │   ├── SentMessagesView.tsx
│   │   └── SettingsModal.tsx
│   ├── services/             # Servicios y APIs
│   │   ├── geminiService.ts
│   │   ├── rolePromptService.ts
│   │   └── urlReaderService.ts
│   ├── types.ts              # Definiciones de tipos
│   ├── App.tsx               # Componente principal
│   └── index.tsx             # Punto de entrada
├── package.json              # Dependencias y scripts
├── tsconfig.json             # Configuración TypeScript
├── vite.config.ts            # Configuración Vite
├── .env.local                # Variables de entorno (local)
└── README.md                 # Documentación del proyecto
```

## 🧩 Componentes Principales

### App.tsx
**Componente raíz** que maneja:
- Estado global de la aplicación
- Navegación entre vistas
- Gestión de formularios y datos
- Integración con servicios

### ProfileForm.tsx
**Formulario de entrada** que incluye:
- Campos para datos del perfil
- Validación de entrada
- Indicadores de rol y tipo de mensaje
- Integración con generación de mensajes

### RolePromptEditor.tsx
**Editor de prompts** que permite:
- Editar prompts por rol
- Cambiar entre LinkedIn y Email
- Persistencia en localStorage
- Validación de cambios

### GeneratedMessage.tsx
**Visualizador de mensajes** que incluye:
- Mostrar mensaje generado
- Contador de caracteres
- Botones de acción (copiar, marcar como enviado)
- Validación de longitud

### SentMessagesView.tsx
**Historial de mensajes** que proporciona:
- Lista de mensajes enviados
- Estadísticas de envío
- Funciones de búsqueda y filtrado
- Exportación a CSV

## 🔌 Servicios y APIs

### geminiService.ts
**Servicio principal de IA** que maneja:
- Conexión con Google Gemini AI
- Generación de mensajes personalizados
- Extracción de datos de perfiles
- Procesamiento de URLs
- Validación de respuestas

### rolePromptService.ts
**Gestión de prompts por rol** que incluye:
- Definición de prompts por rol
- Persistencia en localStorage
- Carga y guardado de personalizaciones
- Validación de datos

### urlReaderService.ts
**Procesamiento de URLs** que proporciona:
- Extracción de URLs de texto
- Validación de URLs
- Lectura de contenido web
- Resumen de contenido con IA

## ⚙️ Configuración y Variables de Entorno

### Variables Requeridas
```bash
# .env.local
GEMINI_API_KEY=tu_api_key_aqui
```

### Configuración de Vite
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
```

## 🔄 Flujo de Datos

### 1. Entrada de Datos
```
Usuario → Formulario → Validación → Estado Global
```

### 2. Procesamiento
```
Estado → Servicio Gemini → IA → Respuesta → UI
```

### 3. Persistencia
```
Datos → LocalStorage → Recuperación → Estado
```

### 4. Generación de Mensajes
```
Perfil + Rol + Tipo → Prompt Específico → IA → Mensaje Personalizado
```

## 🔒 Seguridad

### Medidas Implementadas
- **Validación de entrada**: Sanitización de datos del usuario
- **API Key segura**: Almacenamiento en variables de entorno
- **Validación de URLs**: Prevención de acceso a recursos locales
- **Sanitización de contenido**: Limpieza de datos antes del procesamiento

### Recomendaciones
- Usar HTTPS en producción
- Implementar rate limiting
- Validar todas las entradas del usuario
- Monitorear uso de API

## ⚡ Rendimiento

### Optimizaciones Implementadas
- **Lazy loading**: Componentes cargados bajo demanda
- **Memoización**: useCallback para funciones
- **Debouncing**: En búsquedas y validaciones
- **Compresión**: Build optimizado con Vite

### Métricas Objetivo
- **Tiempo de carga inicial**: < 3 segundos
- **Tiempo de generación**: < 10 segundos
- **Tamaño del bundle**: < 500KB
- **Lighthouse Score**: > 90

## 🔧 Mantenimiento

### Tareas Regulares
- **Actualización de dependencias**: Mensual
- **Revisión de logs**: Semanal
- **Backup de datos**: Diario
- **Monitoreo de rendimiento**: Continuo

### Monitoreo Recomendado
- **Uptime**: 99.9%
- **Tiempo de respuesta**: < 2 segundos
- **Uso de memoria**: < 512MB
- **Errores**: < 1%

## 📊 Métricas de Uso

### KPIs Principales
- **Mensajes generados por día**
- **Tasa de conversión por rol**
- **Tiempo promedio de generación**
- **Satisfacción del usuario**

### Logs Importantes
- **Generación de mensajes**
- **Errores de API**
- **Uso de prompts personalizados**
- **Acceso a URLs externas**

## 🚀 Próximos Pasos

### Mejoras Planificadas
1. **Autenticación de usuarios**
2. **Base de datos para persistencia**
3. **Analytics avanzados**
4. **Integración con CRM**
5. **Templates de mensajes**
6. **A/B testing de prompts**

### Escalabilidad
- **CDN para assets estáticos**
- **Load balancer para múltiples instancias**
- **Caché de respuestas de IA**
- **Queue system para procesamiento masivo**

