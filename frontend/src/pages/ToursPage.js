import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  const [form, setForm] = useState(emptyTour);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState(emptyTour);
  const [editingId, setEditingId] = useState(null);

  const openCreateModal = () => {
    setModalForm(emptyTour);
    setEditingId(null);
    setModalOpen(true);
  };

  const app = useApp();

  const openEditModal = (tour) => {
    setModalForm({
      city: tour.city || '',
      title: tour.title || '',
      price: tour.price || 0,
      startDate: tour.startDate || '',
      endDate: tour.endDate || '',
      description: tour.description || '',
      excursions: (tour.excursions || []).join(', '),
      services: (tour.services || []).map((s) => s.name).join(', '),
      seats: tour.seats || 0,
    });
    setEditingId(tour.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const base = 'http://127.0.0.1:8000';
        const body = {
          city: modalForm.city,
          title: modalForm.title,
          price: Number(modalForm.price) || 0,
          start_date: modalForm.startDate || null,
          end_date: modalForm.endDate || null,
          description: modalForm.description || '',
          seats: Number(modalForm.seats) || 0,
        };
        let tourResp;
        if (editingId) {
          const res = await fetch(`${base}/api/tours/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('Failed to update tour');
          tourResp = await res.json();
        } else {
          const res = await fetch(`${base}/api/tours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('Failed to create tour');
          tourResp = await res.json();
        }

        const tourId = tourResp.id;

        // create services (if provided as lines name:cost or name,cost)
        const svcText = modalForm.services || '';
        const svcLines = svcText.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
        for (const line of svcLines) {
          // parse name:cost or name|cost
          let name = line;
          let cost = 0;
          if (line.includes(':')) {
            const [n, c] = line.split(':');
            name = n.trim();
            cost = Number((c || '').trim()) || 0;
          } else if (line.includes('|')) {
            const [n, c] = line.split('|');
            name = n.trim();
            cost = Number((c || '').trim()) || 0;
          }
          const svcRes = await fetch(`${base}/api/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, cost }),
          });
          if (!svcRes.ok) continue;
          const svcObj = await svcRes.json();
          // attach to tour
          await fetch(`${base}/api/tours/${tourId}/services/${svcObj.id}`, { method: 'POST' });
        }

        // upload image if any
        if (modalForm.imageFile) {
          const form = new FormData();
          form.append('file', modalForm.imageFile);
          await fetch(`${base}/api/tours/${tourId}/images`, { method: 'POST', body: form });
        }

        app.reloadData();
        closeModal();
      } catch (err) {
        console.error(err);
        window.alert('Ошибка при сохранении путёвки');
      }
    })();
  };

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

  const defaultTour = visibleTours[0] ?? null;

  const hotTours = useMemo(() => getHotTours(tours), [tours]);
  const priceByDateTours = useMemo(
    () => (startDateFilter ? tours.filter((tour) => tour.startDate === startDateFilter) : []),
    [startDateFilter, tours],
  );

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
            <div key={tour.id} className="tour-card" style={{ position: 'relative', paddingTop: 32 }}>
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
                <button
                  onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); openEditModal(tour); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    if (!window.confirm('Удалить путёвку?')) return;
                    try {
                      const res = await fetch(`http://127.0.0.1:8000/api/tours/${tour.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Delete failed');
                      app.reloadData();
                    } catch (err) {
                      console.error(err);
                      window.alert('Не удалось удалить путёвку');
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
              <Link to={`/tours/${tour.id}`}>
                {tour.images && tour.images.length > 0 ? (
                  <img src={tour.images[0].url} alt={tour.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div className="tour-image-placeholder">Фото путёвки</div>
                )}
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

      </article>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        {canEdit ? (
          <button className="primary-button" onClick={openCreateModal}>Создать путёвку</button>
        ) : (
          <p className="muted-text">Просматривайте каталог путёвок. Авторизуйтесь, чтобы управлять путёвками.</p>
        )}
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }} onClick={closeModal}>
          <div style={{ width: 760, background: '#fff', borderRadius: 12, padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Редактирование путёвки' : 'Создание путёвки'}</h3>
            <form className="form-grid" onSubmit={handleModalSubmit}>
              <label>
                Город
                <input value={modalForm.city} onChange={(e) => setModalForm((c) => ({ ...c, city: e.target.value }))} required />
              </label>
              <label>
                Название
                <input value={modalForm.title} onChange={(e) => setModalForm((c) => ({ ...c, title: e.target.value }))} required />
              </label>
              <label>
                Стоимость
                <input type="number" min="0" value={modalForm.price} onChange={(e) => setModalForm((c) => ({ ...c, price: e.target.value }))} required />
              </label>
              <label>
                Дата начала
                <input type="date" value={modalForm.startDate} onChange={(e) => setModalForm((c) => ({ ...c, startDate: e.target.value }))} required />
              </label>
              <label>
                Дата возвращения
                <input type="date" value={modalForm.endDate} onChange={(e) => setModalForm((c) => ({ ...c, endDate: e.target.value }))} required />
              </label>
              <label>
                Мест
                <input type="number" min="1" value={modalForm.seats} onChange={(e) => setModalForm((c) => ({ ...c, seats: e.target.value }))} />
              </label>
              <label className="full-width">
                Описание
                <textarea rows="3" value={modalForm.description} onChange={(e) => setModalForm((c) => ({ ...c, description: e.target.value }))} />
              </label>
              <label className="full-width">
                Экскурсии через запятую
                <input value={modalForm.excursions} onChange={(e) => setModalForm((c) => ({ ...c, excursions: e.target.value }))} placeholder="Музеи, прогулки, дегустация" />
              </label>
              <label className="full-width">
                Услуги через запятую
                <input value={modalForm.services} onChange={(e) => setModalForm((c) => ({ ...c, services: e.target.value }))} placeholder="Завтраки, трансфер" />
              </label>
              <label>
                Фото (файл)
                <input type="file" accept="image/*" onChange={(e) => setModalForm((c) => ({ ...c, imageFile: e.target.files && e.target.files[0] }))} />
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit" className="primary-button">{editingId ? 'Сохранить' : 'Создать'}</button>
                <button type="button" className="secondary-button" onClick={closeModal}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ToursPage;


