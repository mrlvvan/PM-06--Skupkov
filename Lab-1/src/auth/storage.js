const USERS_KEY = 'demoekz1.users.v1';
const SESSION_KEY = 'demoekz1.session.v1';

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

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  const users = safeJsonParse(raw, []);
  return Array.isArray(users) ? users : [];
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionUserId() {
  const raw = localStorage.getItem(SESSION_KEY);
  const session = safeJsonParse(raw, null);
  return session && typeof session.userId === 'string' ? session.userId : null;
}

export function setSessionUserId(userId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const userId = getSessionUserId();
  if (!userId) return null;
  return loadUsers().find((u) => u.id === userId) || null;
}

export function registerUser({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = String(name || '').trim();
  const pwd = String(password || '');

  if (!normalizedEmail) {
    return { ok: false, error: 'Введите email.' };
  }
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return { ok: false, error: 'Некорректный email.' };
  }
  if (pwd.length < 6) {
    return { ok: false, error: 'Пароль должен быть не короче 6 символов.' };
  }

  const users = loadUsers();
  if (users.some((u) => normalizeEmail(u.email) === normalizedEmail)) {
    return { ok: false, error: 'Пользователь с таким email уже существует.' };
  }

  const user = {
    id: generateId(),
    email: normalizedEmail,
    password: pwd,
    name: trimmedName,
    createdAt: new Date().toISOString(),
  };

  saveUsers([user, ...users]);
  setSessionUserId(user.id);
  return { ok: true, user };
}

export function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const pwd = String(password || '');

  if (!normalizedEmail || !pwd) {
    return { ok: false, error: 'Введите email и пароль.' };
  }

  const users = loadUsers();
  const user = users.find(
    (u) => normalizeEmail(u.email) === normalizedEmail && String(u.password) === pwd
  );

  if (!user) {
    return { ok: false, error: 'Неверный email или пароль.' };
  }

  setSessionUserId(user.id);
  return { ok: true, user };
}

export function updateUser(userId, patch) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return { ok: false, error: 'Пользователь не найден.' };

  const next = { ...users[idx], ...patch, updatedAt: new Date().toISOString() };
  const nextUsers = [...users];
  nextUsers[idx] = next;
  saveUsers(nextUsers);
  return { ok: true, user: next };
}

export function clearAllAuthData() {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(SESSION_KEY);
}

