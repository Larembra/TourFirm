import React, { useState } from 'react';

const emptyManager = {
  name: '',
  email: '',
  phone: '',
};

const ManagersPage = ({ managers, onAddManager, onRemoveManager }) => {
  const [managerForm, setManagerForm] = useState(emptyManager);

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
          <button type="submit" className="primary-button wide-button">
            Добавить менеджера
          </button>
        </form>

        <div className="table-card" style={{ marginTop: 12 }}>
          <div className="table-head">
            <span>Имя</span>
            <span>Email</span>
            <span>Телефон</span>
            <span>Действие</span>
          </div>
          {managers.map((manager) => (
            <div className="table-row" key={manager.id}>
              <span>{manager.name}</span>
              <span>{manager.email}</span>
              <span>{manager.phone}</span>
              <span>
                <button type="button" className="link-button danger-link" onClick={() => onRemoveManager(manager.id)}>
                  Удалить
                </button>
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};

export default ManagersPage;

