import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, isWithinNextDays } from '../utils/date';

const TourDetailPage = () => {
  const { id } = useParams();
  const app = useApp();

  const tour = useMemo(() => app.tours.find((t) => t.id === id) ?? null, [app.tours, id]);

  if (!tour) {
    return (
      <section className="page-shell wide-content">
        <article className="panel">
          <p className="empty-state">Путёвка не найдена.</p>
        </article>
      </section>
    );
  }

  const tourClients = tour.assignedClientIds.map((cid) => app.clients.find((c) => c.id === cid)).filter(Boolean);

  return (
    <section className="page-shell wide-content">
      <article className="panel">
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">Путёвка</p>
            <h2>{tour.title}</h2>
          </div>
          <div>
            <Link to="/tours" className="link-button">← Назад к каталогу</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18 }}>
          <div className="tour-image-placeholder" style={{ height: 320 }}>
            Фото путёвки
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ color: '#64748b' }}>{tour.city} · {formatDate(tour.startDate)} — {formatDate(tour.endDate)}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(tour.price)}</div>
            </div>

            <p className="muted-text">{tour.description}</p>

            <div className="detail-grid" style={{ marginTop: 12 }}>
              <div>
                <span>Мест</span>
                <strong>{tour.seats}</strong>
              </div>
              <div>
                <span>Статус</span>
                <strong>{isWithinNextDays(tour.startDate, 5) ? 'Горящая' : 'Стандартная'}</strong>
              </div>
            </div>

            <div className="section-block">
              <h4>Экскурсии</h4>
              <ul className="bullet-list">
                {tour.excursions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="section-block">
              <h4>Услуги</h4>
              <ul className="bullet-list">
                {tour.services.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="section-block">
              <h4>Клиенты</h4>
              {tourClients.length > 0 ? (
                <ul className="bullet-list">
                  {tourClients.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">Пока никто не закреплён.</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default TourDetailPage;

