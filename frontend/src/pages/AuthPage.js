import React, { useState } from 'react';

const AuthPage = ({ onLogin }) => {
  const [form, setForm] = useState({ login: '', password: '', name: '', email: '' });

  const submit = (event) => {
    event.preventDefault();
    onLogin();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
      <section className="page-shell auth-layout centered-page">
        <article className="panel centered-card">
          <p className="eyebrow">Вход в систему</p>
          <h2>Авторизация и регистрация</h2>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Логин
              <input name="login" value={form.login} onChange={handleChange} placeholder="Любой логин" />
            </label>
            <label>
              Пароль
              <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Любой пароль"
              />
            </label>
            <label>
              Имя
              <input name="name" value={form.name} onChange={handleChange} placeholder="Любое имя" />
            </label>
            <label>
              Email
              <input name="email" value={form.email} onChange={handleChange} placeholder="Любой email" />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button">
                Войти
              </button>
              <button type="button" className="secondary-button" onClick={onLogin}>
                Зарегистрироваться
              </button>
            </div>
          </form>
        </article>
      </section>
  );
};

export default AuthPage;