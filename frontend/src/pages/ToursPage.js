import React, { useMemo, useState } from 'react';
import { formatCurrency, formatDate, isWithinNextDays } from '../utils/date';
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
  const [selectedTourId, setSelectedTourId] = useState(tours[0]?.id ?? '');
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

  const selectedTour = visibleTours.find((tour) => tour.id === selectedTourId) ?? visibleTours[0] ?? null;

  const tourClients = useMemo(() => {
    if (!selectedTour) {
      return [];
    }

    return selectedTour.assignedClientIds
      .map((clientId) => clients.find((client) => client.id === clientId))
      .filter(Boolean);
  }, [clients, selectedTour]);

  const hotTours = useMemo(() => getHotTours(tours), [tours]);
  const priceByDateTours = useMemo(
    () => (startDateFilter ? tours.filter((tour) => tour.startDate === startDateFilter) : []),
    [startDateFilter, tours],
  );

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
    if (!selectedTour) {
      return;
    }

    onUpdateTour(selectedTour.id, {
      ...selectedTour,
      title: `${selectedTour.title} (обновлено)`,
    });
  };

  const canEdit = currentUser?.role === 'leader';
  const hasDateFilterResult = startDateFilter ? priceByDateTours.length > 0 : true;

  return (
    <section className="page-shell split-layout wide-content">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Сведения о путевках</p>
            <h2>Каталог и поиск путёвок</h2>
          </div>
          <span className="count-badge">{visibleTours.length} доступно</span>
        </div>

        <div className="filter-grid">
          <label>
            Город
            <input
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Например, Сочи"
            />
          </label>
          <label>
            Дата начала
            <input type="date" value={startDateFilter} onChange={(event) => setStartDateFilter(event.target.value)} />
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={onlyHot} onChange={(event) => setOnlyHot(event.target.checked)} />
            Показать только «горящие»
          </label>
        </div>

        <div className="stack-list scroll-area">
          {visibleTours.map((tour) => (
            <button
              key={tour.id}
              type="button"
              className={`list-card ${selectedTour?.id === tour.id ? 'active' : ''}`}
              onClick={() => setSelectedTourId(tour.id)}
            >
              <strong>{tour.title}</strong>
              <span>
                {tour.city} · {formatDate(tour.startDate)} · {formatCurrency(tour.price)}
              </span>
            </button>
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
        {selectedTour ? (
          <>
            <p className="eyebrow">Карточка путёвки</p>
            <h3>{selectedTour.title}</h3>
            <p className="muted-text">{selectedTour.description}</p>
            <div className="detail-grid">
              <div>
                <span>Город</span>
                <strong>{selectedTour.city}</strong>
              </div>
              <div>
                <span>Стоимость</span>
                <strong>{formatCurrency(selectedTour.price)}</strong>
              </div>
              <div>
                <span>Начало</span>
                <strong>{formatDate(selectedTour.startDate)}</strong>
              </div>
              <div>
                <span>Возвращение</span>
                <strong>{formatDate(selectedTour.endDate)}</strong>
              </div>
              <div>
                <span>Мест</span>
                <strong>{selectedTour.seats}</strong>
              </div>
              <div>
                <span>Статус</span>
                <strong>{isWithinNextDays(selectedTour.startDate, 5) ? 'Горящая' : 'Стандартная'}</strong>
              </div>
            </div>

            <div className="section-block">
              <h4>Экскурсии</h4>
              <ul className="bullet-list">
                {selectedTour.excursions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="section-block">
              <h4>Услуги</h4>
              <ul className="bullet-list">
                {selectedTour.services.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="section-block">
              <h4>Клиенты путёвки</h4>
              {tourClients.length > 0 ? (
                <ul className="bullet-list">
                  {tourClients.map((client) => (
                    <li key={client.id}>{client.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">Пока никто не закреплён.</p>
              )}
            </div>

            {currentUser ? (
              <div className="section-block">
                <h4>Управление клиентами путёвки</h4>
                <div className="chips-row wrap">
                  {clients.map((client) => {
                    const assigned = selectedTour.assignedClientIds.includes(client.id);

                    return (
                      <button
                        key={client.id}
                        type="button"
                        className={`chip-action ${assigned ? 'danger' : ''}`}
                        onClick={() =>
                          assigned
                            ? onRemoveClientFromTour(selectedTour.id, client.id)
                            : onAddClientToTour(selectedTour.id, client.id)
                        }
                      >
                        {assigned ? 'Удалить' : 'Добавить'} {client.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="empty-state">Выберите путёвку из списка.</p>
        )}

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
                onClick={() => selectedTour && onDeleteTour(selectedTour.id)}
                disabled={!selectedTour}
              >
                Удалить выбранную путёвку
              </button>
            </form>
          </div>
        ) : null}
      </article>
    </section>
  );
};

export default ToursPage;


