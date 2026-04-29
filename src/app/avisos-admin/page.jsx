'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';

const CATEGORIAS  = ['Avisos', 'Exámenes', 'Becas', 'Eventos'];
const PRIORIDADES = [
  { value: 'alta',  label: '! urgente' },
  { value: 'media', label: '~ normal'  },
  { value: 'baja',  label: '. info'    },
];

const ADMIN_PASSWORD_KEY = 'avisos_admin_session';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminAvisosPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [passInput, setPassInput]     = useState('');
  const [passError, setPassError]     = useState('');

  const [avisos, setAvisos]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetchErr, setFetchErr] = useState('');

  const [form, setForm]       = useState({ titulo: '', cuerpo: '', categoria: 'Avisos', prioridad: 'media' });
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState('');
  const [sendErr, setSendErr] = useState('');

  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
    if (saved) setAutenticado(true);
  }, []);

  const fetchAvisos = useCallback(async () => {
    setLoading(true); setFetchErr('');
    try {
      const res  = await fetch('/api/avisos');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setAvisos(json.data);
    } catch (e) {
      setFetchErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (autenticado) fetchAvisos(); }, [autenticado, fetchAvisos]);

  function handleLogin(e) {
    e.preventDefault();
    fetch('/api/avisos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passInput, titulo: '_test_', cuerpo: '_test_', categoria: 'Avisos', prioridad: 'baja' }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          fetch('/api/avisos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passInput, id: json.data.id }),
          });
          sessionStorage.setItem(ADMIN_PASSWORD_KEY, passInput);
          setAutenticado(true);
          setPassError('');
        } else {
          setPassError('! contraseña incorrecta');
        }
      })
      .catch(() => setPassError('! error de red'));
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAutenticado(false);
    setPassInput('');
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSendErr(''); setSendMsg('');
    if (!form.titulo.trim() || !form.cuerpo.trim()) {
      setSendErr('! título y cuerpo requeridos'); return;
    }
    setSending(true);
    try {
      const password = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
      const res  = await fetch('/api/avisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, password }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setSendMsg('→ aviso publicado');
      setForm({ titulo: '', cuerpo: '', categoria: 'Avisos', prioridad: 'media' });
      fetchAvisos();
    } catch (e) {
      setSendErr('! ' + e.message);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try {
      const password = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
      const res  = await fetch('/api/avisos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      fetchAvisos();
    } catch (e) {
      alert('! ' + e.message);
    } finally {
      setDeleting(null);
    }
  }

  // ── Login screen ─────────────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <span className={styles.loginAscii}>+---------------------------+</span>
          <span className={styles.loginAscii}>|   PANEL DE ADMIN          |</span>
          <span className={styles.loginAscii}>+---------------------------+</span>
          <br />
          <p className={styles.loginSub}>→ tablón de avisos — ITC Celaya</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              className={styles.loginInput}
              placeholder="_ contraseña"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              autoFocus
            />
            {passError && <p className={styles.loginErr}>{passError}</p>}
            <button type="submit" className={styles.loginBtn}>[entrar]</button>
          </form>
          <a href="/dashboard/avisos" className={styles.backLink}>← volver al tablón</a>
        </div>
      </div>
    );
  }

  // ── Admin panel ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.titleAscii}>+-- admin --+</span>
          <h1 className={styles.title}>Panel de Administración</h1>
          <p className={styles.subtitle}>→ gestión de avisos estudiantiles</p>
        </div>
        <div className={styles.headerActions}>
          <a href="/dashboard/avisos" className={styles.viewBtn}>[ver tablón →]</a>
          <button onClick={handleLogout} className={styles.logoutBtn}>[salir]</button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Formulario */}
        <aside className={styles.sidebar}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>// nuevo aviso</h2>
            <form onSubmit={handleCreate} className={styles.form}>
              <label className={styles.label}>título *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="ej: periodo de bajas voluntarias"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                maxLength={120}
              />

              <label className={styles.label}>cuerpo *</label>
              <textarea
                className={styles.textarea}
                placeholder="describe el aviso con todos los detalles..."
                value={form.cuerpo}
                onChange={(e) => setForm({ ...form, cuerpo: e.target.value })}
                rows={5}
                maxLength={800}
              />
              <span className={styles.charCount}>{form.cuerpo.length}/800</span>

              <label className={styles.label}>categoría</label>
              <select
                className={styles.select}
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              >
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>

              <label className={styles.label}>prioridad</label>
              <div className={styles.prioGroup}>
                {PRIORIDADES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`${styles.prioBtn} ${form.prioridad === p.value ? styles.prioBtnActive : ''} ${styles['prio_' + p.value]}`}
                    onClick={() => setForm({ ...form, prioridad: p.value })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {sendErr && <p className={styles.errMsg}>{sendErr}</p>}
              {sendMsg && <p className={styles.okMsg}>{sendMsg}</p>}

              <button type="submit" className={styles.submitBtn} disabled={sending}>
                {sending ? '// publicando...' : '[publicar aviso]'}
              </button>
            </form>
          </div>
        </aside>

        {/* Lista */}
        <main className={styles.main}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>// avisos activos ({avisos.length})</h2>
            <button onClick={fetchAvisos} className={styles.refreshBtn} disabled={loading}>
              {loading ? '...' : '[↻ actualizar]'}
            </button>
          </div>

          {fetchErr && <p className={styles.errMsg}>{fetchErr}</p>}
          {loading  && <p className={styles.muted}>// cargando...</p>}
          {!loading && avisos.length === 0 && <p className={styles.muted}>// sin avisos publicados</p>}

          <div className={styles.list}>
            {avisos.map((a) => (
              <div key={a.id} className={`${styles.listItem} ${styles['item_' + a.prioridad]}`}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTop}>
                    <span className={styles.itemCat}>{a.categoria}</span>
                    <span className={`${styles.itemPrio} ${styles[a.prioridad]}`}>{a.prioridad}</span>
                  </div>
                  <p className={styles.itemTitle}>{a.titulo}</p>
                  <p className={styles.itemBody}>{a.cuerpo}</p>
                  <time className={styles.itemDate}>{formatDate(a.fecha)}</time>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  title="eliminar"
                >
                  {deleting === a.id ? '...' : '[x]'}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
