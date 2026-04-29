'use client';

import { useState, useEffect, useRef } from 'react';
import { authFetch } from '@/lib/auth';
import styles from './page.module.css';

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

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
function Skeleton({ w = '100%', h = '1rem' }) {
  return <span className={styles.skeleton} style={{ width: w, height: h }} />;
}

/* ─── InfoCard with glitch ───────────────────────────────────────────────────── */
function InfoCard({ label, value, icon, loading }) {
  const [hovered, setHovered] = useState(false);
  const glitchedLabel = useGlitch(label, hovered);
  const glitchedValue = useGlitch(value ?? '—', hovered);

  return (
    <div
      className={`${styles.card} ${hovered ? styles.cardHovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardBody}>
        <span className={styles.cardLabel}>{glitchedLabel}</span>
        {loading
          ? <Skeleton w="120px" h=".85rem" />
          : <span className={styles.cardValue}>{glitchedValue}</span>
        }
      </div>
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const Icons = {
  user: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  id:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  mail: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  book: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  map:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  cal:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="1"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

/* ─── Hero con glitch ────────────────────────────────────────────────────────── */
function GlitchHero({ student, loading }) {
  const [hovered, setHovered] = useState(false);
    const name     = student?.persona || 'Estudiante';
    const id       = student?.numero_control || '';
    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();


  const glitchedName     = useGlitch(name, hovered);
  const glitchedId       = useGlitch(id ? `→ ${id}` : '→ --', hovered);
  const glitchedInitials = useGlitch(initials, hovered);

  return (
    <div
      className={`${styles.hero} ${hovered ? styles.heroHovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.avatar}>
        {loading ? <Skeleton w="38px" h="1.1rem" /> : glitchedInitials}
      </div>
      <div className={styles.heroInfo}>
        {loading
          ? <><Skeleton w="200px" h=".9rem" /><br /><Skeleton w="120px" h=".7rem" /></>
          : <>
              <h2 className={styles.studentName}>{glitchedName}</h2>
              <span className={styles.studentId}>{glitchedId}</span>
            </>
        }
      </div>
      <div className={styles.statusBadge}>
        {loading
          ? <Skeleton w="72px" h="1.6rem" />
          : <span className={styles.badge}>[activo]</span>
        }
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    authFetch('/movil/estudiante')
      .then(data => setStudent(data?.data || data?.message || data))
      .catch(err  => setError(err.message))
      .finally(()  => setLoading(false));
  }, []);

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <span className={styles.pageTitleAscii}>+-- perfil --+</span>
        <h1 className={styles.pageTitle}>| Mi Perfil |</h1>
        <p className={styles.pageSubtitle}>→ información académica personal</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          ! {error}
        </div>
      )}

      <GlitchHero student={student} loading={loading} />

      <div className={styles.grid}>
<InfoCard label="Nombre completo"     loading={loading} icon={Icons.user} value={student?.persona} />
<InfoCard label="No. de control"      loading={loading} icon={Icons.id}   value={student?.numero_control} />
<InfoCard label="Correo"              loading={loading} icon={Icons.mail}  value={student?.email} />
<InfoCard label="Créditos acumulados" loading={loading} icon={Icons.book}  value={student?.creditos_acumulados} />
<InfoCard label="Promedio ponderado"  loading={loading} icon={Icons.map}   value={student?.promedio_ponderado ? parseFloat(student.promedio_ponderado).toFixed(2) : '—'} />
<InfoCard label="Semestre" loading={loading} icon={Icons.cal} value={student?.semestre ? 'Semestre ' + student.semestre : '—'} />
      </div>
    </section>
  );
}
