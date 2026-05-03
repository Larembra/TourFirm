import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { formatCurrency } from '../utils/date';
import { useApp } from '../context/AppContext';

const emptyClient = {
  name: '',
  city: '',
  phone: '',
  email: '',
  discountPercent: 0,
};

const ClientsPage = ({ clients, tours, currentUser, onCreateClient }) => {
  const [cityFilter, setCityFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [form, setForm] = useState(emptyClient);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const cities = useMemo(
    () => Array.from(new Set(clients.map((client) => client.city))).sort((left, right) => left.localeCompare(right, 'ru')),
    [clients],
  );

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [clients],
  );

  const filteredClients = useMemo(
    () =>
      sortedClients.filter((client) => {
        const cityMatch = cityFilter ? client.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
        const nameMatch = nameFilter ? client.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
        return cityMatch && nameMatch;
      }),
    [sortedClients, cityFilter, nameFilter],
  );

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  useEffect(() => {
    // clamp current page
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage]);

  // ensure a selected client exists when filtered list changes
  useEffect(() => {
    if (!selectedClientId || !filteredClients.find((c) => c.id === selectedClientId)) {
      setSelectedClientId(filteredClients[0]?.id ?? '');
    }
  }, [filteredClients]);

  const selectedClient = filteredClients.find((client) => client.id === selectedClientId) ?? filteredClients[0] ?? null;

  const clientHistory = useMemo(() => {
    if (!selectedClient) {
      return [];
    }

    return selectedClient.historyTourIds
      .map((tourId) => tours.find((tour) => tour.id === tourId))
      .filter(Boolean);
  }, [selectedClient, tours]);


  const handleModalSubmit = (event) => {
    event.preventDefault();
    // enforce business rules: new client starts with empty history and 0% discount
    const newClient = { ...form, discountPercent: 0, historyTourIds: [] };
    onCreateClient(newClient);
    setForm(emptyClient);
    setIsCreateOpen(false);
  };

  const handleModalClose = () => {
    setIsCreateOpen(false);
    setForm(emptyClient);
  };

  const canManage = Boolean(currentUser);
  const { resetDemoData } = useApp();
  const navigate = useNavigate();

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
            Предпочитаемый город
            <input
              list="cities-list"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Введите город или начните искать"
              style={{ display: 'block', marginTop: 8 }}
            />
          </label>
          <datalist id="cities-list">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <label style={{ display: 'block', marginTop: 8 }}>
            По имени
            <input
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              placeholder="Введите имя клиента"
              style={{ display: 'block', marginTop: 8 }}
            />
          </label>

          <div style={{ marginTop: 8 }}>
            <button type="button" className="link-button" onClick={resetDemoData}>
              Сбросить демо-данные
            </button>
          </div>
        </div>

        <div className="stack-list">
          <div className="scroll-area">
            {pagedClients.map((client) => (
              <button
                key={client.id}
                type="button"
                className={`list-card ${selectedClient?.id === client.id ? 'active' : ''}`}
                onClick={() => setSelectedClientId(client.id)}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                    <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</strong>
                    {(client.historyTourIds?.length ?? 0) >= 3 ? (
                      <span className="role-badge permanent-badge" style={{ display: 'inline-flex', padding: '6px 10px', fontSize: 12 }}>Постоянный клиент</span>
                    ) : null}
                  </div>
                  <span style={{ marginLeft: 12, whiteSpace: 'nowrap' }}>
                    {client.city} · {(client.historyTourIds?.length ?? 0) >= 3 ? 'скидка 10%' : 'Скидка 0%'}
                  </span>
                </div>
              </button>
            ))}
            {filteredClients.length === 0 ? <p className="empty-state">Клиенты не найдены.</p> : null}
          </div>

          {/* pagination + create button area */}
          <div className="pagination-row" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <button
              type="button"
              className="tab-button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Пред.
            </button>
            <div style={{ padding: '6px 10px' }}>
              Стр. {currentPage} / {totalPages}
            </div>
            <button
              type="button"
              className="tab-button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              След.
            </button>
            <div style={{ marginLeft: 'auto' }}>
              {canManage ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setForm(emptyClient);
                    setIsCreateOpen(true);
                  }}
                >
                  Создать клиента
                </button>
              ) : (
                <p className="muted-text">Создание клиентов доступно после авторизации.</p>
              )}
            </div>
          </div>
        </div>
      </article>

      <article className="panel">
        {selectedClient ? (
          <>
            <p className="eyebrow">Карточка клиента</p>
            <h3>{selectedClient.name}</h3>
            {(selectedClient.historyTourIds?.length ?? 0) >= 3 ? (
              <div className="role-badge permanent-badge" style={{ display: 'inline-block', marginTop: 8 }}>Постоянный клиент</div>
            ) : null}
            <p/>
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
                <strong className="email-field">{selectedClient.email}</strong>
              </div>
                <div>
                <span>Скидка</span>
                <strong>{(selectedClient.historyTourIds?.length ?? 0) >= 3 ? 10 : 0}%</strong>
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
            {/* Add to tour button - navigates to Tours page and pre-fills client */}
            {selectedClient ? (
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate(`/tours?client=${selectedClient.id}`)}
                >
                  Добавить к путёвке
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="empty-state">Выберите клиента из списка.</p>
        )}


        {/* modal is rendered into document.body via portal (see below) */}
        {isCreateOpen && ReactDOM.createPortal(
          <div className="modal-overlay" onClick={handleModalClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>Создать клиента</h2>
              <form onSubmit={handleModalSubmit} className="form-grid">
                <div className="form-row">
                  <label>ФИО</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Город</label>
                  <input
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Телефон</label>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                {/* discount is assigned automatically based on history; managers cannot set it here */}

                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="secondary-button" onClick={handleModalClose}>
                    Отмена
                  </button>
                  <button type="submit" className="primary-button">
                    Создать
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
      </article>
    </section>

  );
};

export default ClientsPage;

