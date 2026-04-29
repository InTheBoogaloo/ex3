'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveToken, isAuthenticated, API_BASE } from '@/lib/auth';
import styles from './login.module.css';

/* ─── Glitch hook ────────────────────────────────────────────────────────────── */
const GLITCH_CHARS = '#:.|-_+=[]{}!?><~';

function useGlitch(text, active) {
  const [display, setDisplay] = useState(text ?? '');
  const frameRef = useRef(null);

  useEffect(() => {
    const str = text ?? '';
    if (!active) { setDisplay(str); return; }

    let frame = 0;
    const totalFrames = 14;

    function step() {
      frame++;
      const progress = frame / totalFrames;
      const resolved = Math.floor(progress * str.length);
      setDisplay(
        str.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (i < resolved) return char;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('')
      );
      if (frame < totalFrames) {
        frameRef.current = setTimeout(step, 28);
      } else {
        setDisplay(str);
      }
    }

    frameRef.current = setTimeout(step, 0);
    return () => clearTimeout(frameRef.current);
  }, [active, text]);

  return display;
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [titleHover, setTitleHover] = useState(false);

  const glitchedTitle    = useGlitch('SII ITC', titleHover);
  const glitchedSubtitle = useGlitch('Sistema de Información Institucional', titleHover);

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || data.flag !== 'success') {
        setError(data.message || 'Credenciales incorrectas.');
        return;
      }

      const token = data.message?.login?.token;
      if (!token) { setError('Error al obtener el token. Intenta de nuevo.'); return; }

      saveToken(token);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message.includes('fetch')
        ? 'No se pudo conectar con el servidor.'
        : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      {/* ASCII background grid */}
      <div className={styles.bgGrid} aria-hidden="true" />

      <div className={styles.card}>
        {/* Corner decorations */}
        <span className={styles.corner} data-pos="tl">+</span>
        <span className={styles.corner} data-pos="tr">+</span>
        <span className={styles.corner} data-pos="bl">+</span>
        <span className={styles.corner} data-pos="br">+</span>

        {/* Header */}
        <div
          className={styles.header}
          onMouseEnter={() => setTitleHover(true)}
          onMouseLeave={() => setTitleHover(false)}
        >
          <span className={styles.headerAscii}>+-----------+</span>
          <h1 className={styles.title}>{glitchedTitle}</h1>
          <span className={styles.headerAscii}>+-----------+</span>
          <p className={styles.subtitle}>→ {glitchedSubtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className={styles.form} noValidate>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              // correo institucional
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>&gt;_</span>
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
              // contraseña
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>&gt;_</span>
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

          {error && (
            <div className={styles.error} role="alert">
              ! {error}
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading
              ? <span className={styles.loadingDots}><span /><span /><span /></span>
              : '[ iniciar sesión ]'
            }
          </button>
        </form>

        <p className={styles.footer}>
          → Instituto Tecnológico de Celaya · TecNM
        </p>
      </div>
    </main>
  );
}
