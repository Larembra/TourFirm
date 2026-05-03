import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/date';
import { getHotTours, getToursByCity } from '../utils/analytics';

const emptyTour = {
  city: '',
  title: '',
  price: 0,
  startDate: '',
  endDate: '',
  description: '',
  excursions: '',
  services: '',
  seats: 10,
};

const parseListField = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const ToursPage = ({
  tours,
  clients,
  currentUser,
  onCreateTour,
  onUpdateTour,
  onDeleteTour,
  onAddClientToTour,
  onRemoveClientFromTour,
}) => {
  const [cityFilter, setCityFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [onlyHot, setOnlyHot] = useState(false);
  const [clientFilter, setClientFilter] = useState('');
  // selected tour handled on separate detail page now
  const [form, setForm] = useState(emptyTour);

  const visibleTours = useMemo(() => {
    let items = [...tours];

    if (cityFilter) {
      items = getToursByCity(items, cityFilter);
    }

    if (startDateFilter) {
      items = items.filter((tour) => tour.startDate === startDateFilter);
    }

    if (onlyHot) {
      items = getHotTours(items);
    }

    return items.sort((left, right) => new Date(left.startDate) - new Date(right.startDate));
  }, [cityFilter, onlyHot, startDateFilter, tours]);

  // detail page replaced selection; helper to get a default tour for quick actions
  const defaultTour = visibleTours[0] ?? null;

  const hotTours = useMemo(() => getHotTours(tours), [tours]);
  const priceByDateTours = useMemo(
    () => (startDateFilter ? tours.filter((tour) => tour.startDate === startDateFilter) : []),
    [startDateFilter, tours],
  );

  // read client query param to prefill clientFilter and cityFilter when navigating from ClientsPage
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const clientId = params.get('client');
    if (clientId) {
      const sel = clients.find((c) => c.id === clientId);
      if (sel) {
        setClientFilter(sel.name);
        setCityFilter(sel.city ?? '');
      }
    }
  }, [location.search, clients]);

  const handleCreate = (event) => {
    event.preventDefault();
    onCreateTour({
      ...form,
      price: Number(form.price) || 0,
      seats: Number(form.seats) || 0,
      excursions: parseListField(form.excursions),
      services: parseListField(form.services),
      assignedClientIds: [],
    });
    setForm(emptyTour);
  };

  const handleUpdate = () => {
    const target = defaultTour;
    if (!target) return;

    onUpdateTour(target.id, {
      ...target,
      title: `${target.title} (обновлено)`,
    });
  };

  const canEdit = currentUser?.role === 'leader';
  const hasDateFilterResult = startDateFilter ? priceByDateTours.length > 0 : true;

  return (
    <section className="page-shell wide-content">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Сведения о путевках</p>
            <h2>Каталог и поиск путёвок</h2>
          </div>
          <span className="count-badge">{visibleTours.length} доступно</span>
        </div>

        <div className="filter-grid">
          <label style={{ display: 'grid', gap: 8 }}>
            Город
            <input
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Например, Сочи"
              style={{ marginTop: 8 }}
            />
          </label>
          <label style={{ display: 'grid', gap: 8 }}>
            Клиент
            <input
              list="clients-list"
              value={clientFilter}
              onChange={(event) => {
                const name = event.target.value;
                setClientFilter(name);
                const sel = clients.find((c) => c.name === name);
                setCityFilter(sel?.city ?? '');
              }}
              placeholder="Введите ФИО клиента или выберите"
              style={{ marginTop: 8 }}
            />
            <datalist id="clients-list">
              {clients.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
          <label style={{ display: 'grid', gap: 8 }}>
            Дата начала
            <input type="date" value={startDateFilter} onChange={(event) => setStartDateFilter(event.target.value)} style={{ marginTop: 8 }} />
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={onlyHot} onChange={(event) => setOnlyHot(event.target.checked)} />
            Показать только «горящие»
          </label>
        </div>

        <div className="tour-grid" style={{ marginTop: 12 }}>
          {visibleTours.map((tour) => (
            <div key={tour.id} className="tour-card">
              <Link to={`/tours/${tour.id}`}>
                <div className="tour-image-placeholder">Фото путёвки</div>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Link to={`/tours/${tour.id}`} style={{ textDecoration: 'none' }}>
                  <strong style={{ color: '#0f172a' }}>{tour.title}</strong>
                </Link>
                <div className="meta-row">
                  <span style={{ color: '#64748b' }}>{tour.city} · {formatDate(tour.startDate)}</span>
                  <strong>{formatCurrency(tour.price)}</strong>
                </div>
              </div>
            </div>
          ))}
          {visibleTours.length === 0 ? <p className="empty-state">Путёвки не найдены.</p> : null}
        </div>

        <div className="section-block">
          <h4>Путёвки с заданной датой начала</h4>
          {startDateFilter ? (
            hasDateFilterResult ? (
              <ul className="bullet-list">
                {priceByDateTours.map((tour) => (
                  <li key={tour.id}>
                    {tour.title} — {tour.city}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">Путёвок на выбранную дату нет.</p>
            )
          ) : (
            <p className="muted-text">Выберите дату начала, чтобы увидеть совпадения.</p>
          )}
        </div>

        <div className="section-block">
          <h4>«Горящие» путёвки</h4>
          <p className="muted-text">
            Это путёвки, где дата отправления не более чем на 5 дней больше текущей.
          </p>
          <div className="chips-row">
            {hotTours.map((tour) => (
              <span key={tour.id} className="chip">
                {tour.city} · {formatDate(tour.startDate)}
              </span>
            ))}
          </div>
        </div>
      </article>

      <article className="panel">
        {canEdit ? (
          <div className="section-block">
            <h4>Создание и редактирование путёвок</h4>
            <form className="form-grid" onSubmit={handleCreate}>
              <label>
                Город
                <input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  required
                />
              </label>
              <label>
                Название
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label>
                Стоимость
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  required
                />
              </label>
              <label>
                Дата начала
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  required
                />
              </label>
              <label>
                Дата возвращения
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                  required
                />
              </label>
              <label>
                Мест
                <input
                  type="number"
                  min="1"
                  value={form.seats}
                  onChange={(event) => setForm((current) => ({ ...current, seats: event.target.value }))}
                />
              </label>
              <label className="full-width">
                Описание
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <label className="full-width">
                Экскурсии через запятую
                <input
                  value={form.excursions}
                  onChange={(event) => setForm((current) => ({ ...current, excursions: event.target.value }))}
                  placeholder="Музеи, прогулки, дегустация"
                />
              </label>
              <label className="full-width">
                Услуги через запятую
                <input
                  value={form.services}
                  onChange={(event) => setForm((current) => ({ ...current, services: event.target.value }))}
                  placeholder="Завтраки, трансфер"
                />
              </label>
              <button type="submit" className="primary-button wide-button">
                Создать путёвку
              </button>
              <button type="button" className="secondary-button wide-button" onClick={handleUpdate}>
                Быстрое редактирование выбранной
              </button>
              <button
                type="button"
                className="danger-button wide-button"
                onClick={() => false}
                disabled
              >
                Удалить выбранную путёвку
              </button>
            </form>
          </div>
        ) : (
          <p className="muted-text">Просматривайте каталог путёвок. Авторизуйтесь, чтобы управлять путёвками.</p>
        )}
      </article>
    </section>
  );
};

export default ToursPage;


