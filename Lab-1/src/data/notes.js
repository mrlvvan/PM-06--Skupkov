function notesKey(userId) {
  return `demoekz1.notes.v1.${userId}`;
}

function generateId() {
  const c = typeof window !== 'undefined' ? window.crypto : null;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function loadNotes(userId) {
  if (!userId) return [];
  const raw = localStorage.getItem(notesKey(userId));
  const notes = safeJsonParse(raw, []);
  return Array.isArray(notes) ? notes : [];
}

export function saveNotes(userId, notes) {
  if (!userId) return;
  localStorage.setItem(notesKey(userId), JSON.stringify(notes));
}

export function addNote(userId, text) {
  const t = String(text || '').trim();
  if (!t) return { ok: false, error: 'Введите текст.' };

  const next = {
    id: generateId(),
    text: t,
    createdAt: new Date().toISOString(),
  };

  const notes = loadNotes(userId);
  saveNotes(userId, [next, ...notes]);
  return { ok: true, note: next };
}

export function deleteNote(userId, noteId) {
  const notes = loadNotes(userId);
  const next = notes.filter((n) => n.id !== noteId);
  saveNotes(userId, next);
  return { ok: true };
}

export function clearNotes(userId) {
  if (!userId) return;
  localStorage.removeItem(notesKey(userId));
}

