import React, { useMemo, useState } from 'react';
import StatTile from '../components/StatTile';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  isWithinNextDays,
} from '../utils/date';
import {
  getDiscountLoss,
  getHotTours,
  getMostExpensiveTour,
  getPopularTours,
} from '../utils/analytics';

const emptyManager = {
  name: '',
  email: '',
  phone: '',
};

const ProfilePage = ({ currentUser, managers, clients, tours, sales, onAddManager, onRemoveManager }) => {
  const [managerForm, setManagerForm] = useState(emptyManager);
  const hotTours = useMemo(() => getHotTours(tours), [tours]);
  const expensiveTour = useMemo(() => getMostExpensiveTour(tours), [tours]);
  const popularTours = useMemo(() => getPopularTours(tours, sales), [sales, tours]);
  const discountLoss = useMemo(() => getDiscountLoss(sales, tours, clients), [clients, sales, tours]);

  const cityDistribution = useMemo(() => {
    const result = clients.reduce((acc, client) => {
      acc[client.city] = (acc[client.city] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(result).sort((left, right) => right[1] - left[1]);
  }, [clients]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddManager(managerForm);
    setManagerForm(emptyManager);
  };

  const canManageManagers = currentUser?.role === 'leader';

  return (
    <section className="page-shell profile-layout">
      <article className="panel">
        <p className="eyebrow">Личный кабинет</p>
        <h2>{currentUser?.name ?? 'Гость'}</h2>
        <p className="muted-text">
          Здесь собраны ключевые отчёты по текущим данным и административные функции для руководителя.
        </p>

        <div className="stats-row three-up">
          <StatTile label="Клиентов" value={formatNumber(clients.length)} hint="Всего в базе" tone="primary" />
          <StatTile label="Путёвок" value={formatNumber(tours.length)} hint="Каталог предложений" tone="success" />
          <StatTile label="Продаж" value={formatNumber(sales.length)} hint="Записей в журнале" tone="warning" />
        </div>

        <div className="stats-row three-up">
          <StatTile
            label="Потери от скидок"
            value={formatCurrency(discountLoss)}
            hint="Скидки постоянным клиентам"
            tone="warning"
          />
          <StatTile
            label="Самая дорогая путёвка"
            value={expensiveTour ? formatCurrency(expensiveTour.price) : '—'}
            hint={expensiveTour ? `${expensiveTour.city} · ${expensiveTour.title}` : 'Нет данных'}
            tone="primary"
          />
          <StatTile
            label="Горящих путёвок"
            value={formatNumber(hotTours.length)}
            hint="Дата отправления в ближайшие 5 дней"
            tone="success"
          />
        </div>
      </article>

      <article className="panel">
        <div className="section-block">
          <h3>Отчёты</h3>
          <ul className="bullet-list">
            <li>
              Самая дорогая путёвка: {expensiveTour ? `${expensiveTour.title} (${formatCurrency(expensiveTour.price)})` : '—'}
            </li>
            <li>Путёвки с ближайшей датой отправления: {hotTours.length}</li>
            <li>
              Путёвка с максимумом спроса: {popularTours[0] ? `${popularTours[0].title} (${popularTours[0].soldQuantity})` : '—'}
            </li>
          </ul>
        </div>

        <div className="section-block">
          <h3>Кто выбрал заданный город</h3>
          <div className="chips-row wrap">
            {cityDistribution.map(([city, count]) => (
              <span key={city} className="chip">
                {city} — {count}
              </span>
            ))}
          </div>
        </div>

        <div className="section-block">
          <h3>Путёвки по сроку</h3>
          <ul className="bullet-list">
            {tours.map((tour) => (
              <li key={tour.id}>
                {tour.title} — начало {formatDate(tour.startDate)}
                {isWithinNextDays(tour.startDate, 5) ? ' · горящая' : ''}
              </li>
            ))}
          </ul>
        </div>
      </article>

      {canManageManagers ? (
        <article className="panel full-width-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Администрирование менеджеров</p>
              <h3>Управление пользователями</h3>
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

          <div className="table-card">
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
                  <button
                    type="button"
                    className="link-button danger-link"
                    onClick={() => onRemoveManager(manager.id)}
                  >
                    Удалить
                  </button>
                </span>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
};

export default ProfilePage;

