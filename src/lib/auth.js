// ============================================================
// auth.js — Utilidades de autenticación compartidas
// ESTÁNDAR DEL EQUIPO: todos los módulos usan estas funciones
// ============================================================

export const TOKEN_KEY = 'sii_token';
//export const API_BASE  = 'https://sii.celaya.tecnm.mx/api';
export const API_BASE = '/api/proxy';

/** Guarda el token JWT en localStorage */
export function saveToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/** Obtiene el token almacenado o null */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Elimina el token (logout) */
export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Verifica si hay un token válido (no expirado) */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    // Decodifica el payload del JWT sin verificar firma
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp está en segundos
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearToken(); // limpia el token expirado
      return false;
    }
    return true;
  } catch {
    return true; // si no tiene exp, asumir válido
  }
}1

/**
 * Fetch autenticado — úsalo en todos los módulos
 * Ejemplo: authFetch('/api/movil/estudiante/calificaciones')
 */
export async function authFetch(endpoint) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Token inválido o expirado');
  }

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}
