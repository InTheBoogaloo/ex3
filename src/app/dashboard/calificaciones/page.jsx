'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/auth';
import styles from './calificaciones.module.css';

// ── Skeleton ─────────────────────────────
function Skeleton({ w = '100%', h = '1rem' }) {
  return (
    <span
      className={styles.skeleton}
      style={{ width: w, height: h, display: 'inline-block' }}
    />
  );
}

// ── Materia Card ─────────────────────────
function MateriaCard({ materia, loading }) {
  const parciales = [1, 2, 3, 4];

  const getCal = (num) => {
    const c = materia.calificaiones?.find(
      (c) => c.numero_calificacion === num
    );
    return c?.calificacion ?? '—';
  };

  const getClass = (val) => {
    if (val === '—' || val === null) return styles.sinDato;
    const num = parseInt(val);
    return num >= 70 ? styles.aprobado : styles.reprobado;
  };

  const promedio = (califs) => {
    const nums = califs
      ?.map((c) => parseInt(c.calificacion))
      .filter((n) => !isNaN(n));
    if (!nums?.length) return null;
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  };

  const prom = promedio(materia.calificaiones);

  return (
    <div className={styles.materiaCard}>
      <div className={styles.materiaHeader}>
        {loading ? (
          <Skeleton w="180px" />
        ) : (
          <span className={styles.materiaNombre}>
            {materia.materia.nombre_materia}
          </span>
        )}

        {loading ? (
          <Skeleton w="120px" />
        ) : (
          <span className={styles.materiaClave}>
            {materia.materia.clave_materia} · {materia.materia.letra_grupo}
            {prom && <> · prom: {prom}</>}
          </span>
        )}
      </div>

      <div className={styles.calificaciones}>
        {parciales.map((p) => {
          const val = getCal(p);
          return (
            <div key={p} className={styles.calItem}>
              <span className={styles.calLabel}>P{p}</span>
              {loading ? (
                <Skeleton w="28px" h="0.85rem" />
              ) : (
                <span className={`${styles.calValue} ${getClass(val)}`}>
                  {val}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Periodo ──────────────────────────────
function PeriodoBlock({ periodo, loading }) {
  return (
    <div className={styles.periodo}>
      <div className={styles.periodoHeader}>
        {loading ? (
          <Skeleton w="200px" />
        ) : (
          <h3>{periodo.periodo.descripcion_periodo}</h3>
        )}

        {loading ? (
          <Skeleton w="60px" />
        ) : (
          <span>{periodo.periodo.clave_periodo}</span>
        )}
      </div>

      <div className={styles.materiasList}>
        {periodo.materias.map((m, i) => (
          <MateriaCard key={i} materia={m} loading={loading} />
        ))}
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────
export default function CalificacionesPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    authFetch('/movil/estudiante/calificaciones')
      .then((res) => setData(res?.data || res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Calificaciones</h1>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <Skeleton w="100%" h="120px" />
      ) : (
        data.map((p, i) => (
          <PeriodoBlock key={i} periodo={p} loading={loading} />
        ))
      )}
    </section>
  );
}