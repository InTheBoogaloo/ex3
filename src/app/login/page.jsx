'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveToken, isAuthenticated, API_BASE } from '@/lib/auth';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Si ya está autenticado, ir directo al dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    // Validación de campos vacíos
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.flag !== 'success') {
        setError(data.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
        return;
      }

      // Extraer token de la respuesta
      const token = data.message?.login?.token;
      if (!token) {
        setError('Error al obtener el token. Intenta de nuevo.');
        return;
      }

      saveToken(token);
      router.replace('/dashboard');

    } catch (err) {
      if (err.message.includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        setError('Ocurrió un error inesperado. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      {/* Fondo con grid animado */}
      <div className={styles.bg}>
        <div className={styles.grid} />
        <div className={styles.glow} />
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="var(--accent)" />
              <path d="M10 18h16M18 10v16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="5" stroke="#fff" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h1 className={styles.title}>SII ITC</h1>
          <p className={styles.subtitle}>Sistema de Información Institucional</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Correo institucional
            </label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="numero@celaya.tecnm.mx"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Contraseña
            </label>
            <div className={styles.inputWrap}>
              <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error} role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Instituto Tecnológico de Celaya · TecNM
        </p>
      </div>
    </main>
  );
}
