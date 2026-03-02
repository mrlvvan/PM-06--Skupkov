import './App.css';
import React, { useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  getCurrentUser,
  loginUser,
  registerUser,
  updateUser,
} from './auth/storage';

function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  const id = useMemo(() => `field_${Math.random().toString(16).slice(2)}`, []);
  return (
    <label className="Field" htmlFor={id}>
      <div className="Field-label">{label}</div>
      <input
        id={id}
        className="Field-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}

function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`Button Button--${variant}`} {...props}>
      {children}
    </button>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

function AuthCard({ mode, onModeChange, onAuthed }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  function submit(e) {
    e.preventDefault();
    setError('');

    if (isRegister && password !== password2) {
      setError('Пароли не совпадают.');
      return;
    }

    const res = isRegister
      ? registerUser({ email, password, name })
      : loginUser({ email, password });

    if (!res.ok) {
      setError(res.error || 'Ошибка.');
      return;
    }

    onAuthed(res.user);
  }

  return (
    <div className="Card">
      <div className="Card-header">
        <div className="Title">Лабораторная работа 1</div>
        <div className="Subtitle"></div>
      </div>

      <div className="Tabs" role="tablist" aria-label="Режим">
        <button
          className={`Tab ${mode === 'login' ? 'Tab--active' : ''}`}
          type="button"
          onClick={() => onModeChange('login')}
          role="tab"
          aria-selected={mode === 'login'}
        >
          Вход
        </button>
        <button
          className={`Tab ${mode === 'register' ? 'Tab--active' : ''}`}
          type="button"
          onClick={() => onModeChange('register')}
          role="tab"
          aria-selected={mode === 'register'}
        >
          Регистрация
        </button>
      </div>

      <form className="Form" onSubmit={submit}>
        {isRegister ? (
          <Field
            label="Имя (необязательно)"
            value={name}
            onChange={setName}
            placeholder="Иван"
            autoComplete="name"
          />
        ) : null}

        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="user@example.com"
          autoComplete={isRegister ? 'email' : 'username'}
        />

        <Field
          label="Пароль"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Минимум 6 символов"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />

        {isRegister ? (
          <Field
            label="Повтор пароля"
            type="password"
            value={password2}
            onChange={setPassword2}
            placeholder="Повторите пароль"
            autoComplete="new-password"
          />
        ) : null}

        {error ? <div className="Alert Alert--error">{error}</div> : null}

        <div className="Actions">
          <Button type="submit">{isRegister ? 'Зарегистрироваться' : 'Войти'}</Button>
        </div>

        <div className="Hint">
          {isRegister ? (
            <>
              Уже есть аккаунт?{' '}
              <button className="Link" type="button" onClick={() => onModeChange('login')}>
                Войти
              </button>
            </>
          ) : (
            <>
              Нет аккаунта?{' '}
              <button className="Link" type="button" onClick={() => onModeChange('register')}>
                Зарегистрироваться
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout, onUserUpdated }) {
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');

    const res = updateUser(user.id, { name: String(name || '').trim() });
    if (res.ok) {
      onUserUpdated(res.user);
      setSaveMsg('Сохранено.');
    } else {
      setSaveMsg(res.error || 'Ошибка сохранения.');
    }
    setSaving(false);
  }

  return (
    <div className="Card">
      <div className="Topbar">
        <div>
          <div className="Title">Добро пожаловать</div>
          <div className="Subtitle">
            Вы вошли как <span className="Mono">{user.email}</span>
          </div>
        </div>
        <div className="Topbar-actions">
          <Button variant="secondary" type="button" onClick={onLogout}>
            Выйти
          </Button>
        </div>
      </div>

      <div className="Grid">
        <section className="Section">
          <div className="Section-title">Профиль (ввод данных)</div>
          <form className="Form" onSubmit={saveProfile}>
            <Field
              label="Имя"
              value={name}
              onChange={setName}
              placeholder="Например: Иван"
              autoComplete="name"
            />
            <div className="Meta">
              Аккаунт создан: <span className="Mono">{formatDate(user.createdAt)}</span>
            </div>
            <div className="Actions">
              <Button type="submit" disabled={saving}>
                Сохранить
              </Button>
            </div>
            {saveMsg ? <div className="Alert Alert--info">{saveMsg}</div> : null}
          </form>
        </section>
      </div>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const existing = getCurrentUser();
    if (existing) setUser(existing);
  }, []);

  function logout() {
    clearSession();
    setUser(null);
    setMode('login');
  }

  return (
    <div className="AppShell">
      <div className="Container">
        {user ? <Dashboard user={user} onLogout={logout} onUserUpdated={setUser} /> : <AuthCard mode={mode} onModeChange={setMode} onAuthed={setUser} />}
      </div>
    </div>
  );
}

export default App;
