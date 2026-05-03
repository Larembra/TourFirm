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
          <h2>Авторизация</h2>
          <p/>
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-row">
              <label htmlFor="login" className="field-label">Логин</label>
              <input id="login" name="login" value={form.login} onChange={handleChange} placeholder="Любой логин" />
            </div>

            <div className="auth-row">
              <label htmlFor="password" className="field-label">Пароль</label>
              <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Любой пароль"
              />
            </div>

            <div className="auth-row">
              <label htmlFor="name" className="field-label">Имя</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Любое имя" />
            </div>

            <div className="auth-row">
              <label htmlFor="email" className="field-label">Email</label>
              <input id="email" name="email" value={form.email} onChange={handleChange} placeholder="Любой email" />
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