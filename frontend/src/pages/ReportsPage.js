import React, { useMemo } from 'react';
import StatTile from '../components/StatTile';
import { formatCurrency, formatDate, isWithinNextDays, formatNumber } from '../utils/date';
import { getHotTours, getMostExpensiveTour, getPopularTours, getSalesSummary } from '../utils/analytics';

const ReportsPage = ({ tours, sales, clients }) => {
  const hotTours = useMemo(() => getHotTours(tours), [tours]);
  const expensiveTour = useMemo(() => getMostExpensiveTour(tours), [tours]);
  const popularTours = useMemo(() => getPopularTours(tours, sales), [sales, tours]);
  const summary = useMemo(() => getSalesSummary(sales, tours, clients), [sales, tours, clients]);

  const cityDistribution = useMemo(() => {
    const result = clients.reduce((acc, client) => {
      acc[client.city] = (acc[client.city] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(result).sort((left, right) => right[1] - left[1]);
  }, [clients]);

  const revenueNoDiscount = useMemo(
    () => sales.reduce((sum, sale) => {
      const tour = tours.find((t) => t.id === sale.tourId);
      if (!tour) return sum;
      return sum + tour.price * sale.quantity;
    }, 0),
    [sales, tours],
  );

  return (
    <section className="page-shell wide-content">
      <article className="panel full-width-panel">
        <p className="eyebrow">Отчёты</p>
        <h2>Сводка продаж и статистика</h2>

        <div style={{ marginTop: 12 }} className="stats-row three-up">
          <StatTile label="Клиентов" value={formatNumber(clients.length)} hint="Всего в базе" tone="primary" />
          <StatTile label="Путёвок" value={formatNumber(tours.length)} hint="Каталог предложений" tone="success" />
          <StatTile label="Продаж" value={formatNumber(sales.length)} hint="Записей в журнале" tone="warning" />
        </div>

        <div style={{ marginTop: 12 }} className="stats-row three-up">
          <StatTile label="Выручка (без скидок)" value={formatCurrency(revenueNoDiscount)} tone="primary" />
          <StatTile label="Выручка (с учётом скидок)" value={formatCurrency(summary.revenue)} tone="success" />
          <StatTile label="Потери от скидок" value={formatCurrency(summary.discountLoss)} tone="warning" />
        </div>

        <div className="section-block" style={{ marginTop: 18 }}>
          <h3>Основные показатели</h3>
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
                {tour.title} — начало {formatDate(tour.startDate)}{isWithinNextDays(tour.startDate, 5) ? ' · горящая' : ''}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
};

export default ReportsPage;


