'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import styles from './page.module.css';

const CATEGORIAS = ['Todas', 'Exámenes', 'Becas', 'Eventos', 'Avisos'];

const PRIORIDAD_CONFIG = {
  alta:  { label: 'Urgente', className: 'alta' },
  media: { label: 'Normal',  className: 'media' },
  baja:  { label: 'Info',    className: 'baja' },
};

const CATEGORIA_ICON = {
  Exámenes: '📋',
  Becas:    '🎓',
  Eventos:  '📅',
  Avisos:   '📢',
};

// Caracteres ASCII para el efecto glitch
const GLITCH_CHARS = '#:.|->_+=[]{}!?';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Hook de efecto glitch: revela texto char a char con ruido ASCII
function useGlitch(text, active) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!active) { setDisplay(text); return; }

    let frame = 0;
    const totalFrames = 12;

    function step() {
      frame++;
      const progress = frame / totalFrames;
      const resolved = Math.floor(progress * text.length);

      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < resolved) return char;
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join('')
      );

      if (frame < totalFrames) {
        frameRef.current = setTimeout(step, 30);
      } else {
        setDisplay(text);
      }
    }

    frameRef.current = setTimeout(step, 0);
    return () => clearTimeout(frameRef.current);
  }, [active, text]);

  return display;
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonBadge} />
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLineShort} />
    </div>
  );
}

function AvisoCard({ aviso, expandido, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const prio    = PRIORIDAD_CONFIG[aviso.prioridad] || PRIORIDAD_CONFIG.baja;
  const glitched = useGlitch(aviso.titulo, hovered && !expandido);

  return (
    <article
      className={`${styles.card} ${expandido ? styles.cardExpanded : ''} ${styles['card_' + aviso.prioridad]}`}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.cardTop}>
        <span className={styles.catIcon}>{CATEGORIA_ICON[aviso.categoria] || '📌'}</span>
        <div className={styles.cardMeta}>
          <span className={styles.catLabel}>{aviso.categoria}</span>
          <span className={`${styles.prioBadge} ${styles[prio.className]}`}>{prio.label}</span>
        </div>
        <span className={styles.chevron}>{expandido ? '▲' : '▼'}</span>
      </div>

      <h3 className={styles.cardTitle}>{glitched}</h3>

      <p className={`${styles.cardBody} ${expandido ? styles.cardBodyExpanded : ''}`}>
        {aviso.cuerpo}
      </p>
      <time className={styles.cardDate}>{formatDate(aviso.fecha)}</time>
    </article>
  );
}

export default function AvisosPage() {
  const router = useRouter();
  const [avisos, setAvisos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [busqueda, setBusqueda]   = useState('');
  const [expandido, setExpandido] = useState(null);

  const fetchAvisos = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/avisos');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Error al cargar avisos');
      setAvisos(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    fetchAvisos();
  }, [router, fetchAvisos]);

  const filtrados = avisos.filter((a) => {
    const matchCat = categoria === 'Todas' || a.categoria === categoria;
    const q = busqueda.toLowerCase();
    const matchQ = !q || a.titulo.toLowerCase().includes(q) || a.cuerpo.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const urgentes = filtrados.filter((a) => a.prioridad === 'alta');
  const resto    = filtrados.filter((a) => a.prioridad !== 'alta');

  return (
    <section className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <span className={styles.titleAscii}>+---------------------------------+</span>
            <h1 className={styles.title}>| Tablón de Avisos |</h1>
            <p className={styles.subtitle}>→ comunicados del ITC Celaya</p>
          </div>
        </div>
        <a href="/avisos-admin" className={styles.adminBtn}>[admin]</a>
      </div>

      {/* Controles */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>{'>'}_</span>
          <input
            className={styles.search}
            type="text"
            placeholder="buscar aviso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className={styles.clearBtn} onClick={() => setBusqueda('')}>[x]</button>
          )}
        </div>
        <div className={styles.tabs}>
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              className={`${styles.tab} ${categoria === c ? styles.tabActive : ''}`}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          <span>! {error}</span>
          <button onClick={fetchAvisos} className={styles.retryBtn}>[reintentar]</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={styles.grid}>
          {[1,2,3,4].map((k) => <SkeletonCard key={k} />)}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && !error && filtrados.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>[ ]</span>
          <p>// sin resultados</p>
        </div>
      )}

      {/* Urgentes */}
      {!loading && urgentes.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={`${styles.dot} ${styles.dotAlta}`} />
            {'// urgentes'}
          </h2>
          <div className={styles.grid}>
            {urgentes.map((a) => (
              <AvisoCard
                key={a.id}
                aviso={a}
                expandido={expandido === a.id}
                onToggle={() => setExpandido(expandido === a.id ? null : a.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resto */}
      {!loading && resto.length > 0 && (
        <div className={styles.section}>
          {urgentes.length > 0 && (
            <h2 className={styles.sectionTitle}>
              <span className={`${styles.dot} ${styles.dotMedia}`} />
              {'// recientes'}
            </h2>
          )}
          <div className={styles.grid}>
            {resto.map((a) => (
              <AvisoCard
                key={a.id}
                aviso={a}
                expandido={expandido === a.id}
                onToggle={() => setExpandido(expandido === a.id ? null : a.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
