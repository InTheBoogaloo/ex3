/**
 * API Route: /api/avisos
 * Backend de administración para el Tablón de Avisos.
 * Almacenamiento en memoria (se reinicia con el servidor).
 * En producción se reemplazaría por una DB real.
 */

// ─── Store en memoria ────────────────────────────────────────────────────────
let avisos = [
  {
    id: 1,
    titulo: 'Inicio de periodo de extraordinarios',
    cuerpo: 'Los exámenes extraordinarios del semestre enero-junio 2025 se llevarán a cabo del 23 al 27 de junio. Consulta tu horario en la página de control escolar.',
    categoria: 'Exámenes',
    prioridad: 'alta',
    fecha: '2025-06-10T09:00:00.000Z',
  },
  {
    id: 2,
    titulo: 'Convocatoria — Beca Excelencia Académica',
    cuerpo: 'Se abre la convocatoria para la Beca de Excelencia Académica 2025-2026. Requisito mínimo: promedio 9.0. Entrega de documentos del 1 al 15 de julio en la oficina de becas.',
    categoria: 'Becas',
    prioridad: 'alta',
    fecha: '2025-06-08T08:00:00.000Z',
  },
  {
    id: 3,
    titulo: 'Taller de Programación Competitiva — ICPC',
    cuerpo: 'El club de algoritmia abre inscripciones para el taller de preparación al ICPC. Cada sábado 10:00–13:00 en el Lab de Cómputo 3. Inscríbete con tu nombre y carrera al correo icpc@celaya.tecnm.mx.',
    categoria: 'Eventos',
    prioridad: 'media',
    fecha: '2025-06-05T10:00:00.000Z',
  },
  {
    id: 4,
    titulo: 'Mantenimiento al sistema SII — sábado 14 jun',
    cuerpo: 'El sistema SII estará fuera de servicio el sábado 14 de junio de 00:00 a 06:00 por mantenimiento programado. No podrás consultar calificaciones ni horarios en ese horario.',
    categoria: 'Avisos',
    prioridad: 'baja',
    fecha: '2025-06-04T16:00:00.000Z',
  },
];

let nextId = avisos.length + 1;

const ADMIN_PASSWORD = 'password'; // contraseña hardcodeada para el examen

// ─── Helpers ─────────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── GET /api/avisos ──────────────────────────────────────────────────────────
export async function GET() {
  const sorted = [...avisos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return json({ ok: true, data: sorted });
}

// ─── POST /api/avisos ─────────────────────────────────────────────────────────
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return json({ ok: false, error: 'Body inválido' }, 400);

  const { password, titulo, cuerpo, categoria, prioridad } = body;

  if (password !== ADMIN_PASSWORD)
    return json({ ok: false, error: 'Contraseña incorrecta' }, 401);

  if (!titulo?.trim() || !cuerpo?.trim())
    return json({ ok: false, error: 'Título y cuerpo son requeridos' }, 400);

  const aviso = {
    id: nextId++,
    titulo: titulo.trim(),
    cuerpo: cuerpo.trim(),
    categoria: categoria || 'Avisos',
    prioridad: prioridad || 'media',
    fecha: new Date().toISOString(),
  };

  avisos.unshift(aviso);
  return json({ ok: true, data: aviso }, 201);
}

// ─── DELETE /api/avisos ───────────────────────────────────────────────────────
export async function DELETE(request) {
  const body = await request.json().catch(() => null);
  if (!body) return json({ ok: false, error: 'Body inválido' }, 400);

  const { password, id } = body;

  if (password !== ADMIN_PASSWORD)
    return json({ ok: false, error: 'Contraseña incorrecta' }, 401);

  const before = avisos.length;
  avisos = avisos.filter((a) => a.id !== Number(id));

  if (avisos.length === before)
    return json({ ok: false, error: 'Aviso no encontrado' }, 404);

  return json({ ok: true });
}
