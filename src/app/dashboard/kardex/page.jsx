'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth';
import styles from './page.module.css';

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ w = '100%', h = '1rem', r = '6px' }) {
  return (
    <span
      className={styles.skeleton}
      style={{ width: w, height: h, borderRadius: r }}
    />
  );
}

// ── Tarjeta de dato ────────────────────────────────────────────
function InfoCard({ label, value, icon, loading }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardBody}>
        <span className={styles.cardLabel}>{label}</span>
        {loading
          ? <Skeleton w="120px" h=".9rem" />
          : <span className={styles.cardValue}>{value || '—'}</span>
        }
      </div>
    </div>
  );
}

// ── Íconos SVG ─────────────────────────────────────────────────
const Icons = {
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  id:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  map:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  cal:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    authFetch('/movil/estudiante')
      .then(data => {
        // La API puede devolver el objeto en distintas rutas
        const info = data?.data || data?.message || data;
        setStudent(info);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Avatar con iniciales
  const initials = student
    ? (student.nombre || student.name || 'U')
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <section className={styles.page}>
      {/* ── Encabezado ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi perfil</h1>
        <p className={styles.pageSubtitle}>
          Información académica personal
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className={styles.errorBanner}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Hero card ── */}
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {loading ? <Skeleton w="72px" h="72px" r="50%" /> : initials}
        </div>
        <div className={styles.heroInfo}>
          {loading
            ? <>
                <Skeleton w="220px" h="1.4rem" />
                <Skeleton w="140px" h=".85rem" />
              </>
            : <>
                <h2 className={styles.studentName}>
                  {student?.nombre || student?.name || 'Estudiante'}
                </h2>
                <span className={styles.studentId}>
                  {student?.numero_control || student?.matricula || student?.id || ''}
                </span>
              </>
          }
        </div>
        <div className={styles.statusBadge}>
          {loading
            ? <Skeleton w="80px" h="1.4rem" r="20px" />
            : <span className={styles.badge}>Activo</span>
          }
        </div>
      </div>

      {/* ── Grid de tarjetas ── */}
      <div className={styles.grid}>
        <InfoCard label="Nombre completo"  loading={loading} icon={Icons.user} value={student?.nombre || student?.name} />
        <InfoCard label="No. de control"   loading={loading} icon={Icons.id}   value={student?.numero_control || student?.matricula} />
        <InfoCard label="Correo"           loading={loading} icon={Icons.mail}  value={student?.email || student?.correo} />
        <InfoCard label="Carrera"          loading={loading} icon={Icons.book}  value={student?.carrera || student?.programa} />
        <InfoCard label="Campus"           loading={loading} icon={Icons.map}   value={student?.campus || 'Celaya'} />
        <InfoCard label="Semestre actual"  loading={loading} icon={Icons.cal}   value={student?.semestre ? `Semestre ${student.semestre}` : student?.periodo} />
      </div>

      {/* ── JSON crudo (debug, quitar en prod) ── */}
      {/* 
      {student && (
        <details style={{ marginTop: '2rem', color: '#5a7090', fontSize: '.75rem' }}>
          <summary>Respuesta cruda de la API</summary>
          <pre>{JSON.stringify(student, null, 2)}</pre>
        </details>
      )} 
      */}
    </section>
  );
}
