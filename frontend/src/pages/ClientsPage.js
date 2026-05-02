import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../utils/date';

const emptyClient = {
  name: '',
  city: '',
  phone: '',
  email: '',
  discountPercent: 0,
};

const ClientsPage = ({ clients, tours, currentUser, onCreateClient }) => {
  const [cityFilter, setCityFilter] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? '');
  const [form, setForm] = useState(emptyClient);

  const cities = useMemo(
    () => Array.from(new Set(clients.map((client) => client.city))).sort((left, right) => left.localeCompare(right, 'ru')),
    [clients],
  );

  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        cityFilter ? client.city.toLowerCase().includes(cityFilter.toLowerCase()) : true,
      ),
    [clients, cityFilter],
  );

  const selectedClient = filteredClients.find((client) => client.id === selectedClientId) ?? filteredClients[0] ?? null;

  const clientHistory = useMemo(() => {
    if (!selectedClient) {
      return [];
    }

    return selectedClient.historyTourIds
      .map((tourId) => tours.find((tour) => tour.id === tourId))
      .filter(Boolean);
  }, [selectedClient, tours]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreateClient(form);
    setForm(emptyClient);
  };

  const canManage = Boolean(currentUser);

  return (
    <section className="page-shell split-layout">
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Сведения о клиентах</p>
            <h2>Поиск клиентов по городу</h2>
          </div>
          <span className="count-badge">{filteredClients.length} записей</span>
        </div>

        <div className="filter-bar">
          <label>
            Город
            <input
              list="cities-list"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Введите город или начните искать"
            />
          </label>
          <datalist id="cities-list">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        <div className="stack-list scroll-area">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              type="button"
              className={`list-card ${selectedClient?.id === client.id ? 'active' : ''}`}
              onClick={() => setSelectedClientId(client.id)}
            >
              <strong>{client.name}</strong>
              <span>
                {client.city} · скидка {client.discountPercent}%
              </span>
            </button>
          ))}
          {filteredClients.length === 0 ? <p className="empty-state">Клиенты не найдены.</p> : null}
        </div>
      </article>

      <article className="panel">
        {selectedClient ? (
          <>
            <p className="eyebrow">Карточка клиента</p>
            <h3>{selectedClient.name}</h3>
            <div className="detail-grid">
              <div>
                <span>Город</span>
                <strong>{selectedClient.city}</strong>
              </div>
              <div>
                <span>Телефон</span>
                <strong>{selectedClient.phone}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedClient.email}</strong>
              </div>
              <div>
                <span>Скидка</span>
                <strong>{selectedClient.discountPercent}%</strong>
              </div>
            </div>

            <div className="section-block">
              <h4>История путёвок</h4>
              {clientHistory.length > 0 ? (
                <ul className="bullet-list">
                  {clientHistory.map((tour) => (
                    <li key={tour.id}>
                      {tour.city} — {tour.title} ({formatCurrency(tour.price)})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">История пока пуста.</p>
              )}
            </div>
          </>
        ) : (
          <p className="empty-state">Выберите клиента из списка.</p>
        )}

        <div className="section-block">
          <h4>Добавление клиента</h4>
          {canManage ? (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                ФИО
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </label>
              <label>
                Город
                <input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  required
                />
              </label>
              <label>
                Телефон
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>
              <label>
                Скидка, %
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={form.discountPercent}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, discountPercent: Number(event.target.value) }))
                  }
                />
              </label>
              <button type="submit" className="primary-button wide-button">
                Создать клиента
              </button>
            </form>
          ) : (
            <p className="muted-text">Создание клиентов доступно после авторизации.</p>
          )}
        </div>
      </article>
    </section>
  );
};

export default ClientsPage;

