import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, isWithinNextDays } from '../utils/date';

const TourDetailPage = () => {
  const { id } = useParams();
  const app = useApp();

  const tour = useMemo(() => app.tours.find((t) => t.id === id) ?? null, [app.tours, id]);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  if (!tour) {
    return (
      <section className="page-shell wide-content">
        <article className="panel">
          <p className="empty-state">Путёвка не найдена.</p>
        </article>
      </section>
    );
  }
  const tourClients = (tour.assignedClientIds || []).map((cid) => app.clients.find((c) => c.id === cid)).filter(Boolean);
  const seatsTaken = tourClients.length;
  const seatsTotal = tour.seats || 0;
  const seatsAvailable = Math.max(0, seatsTotal - seatsTaken);

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

        <div className="split-layout" style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div className="panel" style={{ flex: 2, padding: 16 }}>
            {tour.images && tour.images.length > 0 ? (
              <img src={tour.images[0].url} alt={tour.title} style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div className="tour-image-placeholder" style={{ height: 320 }}>Фото путёвки</div>
            )}
            <div style={{ marginTop: 12 }}>
              <div style={{ color: '#64748b' }}>{tour.city} · {formatDate(tour.startDate)} - {formatDate(tour.endDate)}</div>
              <h3 style={{ marginTop: 8 }}>{tour.title}</h3>
              <p className="muted-text">{tour.description}</p>
            </div>
            <div className="section-block" style={{ marginTop: 16 }}>
              <h4>Экскурсии</h4>
              <ul className="bullet-list">
                {tour.excursions && tour.excursions.length > 0 ? (
                  tour.excursions.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <p className="muted-text">Нет экскурсий.</p>
                )}
              </ul>
            </div>
          </div>

          <div className="panel" style={{ flex: 1, padding: 16 }}>
            <div className="detail-grid" style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span>Мест (свободно)</span>
                <strong>{seatsAvailable} / {seatsTotal}</strong>
              </div>
              <div style={{ minWidth: 160 }}>
                <span>Статус</span>
                <strong style={{ display: 'block', whiteSpace: 'nowrap' }}>{isWithinNextDays(tour.startDate, 5) ? 'Горящая' : 'Стандартная'}</strong>
              </div>
            </div>

            <div className="section-block" style={{ marginTop: 12 }}>
              <h4>Услуги</h4>
              {tour.services && tour.services.length > 0 ? (
                <div>
                  {tour.services.map((svc) => (
                    <label key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(svc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedServiceIds((s) => [...s, svc.id]);
                          else setSelectedServiceIds((s) => s.filter((id) => id !== svc.id));
                        }}
                      />
                      <span style={{ flex: 1 }}>{svc.name}</span>
                      <strong>{svc.cost} ₽</strong>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="muted-text">Нет дополнительных услуг.</p>
              )}
              <div style={{ marginTop: 8 }}>
                <strong>Итого: </strong>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(tour.price + (tour.services || []).filter(s => selectedServiceIds.includes(s.id)).reduce((sum, s) => sum + (s.cost || 0), 0))}</span>
              </div>

              <div className="section-block" style={{ marginTop: 16 }}>
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

              <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                <input
                  list="clients-list-detail"
                  placeholder="ФИО клиента"
                  value={selectedClientName}
                  onChange={(e) => setSelectedClientName(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1px solid #cbd5e1' }}
                />
                <datalist id="clients-list-detail">
                  {app.clients.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    (async () => {
                      const client = app.clients.find((c) => c.name === selectedClientName);
                      if (!client) {
                        window.alert('Выберите клиента из списка');
                        return;
                      }
                      try {
                        const res = await fetch('http://127.0.0.1:8000/api/sales', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tour_id: Number(tour.id), client_id: Number(client.id), quantity: 1, service_ids: selectedServiceIds.map(id => Number(id)) }),
                        });
                        if (!res.ok) {
                          const text = await res.text();
                          throw new Error(text || 'Ошибка при создании продажи');
                        }
                        await res.json();
                        setSelectedClientName('');
                        setSelectedServiceIds([]);
                        app.reloadData();
                        window.alert('Клиент добавлен, продажа сохранена.');
                      } catch (err) {
                        console.error(err);
                        window.alert('Не удалось сохранить продажу');
                      }
                    })();
                  }}
                >
                  Добавить к путёвке
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default TourDetailPage;

