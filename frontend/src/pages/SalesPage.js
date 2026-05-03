import React, { useMemo, useState } from 'react';
import { formatCurrency, formatDate } from '../utils/date';
import { getSalesSummary, getPopularTours } from '../utils/analytics';

const SalesPage = ({ sales, tours, clients }) => {
  const [dayFilter, setDayFilter] = useState('');

  const summary = useMemo(() => getSalesSummary(sales, tours, clients), [clients, sales, tours]);
  const popularTours = useMemo(() => getPopularTours(tours, sales), [sales, tours]);

  const visibleSales = useMemo(
    () =>
      dayFilter ? sales.filter((sale) => sale.date === dayFilter) : sales,
    [dayFilter, sales],
  );

  return (
    <section className="page-shell split-layout wide-content">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Сведения о продаже путевок</p>
            <h2>Журнал продаж и аналитика</h2>
          </div>
          <span className="count-badge">{sales.length} записей</span>
        </div>

        <div className="stats-row">
          <article className="stat-tile tone-primary">
            <span>Сумма выручки</span>
            <strong>{formatCurrency(summary.revenue)}</strong>
          </article>
          <article className="stat-tile tone-success">
            <span>Количество продаж</span>
            <strong>{summary.totalOrders}</strong>
          </article>
        </div>

        <label className="single-filter">
          Дата продажи
          <input type="date" value={dayFilter} onChange={(event) => setDayFilter(event.target.value)} />
        </label>

        <div className="table-card">
          <div className="table-head">
            <span>Дата</span>
            <span>Путёвка</span>
            <span>Клиент</span>
            <span>Количество</span>
          </div>
          {visibleSales.map((sale) => {
            const tour = tours.find((item) => item.id === sale.tourId);
            const client = clients.find((item) => item.id === sale.clientId);

            return (
              <div className="table-row" key={sale.id}>
                <span>{formatDate(sale.date)}</span>
                <span>{tour?.title ?? '—'}</span>
                <span>{client?.name ?? '—'}</span>
                <span>{sale.quantity}</span>
              </div>
            );
          })}
          {visibleSales.length === 0 ? <p className="empty-state">Продажи не найдены.</p> : null}
        </div>
      </article>

      <article className="panel">
        <p className="eyebrow">Какие путёвки пользуются наибольшим спросом</p>
        <h3>Рейтинг путёвок по количеству продаж</h3>
        <div className="stack-list scroll-area">
          {popularTours.map((tour) => (
            <div key={tour.id} className="list-card static-card">
              <strong>{tour.title}</strong>
              <span>
                {tour.city} · продано {tour.soldQuantity} шт. · {formatCurrency(tour.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="section-block">
          <h4>Дополнительные показатели</h4>
          <ul className="bullet-list">
            <li>Всего штук: {summary.totalQuantity}</li>
            <li>Приблизительная выручка после скидок: {formatCurrency(summary.revenue)}</li>
          </ul>
        </div>
      </article>
    </section>
  );
};

export default SalesPage;

