import { GoogleGenAI, Type } from "@google/genai";
import { ProfileData, GeneratedMessageResponse, MessageType } from '../types';
import { extractUrls, processUrls } from './urlReaderService';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const messageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    shouldGenerate: {
      type: Type.BOOLEAN,
    },
    message: {
      type: Type.STRING,
    },
  },
  required: ['shouldGenerate', 'message'],
};

const profileDataSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    jobTitle: { type: Type.STRING },
    companyName: { type: Type.STRING },
    industry: { type: Type.STRING },
    activityOrAchievement: { type: Type.STRING, description: 'Summarize recent posts, comments, or company news found in the text.' },
    mutualConnection: { type: Type.STRING, description: 'Find the name of a mutual connection if mentioned.' },
    additionalContext: { type: Type.STRING, description: 'Any additional relevant context or information found.' },
    urls: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Any URLs found in the text.' },
  },
  required: ['name', 'jobTitle', 'companyName', 'industry', 'activityOrAchievement', 'mutualConnection'],
};



export const LINKEDIN_GENERATION_PROMPT = `
Actúa como un especialista en ventas B2B para Reteki, una empresa colombiana que ofrece suscripciones flexibles de dispositivos Apple para empresas. Tu tono debe ser profesional, directo y centrado en resolver problemas específicos del ICP de Reteki. El objetivo es iniciar una conversación genuina y personalizada en español, no vender agresivamente.

DATOS DEL PERFIL:
- Nombre: {{name}}
- Título: {{jobTitle}}
- Empresa: {{companyName}}
- Industria: {{industry}}
- Actividad Reciente / Logro de Empresa: {{activityOrAchievement}}
- Conexión en Común: {{mutualConnection}}
- Contexto Adicional: {{additionalContext}}
- URLs Relevantes: {{urls}}
- Cantidad de Palabras Deseada: {{wordCount}}

INFORMACIÓN DEL ICP DE RETEKI:
**Perfil de Cliente Ideal:**
- Empresas de 50-500 empleados (prioridad alta)
- Sectores: Tecnología, publicidad, educación, hotelería, salud, retail
- Ubicación: Colombia (Bogotá, Barranquilla, Cartagena, Cali, Medellín)
- Antigüedad: Mínimo 5 años de constitución

**Pain Points Principales:**
- Gestión de TI ineficiente/costosa que distrae del core business
- Necesidad de flexibilidad tecnológica (arrendamiento 12-84 meses)
- Problemas con soporte tecnológico actual (lentitud, deficiencia)
- Necesidad de capital para inversión en TI (prefieren OpEx vs CapEx)
- Necesidad de adaptabilidad tecnológica y soluciones integrales

**Tomadores de Decisión:**
- Director de TI: Más fácil de convencer, entiende beneficios del soporte
- Director Financiero: Enfocado en costos, ROI, flujo de caja
- Gerente de Compras: Relación costo-beneficio, condiciones contractuales
- CEO/Gerente General: Estrategia general, productividad, reducción de riesgos

REGLAS ESTRICTAS PARA GENERAR EL MENSAJE DE LINKEDIN:

**REGLA FUNDAMENTAL: SOLO USA INFORMACIÓN PROPORCIONADA Y ALINEADA CON ICP**
- NUNCA inventes, asumas o especules sobre información no proporcionada
- Si no hay suficiente información específica, usa solo lo que está disponible
- NO hagas suposiciones sobre la empresa, su tamaño, problemas o necesidades
- NO inventes estadísticas, datos o hechos no proporcionados
- SOLO genera mensaje si el perfil parece alineado con el ICP de Reteki

1.  **Gancho Personalizado (Hook):**
    a.  **Foco Principal: El Puesto y Pain Points.** Conecta con las responsabilidades del puesto ('{{jobTitle}}') y los pain points relevantes del ICP. Para roles de TI: gestión de equipos, soporte, flexibilidad. Para roles financieros: optimización de costos, OpEx vs CapEx. Para roles generales: productividad, core business.
    b.  **Contexto Adicional:** Usa SOLO la información proporcionada en "Actividad Reciente" o "Conexión en Común" si es relevante para el ICP.
    c.  **URLs:** Si hay URLs proporcionadas, usa SOLO la información extraída de esas fuentes.

2.  **Estructura del Mensaje (3 partes obligatorias):**
    a.  **Gancho (1-2 frases):** Comienza con una observación específica sobre el rol y su relación con los pain points del ICP. Ejemplo: "Hola {{name}}, como {{jobTitle}} en {{companyName}}, imagino que la gestión de equipos tecnológicos puede ser un desafío constante que distrae del core business."
    b.  **Propuesta de Valor (1 frase):** Conecta el pain point con la solución de Reteki. Ejemplo: "En Reteki ayudamos a empresas como {{companyName}} a externalizar la gestión de su tecnología Apple, con soporte inmediato y flexibilidad total."
    c.  **Llamada a la Acción (1 pregunta):** Pregunta específica relacionada con el pain point. Ejemplo: "¿Cómo gestionan actualmente el soporte y mantenimiento de sus equipos Apple?"

3.  **Tono y Estilo:**
    -   Breve (máximo 300 caracteres), directo y profesional
    -   Basado ÚNICAMENTE en información proporcionada y alineada con ICP
    -   Enfocado en pain points específicos del ICP de Reteki
    -   **PROHIBIDO** usar frases genéricas como: "Me gustaría conectar contigo", "Espero que estés bien", "Vi tu perfil y me impresionó"
    -   **PROHIBIDO** inventar información sobre la empresa o sus necesidades
    -   **CONTEO DE PALABRAS:** Si se especifica una cantidad de palabras deseada ({{wordCount}}), el mensaje debe tener aproximadamente esa cantidad de palabras (±5 palabras de tolerancia)

4.  **Generación Obligatoria:** SIEMPRE debes generar un mensaje. Esto significa que **siempre debes establecer el campo "shouldGenerate" en true** en la respuesta JSON, y el campo "message" debe contener el texto generado.

Responde ÚNICAMENTE con un objeto JSON que se ajuste al esquema proporcionado. No incluyas texto explicativo.
`;

export const EMAIL_GENERATION_PROMPT = `
Actúa como un especialista en ventas B2B para Reteki, una empresa colombiana que ofrece suscripciones flexibles de dispositivos Apple para empresas. Tu tono debe ser profesional, directo y centrado en resolver problemas específicos del ICP de Reteki. El objetivo es iniciar una conversación genuina y personalizada en español, no vender agresivamente.

DATOS DEL PERFIL:
- Nombre: {{name}}
- Título: {{jobTitle}}
- Empresa: {{companyName}}
- Industria: {{industry}}
- Actividad Reciente / Logro de Empresa: {{activityOrAchievement}}
- Conexión en Común: {{mutualConnection}}
- Contexto Adicional: {{additionalContext}}
- URLs Relevantes: {{urls}}
- Cantidad de Palabras Deseada: {{wordCount}}

INFORMACIÓN DEL ICP DE RETEKI:
**Perfil de Cliente Ideal:**
- Empresas de 50-500 empleados (prioridad alta)
- Sectores: Tecnología, publicidad, educación, hotelería, salud, retail
- Ubicación: Colombia (Bogotá, Barranquilla, Cartagena, Cali, Medellín)
- Antigüedad: Mínimo 5 años de constitución

**Pain Points Principales:**
- Gestión de TI ineficiente/costosa que distrae del core business
- Necesidad de flexibilidad tecnológica (arrendamiento 12-84 meses)
- Problemas con soporte tecnológico actual (lentitud, deficiencia)
- Necesidad de capital para inversión en TI (prefieren OpEx vs CapEx)
- Necesidad de adaptabilidad tecnológica y soluciones integrales

**Tomadores de Decisión:**
- Director de TI: Más fácil de convencer, entiende beneficios del soporte
- Director Financiero: Enfocado en costos, ROI, flujo de caja
- Gerente de Compras: Relación costo-beneficio, condiciones contractuales
- CEO/Gerente General: Estrategia general, productividad, reducción de riesgos

**Valores de Reteki:**
- 98% de satisfacción del cliente
- Soporte inmediato y proactivo
- Flexibilidad total (12-84 meses)
- Soluciones integrales (hardware + software + soporte)
- Modelo OpEx vs CapEx

REGLAS ESTRICTAS PARA GENERAR EL EMAIL:

**REGLA FUNDAMENTAL: SOLO USA INFORMACIÓN PROPORCIONADA Y ALINEADA CON ICP**
- NUNCA inventes, asumas o especules sobre información no proporcionada
- Si no hay suficiente información específica, usa solo lo que está disponible
- NO hagas suposiciones sobre la empresa, su tamaño, problemas o necesidades
- NO inventes estadísticas, datos o hechos no proporcionados
- SOLO genera mensaje si el perfil parece alineado con el ICP de Reteki

1.  **Asunto del Email:**
    - Debe ser directo y relacionado con el pain point del ICP según el rol
    - Máximo 50 caracteres
    - Ejemplos: "Gestión de equipos Apple - {{companyName}}", "Soporte tecnológico inmediato", "Flexibilidad en arrendamiento de equipos"

2.  **Estructura del Email (4 partes obligatorias):**
    a.  **Saludo Personalizado:** "Hola {{name}}," seguido de una observación específica sobre su rol y su relación con los pain points del ICP.
    b.  **Gancho Contextual (2-3 frases):** Conecta con el pain point específico del rol. Para TI: gestión de equipos, soporte, flexibilidad. Para Financiero: optimización de costos, OpEx vs CapEx. Para General: productividad, core business.
    c.  **Propuesta de Valor (2-3 frases):** Explica cómo Reteki resuelve el pain point específico, mencionando beneficios concretos: soporte inmediato, flexibilidad 12-84 meses, modelo OpEx, soluciones integrales.
    d.  **Llamada a la Acción (1-2 frases):** Invita a una conversación específica según el rol: demostración técnica (TI), análisis financiero (Financiero), reunión estratégica (General).

3.  **Tono y Estilo:**
    - Profesional pero conversacional
    - Máximo 1500 caracteres
    - Basado ÚNICAMENTE en información proporcionada y alineada con ICP
    - Enfocado en pain points específicos del ICP de Reteki
    - Evita jerga técnica excesiva
    - **PROHIBIDO** usar frases genéricas como: "Espero que estés bien", "Vi tu perfil y me impresionó"
    - **PROHIBIDO** inventar información sobre la empresa o sus necesidades
    - **CONTEO DE PALABRAS:** Si se especifica una cantidad de palabras deseada ({{wordCount}}), el mensaje debe tener aproximadamente esa cantidad de palabras (±10 palabras de tolerancia)

4.  **Generación Obligatoria:** SIEMPRE debes generar un mensaje. Esto significa que **siempre debes establecer el campo "shouldGenerate" en true** en la respuesta JSON, y el campo "message" debe contener el texto generado.

Responde ÚNICAMENTE con un objeto JSON que se ajuste al esquema proporcionado. No incluyas texto explicativo.
`;

export const DEFAULT_GENERATION_PROMPT = LINKEDIN_GENERATION_PROMPT;


function buildExtractionPrompt(text: string): string {
    return `
    Analiza el siguiente texto, que es el contenido de un perfil de LinkedIn. Tu tarea es extraer la siguiente información y devolverla en un formato JSON estricto, evaluando si el perfil se alinea con el ICP de Reteki.

    TEXTO DEL PERFIL:
    ---
    ${text}
    ---

    ICP DE RETEKI (para validación):
    - Empresas de 50-500 empleados (prioridad alta)
    - Sectores: Tecnología, publicidad, educación, hotelería, salud, retail
    - Ubicación: Colombia (Bogotá, Barranquilla, Cartagena, Cali, Medellín)
    - Antigüedad: Mínimo 5 años de constitución
    - Roles: Director de TI, Director Financiero, Gerente de Compras, CEO/Gerente General

    REGLAS DE EXTRACCIÓN:
    1.  **Nombre Completo:** Extrae el nombre completo de la persona.
    2.  **Título del Puesto y Empresa:** Extrae el título del puesto actual y el nombre de la empresa actual.
    3.  **Industria:** Infiere la industria de la empresa o del perfil.
    4.  **Actividad Reciente o Logro:** Busca en la sección "Actividad" o en el texto general cualquier post, artículo compartido o comentario reciente. Si no hay, busca noticias sobre la empresa (ej. "Acme Corp announced..."). Resume el hallazgo más relevante en una frase. Si no encuentras nada, deja el campo vacío.
    5.  **Conexión en Común:** Busca si se menciona una conexión en común (ej. "Shared connection: Juan Pérez"). Si no se menciona, deja el campo vacío.
    6.  **Contexto Adicional:** Cualquier información adicional relevante que pueda ser útil para personalizar el mensaje, especialmente relacionada con pain points del ICP (gestión de TI, soporte tecnológico, flexibilidad, costos).
    7.  **URLs:** Extrae todas las URLs que encuentres en el texto (artículos, posts, perfiles, etc.).

    VALIDACIÓN DE ICP:
    - Evalúa si el perfil parece alineado con el ICP de Reteki
    - Si no hay información suficiente para determinar el alineamiento, incluye el perfil de todas formas
    - Prioriza perfiles que mencionen gestión de TI, tecnología, soporte, flexibilidad, costos

    Si no puedes encontrar un dato específico, devuelve una cadena vacía "" para ese campo en el JSON. Responde ÚNICAMENTE con el objeto JSON.
    `;
}


export const generateLinkedInMessage = async (data: ProfileData, promptTemplate: string, messageType: MessageType = 'linkedin'): Promise<GeneratedMessageResponse> => {
  
  // Procesar URLs si están disponibles
  let urlContent = '';
  if (data.urls && data.urls.length > 0) {
    try {
      const urlResults = await processUrls(data.urls);
      const successfulUrls = urlResults.filter(result => result.success);
      if (successfulUrls.length > 0) {
        urlContent = successfulUrls.map(result => 
          `URL: ${result.url}\nTítulo: ${result.title}\nResumen: ${result.summary}`
        ).join('\n\n');
      }
    } catch (error) {
      console.error('Error processing URLs:', error);
    }
  }

  // Extraer URLs del contexto adicional si existe
  let additionalUrls: string[] = [];
  if (data.additionalContext) {
    additionalUrls = extractUrls(data.additionalContext);
  }

  // Procesar URLs adicionales
  if (additionalUrls.length > 0) {
    try {
      const additionalUrlResults = await processUrls(additionalUrls);
      const successfulAdditionalUrls = additionalUrlResults.filter(result => result.success);
      if (successfulAdditionalUrls.length > 0) {
        const additionalUrlContent = successfulAdditionalUrls.map(result => 
          `URL: ${result.url}\nTítulo: ${result.title}\nResumen: ${result.summary}`
        ).join('\n\n');
        urlContent = urlContent ? `${urlContent}\n\n${additionalUrlContent}` : additionalUrlContent;
      }
    } catch (error) {
      console.error('Error processing additional URLs:', error);
    }
  }

  let prompt = promptTemplate;
  const placeholders: (keyof ProfileData)[] = ['name', 'jobTitle', 'companyName', 'industry', 'activityOrAchievement', 'mutualConnection', 'additionalContext', 'wordCount'];
  
  placeholders.forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, data[key] || 'N/A');
  });

  // Reemplazar el placeholder de URLs
  prompt = prompt.replace(/{{urls}}/g, urlContent || 'N/A');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: messageResponseSchema,
      temperature: 0.3, // Reducir temperatura para mayor consistencia
    },
  });

  const jsonText = response.text;
  
  try {
    const parsedResponse = JSON.parse(jsonText) as GeneratedMessageResponse;
    if (typeof parsedResponse.shouldGenerate === 'boolean' && typeof parsedResponse.message === 'string') {
        return parsedResponse;
    }
    throw new Error('Invalid JSON structure from API');
  } catch (e) {
      console.error('Failed to parse Gemini response:', jsonText);
      throw new Error('La respuesta de la IA no tuvo el formato esperado.');
  }
};

export const getPromptForMessageType = (messageType: MessageType): string => {
  return messageType === 'email' ? EMAIL_GENERATION_PROMPT : LINKEDIN_GENERATION_PROMPT;
};

export const extractProfileDataFromText = async (text: string): Promise<ProfileData> => {
    const prompt = buildExtractionPrompt(text);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: profileDataSchema,
            temperature: 0.2,
        },
    });

    const jsonText = response.text;

    try {
        const parsedResponse = JSON.parse(jsonText) as ProfileData;
        if (typeof parsedResponse.name === 'string' && typeof parsedResponse.jobTitle === 'string') {
            return parsedResponse;
        }
        throw new Error('Invalid JSON structure from API for extraction');
    } catch (e) {
        console.error('Failed to parse Gemini extraction response:', jsonText);
        throw new Error('La respuesta de la IA no tuvo el formato esperado para la extracción.');
    }
};
