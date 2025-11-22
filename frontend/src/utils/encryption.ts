import CryptoJS from 'crypto-js';

/**
 * Encryption Utility
 * Cifra y descifra datos sensibles para almacenamiento seguro en localStorage
 * 
 * Usa AES-256 para encriptar los datos.
 */

/**
 * Clave de encriptación
 * Se intenta leer de variables de entorno, si no existe usa una por defecto (solo desarrollo)
 */
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'archivo_secure_2024_production_key_AES_256';

/**
 * Genera un hash para validar integridad
 */
function generateHash(data: string): string {
  return CryptoJS.SHA256(data).toString();
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
    const payload = JSON.stringify({
      data: jsonString,
      timestamp: Date.now(),
    });

    // Cifrar con AES
    const encrypted = CryptoJS.AES.encrypt(payload, ENCRYPTION_KEY).toString();

    // Generar hash del contenido cifrado para validar integridad
    const hash = generateHash(encrypted);

    // Retornar: hash|encrypted
    return `${hash}|${encrypted}`;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return '';
  }
}

/**
 * Descifra datos del almacenamiento
 * @param encryptedString - String cifrado
 * @returns Objeto descifrado o null si es inválido
 */
export function decryptData<T>(encryptedString: string): T | null {
  try {
    if (!encryptedString || !encryptedString.includes('|')) {
      return null;
    }

    const [hash, encrypted] = encryptedString.split('|');

    // Validar integridad
    if (generateHash(encrypted) !== hash) {
      console.warn('Data integrity check failed - possible tampering');
      return null;
    }

    // Descifrar
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      return null;
    }

    const { data, timestamp } = JSON.parse(decryptedString);

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

