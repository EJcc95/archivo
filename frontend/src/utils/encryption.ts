/**
 * Encryption Utility
 * Cifra y descifra datos sensibles para almacenamiento seguro en localStorage
 * 
 * Nota: Esta es una solución temporal. La solución más segura es usar HttpOnly Cookies en el backend.
 */

/**
 * Clave de encriptación derivada de una clave maestra
 * En producción, esta clave debe:
 * 1. Generarse desde el servidor
 * 2. Almacenarse de forma segura (no en código)
 * 3. Usarse con un algoritmo de encriptación robusto (AES-256)
 * 
 * Para esta versión simple, usamos una clave estática pero esto debe mejorar
 */
const ENCRYPTION_KEY = 'archivo_secure_2024_production_key';

/**
 * Codifica una cadena usando Base64 simple
 * NOTA: Base64 no es encriptación, solo ofuscación
 * Para mayor seguridad, implementar AES-256 con crypto-js
 */
function encodeBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error('Error encoding string:', error);
    return str;
  }
}

/**
 * Decodifica una cadena Base64
 */
function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.error('Error decoding string:', error);
    return str;
  }
}

/**
 * Genera un hash simple para validar integridad
 */
function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Cifra datos para almacenamiento seguro
 * @param data - Objeto a cifrar
 * @returns String cifrado
 */
export function encryptData<T>(data: T): string {
  try {
    const jsonString = JSON.stringify(data);
    // Agregar timestamp para validar antigüedad
    const withTimestamp = JSON.stringify({
      data: jsonString,
      timestamp: Date.now(),
    });
    
    // Codificar en Base64
    const encoded = encodeBase64(withTimestamp);
    
    // Agregar hash para validar integridad
    const hash = generateHash(encoded);
    
    // Retornar: hash|encoded
    return `${hash}|${encoded}`;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return '';
  }
}

/**
 * Descifra datos del almacenamiento
 * @param encrypted - String cifrado
 * @returns Objeto descifrado o null si es inválido
 */
export function decryptData<T>(encrypted: string): T | null {
  try {
    if (!encrypted || !encrypted.includes('|')) {
      return null;
    }

    const [hash, encoded] = encrypted.split('|');
    
    // Validar hash
    if (generateHash(encoded) !== hash) {
      console.warn('Data integrity check failed - possible tampering');
      return null;
    }

    // Decodificar
    const decoded = decodeBase64(encoded);
    const { data, timestamp } = JSON.parse(decoded);

    // Validar antigüedad (24 horas)
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    if (Date.now() - timestamp > maxAge) {
      console.warn('Stored data is too old');
      return null;
    }

    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
}

/**
 * Almacena datos cifrados en localStorage
 */
export function setSecureItem<T>(key: string, value: T): void {
  try {
    const encrypted = encryptData(value);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`Error setting secure item ${key}:`, error);
  }
}

/**
 * Recupera datos cifrados de localStorage
 */
export function getSecureItem<T>(key: string): T | null {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    return decryptData<T>(encrypted);
  } catch (error) {
    console.error(`Error getting secure item ${key}:`, error);
    return null;
  }
}

/**
 * Elimina un item de localStorage
 */
export function removeSecureItem(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Limpia todos los items sensibles
 */
export function clearSecureStorage(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}
