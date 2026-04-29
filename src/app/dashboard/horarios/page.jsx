'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/auth';
import styles from './horario.module.css';

// ── Config ──────────────────────────────
const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const horas = [
  '07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00'
];

// ── Utils ───────────────────────────────
const parseHora = (rango) => {
  if (!rango) return null;
  const [inicio, fin] = rango.split('-');
  return { inicio, fin };
};

const getColor = (nombre) => {
  const colors = [
    '#22c55e', '#3b82f6', '#a855f7',
    '#f59e0b', '#ef4444', '#14b8a6'
  ];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// ── Bloque clase ────────────────────────
function Clase({ materia, dia }) {
  const rango = parseHora(materia[dia]);
  if (!rango) return null;

  const startIndex = horas.indexOf(rango.inicio);
  const endIndex   = horas.indexOf(rango.fin);

  if (startIndex === -1 || endIndex === -1) return null;

  const top = startIndex * 60;
  const height = (endIndex - startIndex) * 60;

  const color = getColor(materia.nombre_materia);

  return (
    <div
      className={styles.clase}
      style={{
        top,
        height,
        background: color + '22',
        borderLeft: `3px solid ${color}`
      }}
    >
      <span className={styles.nombre}>
        {materia.nombre_materia}
      </span>
      <span className={styles.salon}>
        {materia[`${dia}_clave_salon`]}
      </span>
      <span className={styles.hora}>
        {materia[dia]}
      </span>
    </div>
  );
}

// ── Página ──────────────────────────────
export default function HorarioPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    authFetch('/movil/estudiante/horarios')
      .then(res => setData(res?.data || res))
  }, []);

  if (!data) return <p className={styles.loading}>Cargando horario...</p>;

  const periodo = data[0];

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Horario</h1>

      <span className={styles.subtitle}>
        {periodo.periodo.descripcion_periodo}
      </span>

      <div className={styles.grid}>
        
        {/* Columna horas */}
        <div className={styles.horas}>
          {horas.map(h => (
            <div key={h} className={styles.horaLabel}>{h}</div>
          ))}
        </div>

        {/* Días */}
        {dias.map(dia => (
          <div key={dia} className={styles.columna}>
            <div className={styles.diaTitle}>
              {dia.toUpperCase()}
            </div>

            <div className={styles.dayBody}>
              {horas.map((_, i) => (
                <div key={i} className={styles.slot} />
              ))}

              {periodo.horario.map((m, i) => (
                <Clase key={i} materia={m} dia={dia} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}