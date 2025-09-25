/**
 * Servicio para leer contenido de URLs y extraer información relevante
 */

export interface UrlContent {
  title: string;
  content: string;
  summary: string;
  url: string;
  success: boolean;
  error?: string;
}

/**
 * Valida si una URL es válida y segura
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Solo permitir HTTP y HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    // Verificar que no sea localhost o IP privada (por seguridad)
    if (urlObj.hostname === 'localhost' || 
        urlObj.hostname.startsWith('127.') ||
        urlObj.hostname.startsWith('192.168.') ||
        urlObj.hostname.startsWith('10.') ||
        urlObj.hostname.startsWith('172.')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Extrae URLs del texto usando regex
 */
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  return urls.filter(url => isValidUrl(url));
};

/**
 * Lee el contenido de una URL usando un proxy CORS
 * Nota: En producción, esto debería usar un backend para evitar problemas de CORS
 */
export const readUrlContent = async (url: string): Promise<UrlContent> => {
  try {
    // Usar un proxy CORS público (en producción usar tu propio backend)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Error al leer la URL: ${response.status}`);
    }

    const data = await response.json();
    const htmlContent = data.contents;
    
    // Extraer título y contenido del HTML
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Sin título';
    
    // Remover scripts, styles y otros elementos no deseados
    const cleanContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limitar el contenido a los primeros 2000 caracteres
    const limitedContent = cleanContent.substring(0, 2000);
    
    // Crear un resumen básico
    const summary = limitedContent.substring(0, 300) + (cleanContent.length > 300 ? '...' : '');
    
    return {
      title,
      content: limitedContent,
      summary,
      url,
      success: true
    };
  } catch (error) {
    console.error('Error reading URL content:', error);
    return {
      title: '',
      content: '',
      summary: '',
      url,
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Procesa múltiples URLs y devuelve el contenido combinado
 */
export const processUrls = async (urls: string[]): Promise<UrlContent[]> => {
  const results = await Promise.allSettled(
    urls.map(url => readUrlContent(url))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        title: '',
        content: '',
        summary: '',
        url: urls[index],
        success: false,
        error: result.reason?.message || 'Error al procesar URL'
      };
    }
  });
};

