import React, { useState } from 'react';

const emptyManager = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

const ManagersPage = ({ managers, onAddManager, onRemoveManager, onUpdateManager }) => {
  const [managerForm, setManagerForm] = useState(emptyManager);
  const [editingManager, setEditingManager] = useState(null);
  const [editForm, setEditForm] = useState(emptyManager);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddManager(managerForm);
    setManagerForm(emptyManager);
  };

  return (
    <section className="page-shell wide-content">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Администрирование менеджеров</p>
            <h2>Управление пользователями</h2>
          </div>
          <span className="count-badge">{managers.length} менеджеров</span>
        </div>

        <form className="form-grid managers-form" onSubmit={handleSubmit}>
          <label>
            Имя
            <input
              value={managerForm.name}
              onChange={(event) => setManagerForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={managerForm.email}
              onChange={(event) => setManagerForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Телефон
            <input
              value={managerForm.phone}
              onChange={(event) => setManagerForm((current) => ({ ...current, phone: event.target.value }))}
              required
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              value={managerForm.password}
              onChange={(event) => setManagerForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          <button type="submit" className="primary-button wide-button">
            Добавить менеджера
          </button>
        </form>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            Поиск по имени
            <input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Введите имя менеджера"
              style={{ marginTop: 8 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            Поиск по email
            <input
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Введите email"
              style={{ marginTop: 8 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            Поиск по телефону
            <input
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              placeholder="Введите телефон"
              style={{ marginTop: 8 }}
            />
          </label>
        </div>

        <div className="table-card" style={{ marginTop: 12 }}>
          <div className="table-head">
            <span>Имя</span>
            <span>Email</span>
            <span>Телефон</span>
            <span>Действие</span>
          </div>
          {managers
            .filter((m) => {
              const nameOk = nameFilter ? m.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
              const emailOk = emailFilter ? (m.email ?? '').toLowerCase().includes(emailFilter.toLowerCase()) : true;
              const phoneOk = phoneFilter ? (m.phone ?? '').toLowerCase().includes(phoneFilter.toLowerCase()) : true;
              return nameOk && emailOk && phoneOk;
            })
            .map((manager) => (
            <div className="table-row" key={manager.id}>
              <span>{manager.name}</span>
              <span>{manager.email}</span>
              <span>{manager.phone}</span>
              <span style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setEditingManager(manager);
                    setEditForm({ name: manager.name, email: manager.email, phone: manager.phone, password: manager.password ?? '' });
                  }}
                >
                  Редактировать
                </button>
                <button type="button" className="link-button danger-link" onClick={() => onRemoveManager(manager.id)}>
                  Удалить
                </button>
              </span>
            </div>
          ))}
        </div>
        {/* Edit modal */}
        {editingManager ? (
          <div className="modal-overlay" onClick={() => setEditingManager(null)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ marginBottom: 12 }}>Редактировать менеджера</h3>
                  <p/>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateManager(editingManager.id, editForm);
                  setEditingManager(null);
                }}
                className="form-grid"
              >
                <label>
                  Имя
                  <input value={editForm.name} onChange={(ev) => setEditForm((c) => ({ ...c, name: ev.target.value }))} required />
                </label>
                <label>
                  Email
                  <input type="email" value={editForm.email} onChange={(ev) => setEditForm((c) => ({ ...c, email: ev.target.value }))} required />
                </label>
                <label>
                  Телефон
                  <input value={editForm.phone} onChange={(ev) => setEditForm((c) => ({ ...c, phone: ev.target.value }))} required />
                </label>
                <label>
                  Пароль
                  <input type="password" value={editForm.password} onChange={(ev) => setEditForm((c) => ({ ...c, password: ev.target.value }))} />
                </label>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12, gridColumn: '1 / -1' }}>
                  <button type="button" className="secondary-button" onClick={() => setEditingManager(null)}>
                    Отмена
                  </button>
                  <button type="submit" className="primary-button">
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
};

export default ManagersPage;

