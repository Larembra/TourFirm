import React from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { key: 'home', label: 'Главная', authRequired: false },
  { key: 'clients', label: 'Сведения о клиентах', authRequired: true },
  { key: 'tours', label: 'Сведения о путевках', authRequired: true },
  { key: 'sales', label: 'Сведения о продаже путевок', authRequired: true },
  { key: 'profile', label: 'Личный кабинет', authRequired: true },
];

const Navigation = ({ activePage, user, onNavigate, onLogout, onAuth }) => {
  const isGuest = !user;

  const visibleTabs = isGuest ? tabs.filter((t) => !t.authRequired) : tabs;

  return (
    <header className="topbar">
      <div className="brand-block">
        <div>
          <p className="eyebrow">TourFirm CRM</p>
          <h1>Рабочее место туристической фирмы</h1>
        </div>
        <div className="user-chip">
          <span className={`status-dot ${isGuest ? 'is-guest' : 'is-authenticated'}`} />
          <div>
            <strong>{isGuest ? 'Гость' : user.name}</strong>
            <span>{isGuest ? 'Доступ только к справке и входу' : user.position}</span>
          </div>
        </div>
      </div>

      <nav className="tabs" aria-label="Основная навигация">
        {visibleTabs.map((tab) => {
          const to = tab.key === 'home' ? '/' : `/${tab.key}`;

          return (
            <NavLink
              key={tab.key}
              to={to}
              className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="topbar-actions">
        {isGuest ? (
          <button type="button" className="secondary-button" onClick={onAuth}>
            Авторизоваться
          </button>
        ) : (
          <>
            <span className="role-badge">{user.role === 'leader' ? 'Руководитель' : 'Менеджер'}</span>
            <button type="button" className="secondary-button" onClick={onLogout}>
              Выйти
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;


