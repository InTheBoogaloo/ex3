'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch, isAuthenticated } from '@/lib/auth';
import styles from './kardex.module.css';

// ── Skeleton ─────────────────────────────
function Skeleton({ w = '100%', h = '1rem' }) {
  return (
    <span
      className={styles.skeleton}
      style={{ width: w, height: h }}
    />
  );
}

// ── Utils ───────────────────────────────
const agruparPorSemestre = (kardex) => {
  const grupos = {};

  kardex.forEach(m => {
    if (!grupos[m.semestre]) grupos[m.semestre] = [];
    grupos[m.semestre].push(m);
  });

  return grupos;
};

const promedioGeneral = (kardex) => {
  const nums = kardex
    .map(m => parseFloat(m.calificacion))
    .filter(n => !isNaN(n));

  if (!nums.length) return null;

  return (nums.reduce((a, b) => a + b, 0) / nums.length);
};

const promedioSemestre = (materias) => {
  const nums = materias
    .map(m => parseFloat(m.calificacion))
    .filter(n => !isNaN(n));

  if (!nums.length) return null;

  return (nums.reduce((a, b) => a + b, 0) / nums.length);
};

const getClass = (val) => {
  const num = parseInt(val);
  if (isNaN(num)) return styles.sinDato;
  return num >= 70 ? styles.aprobado : styles.reprobado;
};

// ── Materia Row ─────────────────────────
function MateriaRow({ m }) {
  return (
    <div className={styles.materiaRow}>
      <div>
        <span className={styles.nombre}>{m.nombre_materia}</span>
        <span className={styles.clave}>
          {m.clave_materia} • {m.periodo}
        </span>
      </div>

      <div className={styles.right}>
        <span className={styles.creditos}>{m.creditos} cr</span>

        <span className={`${styles.calificacion} ${getClass(m.calificacion)}`}>
          {m.calificacion}
        </span>
      </div>
    </div>
  );
}

// ── Semestre Block ──────────────────────
function SemestreBlock({ semestre, materias }) {
  const prom = promedioSemestre(materias);

  return (
    <div className={styles.semestre}>
      <div className={styles.semestreHeader}>
        <h3>Semestre {semestre}</h3>

        {prom && (
          <span className={`${styles.prom} ${getClass(prom)}`}>
            {prom.toFixed(1)}
          </span>
        )}
      </div>

      <div>
        {materias.map((m, i) => (
          <MateriaRow key={i} m={m} />
        ))}
      </div>
    </div>
  );
}

// ── Página ──────────────────────────────
export default function KardexPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    authFetch('/movil/estudiante/kardex')
      .then(res => setData(res?.data || res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className={styles.page}>
        <Skeleton h="40px" w="200px" />
      </section>
    );
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  const grupos = agruparPorSemestre(data.kardex);
  const promGeneral = promedioGeneral(data.kardex);

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Kardex</h1>

      {/* ── Resumen ── */}
      <div className={styles.resumen}>
        <div>
          <span className={styles.label}>Avance</span>
          <span className={styles.value}>
            {data.porcentaje_avance.toFixed(2)}%
          </span>
        </div>

        {promGeneral && (
          <div>
            <span className={styles.label}>Promedio</span>
            <span className={`${styles.value} ${getClass(promGeneral)}`}>
              {promGeneral.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* ── Barra de progreso ── */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${data.porcentaje_avance}%` }}
        />
      </div>

      {/* ── Semestres ── */}
      {Object.entries(grupos).map(([sem, materias]) => (
        <SemestreBlock key={sem} semestre={sem} materias={materias} />
      ))}
    </section>
  );
}