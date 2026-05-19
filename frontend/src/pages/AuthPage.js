import React, { useState } from 'react';

const AuthPage = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (email) => {
    // Простая и надёжная проверка email для фронта
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.email || !isValidEmail(form.email)) {
      setEmailError('Введите корректный email (пример: user@example.com)');
      return;
    }
    setEmailError('');
    onLogin(form.email, form.password);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === 'email') {
      if (!value) {
        setEmailError('Email обязателен');
      } else if (!isValidEmail(value)) {
        setEmailError('Введите корректный email');
      } else {
        setEmailError('');
      }
    }
  };

  return (
      <section className="page-shell auth-layout centered-page">
        <article className="panel centered-card">
          <p className="eyebrow">Вход в систему</p>
          <h2>Авторизация</h2>
          <p/>
          <form className="auth-form" onSubmit={submit}>

            <div className="auth-row">
              <label htmlFor="email" className="field-label">Email</label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                aria-invalid={!!emailError}
              />
              {emailError ? <div className="field-error" style={{ color: '#dc2626', marginTop: 6 }}>{emailError}</div> : null}
            </div>

            <div className="auth-row">
              <label htmlFor="password" className="field-label">Пароль</label>
              <input
                    id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                    placeholder="Пароль"
              />
            </div>





            <div className="form-actions auth-actions">
              <button type="submit" className="primary-button wide-button">
                Войти
              </button>
            </div>
          </form>
        </article>
      </section>
  );
};

export default AuthPage;