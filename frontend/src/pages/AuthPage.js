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
    <section className="page-shell auth-layout">
      <article className="panel">
        <p className="eyebrow">Вход в тестовый режим</p>
        <h2>Авторизация и регистрация</h2>
        <p className="muted-text">
          Это заглушка без backend: любые введённые данные переводят в один и тот же тестовый
          аккаунт руководителя.
        </p>
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
              Войти как руководитель
            </button>
            <button type="button" className="secondary-button" onClick={onLogin}>
              Зарегистрироваться
            </button>
          </div>
        </form>
      </article>

      <aside className="panel accent-panel">
        <h3>Тестовый пользователь</h3>
        <ul className="bullet-list">
          <li>Роль: руководитель</li>
          <li>Функции менеджера доступны автоматически</li>
          <li>Сведения хранятся в браузере и без сервера</li>
        </ul>
      </aside>
    </section>
  );
};

export default AuthPage;

