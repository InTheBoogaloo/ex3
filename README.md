# SII ITC — Portal Estudiantil

Aplicación web en **Next.js 14** que consume la API REST del Sistema de Información Institucional del ITC Celaya.

---

## Contexto del proyecto

El proyecto está dividido en módulos, uno por equipo. Los módulos 1 y 2 ya están implementados (login y perfil del estudiante). Cada compañero agrega su módulo dentro de la carpeta `dashboard/`.

---

## Cómo correr el proyecto desde cero

### 1. Clona el repositorio

```bash
git clone <url-del-repo>
cd sii-itc
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Corre el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Te redirige automáticamente al login.

---

## Estructura del proyecto

```
sii-itc/
├── src/
│   ├── lib/
│   │   └── auth.js                         ← ⭐ Utilidades compartidas (TOKEN, fetch)
│   └── app/
│       ├── globals.css
│       ├── layout.jsx
│       ├── page.jsx                         ← Redirige a /login
│       ├── api/
│       │   └── proxy/
│       │       └── [...path]/
│       │           └── route.js             ← Proxy para evitar CORS con la API
│       ├── login/
│       │   ├── page.jsx                     ← Módulo 1: Login ✅
│       │   └── login.module.css
│       └── dashboard/
│           ├── layout.jsx                   ← Sidebar de navegación compartido ✅
│           ├── layout.module.css
│           ├── page.jsx                     ← Módulo 2: Perfil del estudiante ✅
│           ├── page.module.css
│           ├── calificaciones/
│           │   └── page.jsx                 ← Módulo 3: TU MÓDULO VA AQUÍ
│           ├── kardex/
│           │   └── page.jsx                 ← Módulo 4a: TU MÓDULO VA AQUÍ
│           └── horarios/
│               └── page.jsx                 ← Módulo 4b: TU MÓDULO VA AQUÍ
├── jsconfig.json
├── next.config.mjs
└── package.json
```

---

## ⭐ Lo más importante: auth.js

Este archivo es el estándar del equipo. **Todos los módulos deben importar desde aquí**, nunca manejar el token manualmente.

```js
import { authFetch, isAuthenticated, clearToken } from '@/lib/auth';
```

| Función | Qué hace |
|---|---|
| `authFetch('/movil/estudiante/calificaciones')` | GET autenticado a la API. Agrega el Bearer Token automáticamente. Si el token expiró, redirige al login. |
| `isAuthenticated()` | Retorna `true` si hay token válido, `false` si no existe o expiró. |
| `clearToken()` | Elimina el token (para logout). |

**El token se guarda en:** `localStorage` con la clave `sii_token`.

---

## Cómo agregar tu módulo (instrucciones para compañeros)

### Paso 1 — Crea tu archivo

Tu módulo ya tiene su carpeta creada. Solo abre el archivo correspondiente:

- Calificaciones → `src/app/dashboard/calificaciones/page.jsx`
- Kardex → `src/app/dashboard/kardex/page.jsx`
- Horarios → `src/app/dashboard/horarios/page.jsx`

### Paso 2 — Plantilla base

Copia y pega esto como punto de partida, luego edita a tu gusto:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch, isAuthenticated } from '@/lib/auth';

export default function CalificacionesPage() {  // cambia el nombre
  const router = useRouter();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Protege la ruta — no borres esto
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    // Cambia el endpoint según tu módulo:
    // /movil/estudiante/calificaciones
    // /movil/estudiante/kardex
    // /movil/estudiante/horarios
    authFetch('/movil/estudiante/calificaciones')
      .then(res => setData(res?.data || res?.message || res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#5a7090', padding: '2rem' }}>Cargando...</p>;
  if (error)   return <p style={{ color: '#f87171', padding: '2rem' }}>{error}</p>;

  return (
    <section style={{ padding: '2rem', color: '#e8eef8' }}>
      <h1>Calificaciones</h1>
      {/* Tu UI aquí */}
      <pre style={{ fontSize: '.75rem', color: '#5a7090' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}
```

> El `pre` con el JSON es para que veas la respuesta cruda de la API mientras desarrollas. Quítalo cuando termines.

### Paso 3 — El sidebar ya tiene tu ruta

No necesitas tocar el sidebar. Ya tiene los links a `/dashboard/calificaciones`, `/dashboard/kardex` y `/dashboard/horarios`. En cuanto crees tu `page.jsx` con un export default, aparece automáticamente.

---

## Por qué hay un proxy (`/api/proxy`)

La API del ITC (`sii.celaya.tecnm.mx`) no tiene los headers CORS configurados, lo que hace que el navegador bloquee las peticiones directas. El proxy en `src/app/api/proxy/[...path]/route.js` reenvía todas las llamadas desde el servidor de Next.js, donde no aplica la restricción de CORS.

**No necesitas tocar ese archivo.** `authFetch` ya lo usa internamente.

---

## Problemas comunes

| Error | Causa | Solución |
|---|---|---|
| `The default export is not a React Component` | El archivo está vacío | Pega el código en ese archivo |
| `Can't resolve '@/lib/auth'` | El alias `@/` no apunta a `src/` | En `jsconfig.json`, el paths debe ser `"@/*": ["./src/*"]` |
| `CORS blocked` | Estás llamando directo a la API desde el cliente | Usa siempre `authFetch`, nunca `fetch('https://sii.celaya...')` directamente |
| `404` en cualquier ruta | El archivo `page.jsx` de esa ruta está vacío | Agrega un componente con `export default` |

---

## Prompt para agente de IA

Si vas a usar un agente de IA (Claude, ChatGPT, Cursor, etc.) para generar tu módulo, dale este contexto:

---

> Estoy trabajando en un proyecto Next.js 14 con App Router y CSS Modules. No usamos TypeScript ni Tailwind.
>
> **Contexto del proyecto:**
> Es un portal estudiantil que consume la API REST de `https://sii.celaya.tecnm.mx/api`. Las llamadas a la API se hacen a través de un proxy interno en `/api/proxy` para evitar CORS.
>
> **Utilidad compartida de autenticación (`@/lib/auth`):**
> - `authFetch(endpoint)` — hace GET autenticado. Ejemplo: `authFetch('/movil/estudiante/calificaciones')`. Internamente llama a `/api/proxy${endpoint}` con el Bearer Token del localStorage.
> - `isAuthenticated()` — retorna true si hay token válido.
> - `clearToken()` — elimina el token.
>
> **Paleta de colores (CSS variables disponibles en todos los módulos):**
> - `--bg: #080c14` (fondo general)
> - `--surface: #0e1521` (tarjetas y paneles)
> - `--border: #1e2d45` (bordes)
> - `--accent: #1d6fea` (azul principal)
> - `--text: #e8eef8` (texto principal)
> - `--muted: #5a7090` (texto secundario)
>
> **Lo que necesito:**
> Genera el archivo `src/app/dashboard/[NOMBRE_MODULO]/page.jsx` y su correspondiente `page.module.css` para mostrar [DESCRIBE TU MÓDULO]. El componente debe:
> 1. Proteger la ruta con `isAuthenticated()`.
> 2. Usar `authFetch` para consumir el endpoint `[TU ENDPOINT]`.
> 3. Mostrar skeleton mientras carga.
> 4. Mostrar mensaje de error si falla.
> 5. Usar CSS Modules con la paleta de colores definida arriba.

---

Reemplaza `[NOMBRE_MODULO]`, `[DESCRIBE TU MÓDULO]` y `[TU ENDPOINT]` con los datos de tu módulo.

---

## API Reference rápida

| Endpoint | Método | Descripción |
|---|---|---|
| `/login` | POST | Login. Body: `{ email, password }` |
| `/movil/estudiante` | GET | Perfil del estudiante |
| `/movil/estudiante/calificaciones` | GET | Calificaciones del periodo actual |
| `/movil/estudiante/kardex` | GET | Historial académico completo |
| `/movil/estudiante/horarios` | GET | Horario del semestre actual |

Todos los GET van con `Authorization: Bearer <token>` — `authFetch` lo maneja automáticamente.