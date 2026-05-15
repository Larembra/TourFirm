import React, { useMemo } from 'react';
// StatTile not used here anymore; cards rendered inline
import { formatCurrency, formatDate, isWithinNextDays, formatNumber } from '../utils/date';
import { getHotTours, getMostExpensiveTour, getPopularTours, getSalesSummary } from '../utils/analytics';

// inline sparkline used by reports (moved from ProfilePage)
const Sparkline = ({ data = [], color = '#2563eb', height = 36 }) => {
  if (!data || data.length === 0) return null;
  const w = Math.max(64, data.length * 4);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - 4) + 2;
      const y = ((max - v) / range) * (height - 4) + 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// deterministic series builder for demo sparklines
const buildSeries = (value, days = 30, bias = 0) => {
  const result = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    const base = (0.6 + 0.4 * t) * value;
    const wave = Math.sin((i + bias) * 0.3) * value * 0.03;
    result.push(Math.max(0, Math.round(base + wave)));
  }
  return result;
};

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

        {/* Top summary cards with sparklines (copies of ProfilePage report cards) */}
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b' }}>Клиентов</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{clients.length}</div>
            <div style={{ marginTop: 8 }}>
              <Sparkline data={buildSeries(clients.length, 30, 1)} color="#2563eb" />
            </div>
          </div>

          <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b' }}>Путёвок</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{tours.length}</div>
            <div style={{ marginTop: 8 }}>
              <Sparkline data={buildSeries(tours.length, 30, 3)} color="#10b981" />
            </div>
          </div>

          <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b' }}>Продаж (кол-во)</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{summary.totalQuantity}</div>
            <div style={{ marginTop: 8 }}>
              <Sparkline data={buildSeries(summary.totalQuantity, 30, 5)} color="#f59e0b" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b' }}>Выручка (без скидок)</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(revenueNoDiscount)}</div>
            <div style={{ marginTop: 8 }}>
              <Sparkline data={buildSeries(Math.round(revenueNoDiscount / 1000), 30, 7)} color="#2563eb" />
            </div>
          </div>

          <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b' }}>Выручка (с учётом скидок)</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(summary.revenue)}</div>
            <div style={{ marginTop: 8 }}>
              <Sparkline data={buildSeries(Math.round(summary.revenue / 1000), 30, 9)} color="#0ea5e9" />
            </div>
          </div>

          <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b' }}>Потери от скидок</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(summary.discountLoss)}</div>
            <div style={{ marginTop: 8 }}>
              <Sparkline data={buildSeries(Math.round(summary.discountLoss / 1000), 30, 11)} color="#ef4444" />
            </div>
          </div>
        </div>

        <div className="section-block" style={{ marginTop: 18 }}>
          <h3>Основные показатели</h3>
          <ul className="bullet-list">
            <li>
              Самая дорогая путёвка: {expensiveTour ? `${expensiveTour.title} (${formatCurrency(expensiveTour.price)})` : '-'}
            </li>
            <li>Путёвки с ближайшей датой отправления: {hotTours.length}</li>
            <li>
              Путёвка с максимумом спроса: {popularTours[0] ? `${popularTours[0].title} (${popularTours[0].soldQuantity})` : '-'}
            </li>
          </ul>
        </div>

        <div className="section-block">
          <h3>Кто выбрал заданный город</h3>
          <div className="chips-row wrap">
            {cityDistribution.map(([city, count]) => (
              <span key={city} className="chip">
                {city} - {count}
              </span>
            ))}
          </div>
        </div>

        <div className="section-block">
          <h3>Путёвки по сроку</h3>
          <ul className="bullet-list">
            {tours.map((tour) => (
              <li key={tour.id}>
                {tour.title} - начало {formatDate(tour.startDate)}{isWithinNextDays(tour.startDate, 5) ? ' · горящая' : ''}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
};

export default ReportsPage;


