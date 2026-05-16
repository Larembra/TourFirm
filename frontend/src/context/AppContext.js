import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoUser, initialMockData } from '../data/mockData';

const STORAGE_KEY = 'tourFirm.demoState.v1';
const AppContext = createContext(null);

const readStoredState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const createInitialState = () => {
  const stored = readStoredState();
  return {
    currentUser: stored?.currentUser ?? null,
    managers: stored?.managers ?? initialMockData.managers,
    clients: stored?.clients ?? initialMockData.clients,
    tours: stored?.tours ?? initialMockData.tours,
    sales: stored?.sales ?? initialMockData.sales,
    token: stored?.token ?? null,
  };
};

const nextId = (prefix, items) => `${prefix}-${items.length + 1}-${Date.now().toString(36)}`;

const normalizePhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) return photo;
  if (photo.startsWith('/static/')) return `http://127.0.0.1:8000${photo}`;
  if (photo.startsWith('static/')) return `http://127.0.0.1:8000/${photo}`;
  return photo;
};

const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return res.blob();
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(createInitialState);

  const fetchAndSetData = async () => {
    try {
      const base = 'http://127.0.0.1:8000';
      const authHeader = state.token ? { Authorization: `Bearer ${state.token}` } : {};

      const [clientsRes, toursRes, salesRes, employeesRes] = await Promise.all([
        fetch(`${base}/api/clients`, { headers: { ...authHeader } }),
        fetch(`${base}/api/tours`, { headers: { ...authHeader } }),
        fetch(`${base}/api/sales`, { headers: { ...authHeader } }),
        fetch(`${base}/api/employees`, { headers: { ...authHeader } }),
      ]);

      if (!clientsRes.ok || !toursRes.ok || !salesRes.ok || !employeesRes.ok) return;

      const clientsJson = await clientsRes.json();
      const toursJson = await toursRes.json();
      const salesJson = await salesRes.json();
      const employeesJson = await employeesRes.json();

      const mappedClients = clientsJson.map((c) => {
        const clientSales = salesJson.filter((s) => s.client_id === c.id);
        return {
          id: String(c.id),
          name: c.name,
          city: c.city || '',
          phone: c.phone || '',
          email: c.email || '',
          historyTourIds: clientSales.map((s) => String(s.tour_id)),
          discountPercent: c.regular_customer ? 10 : 0,
        };
      });

      const mappedTours = toursJson.map((t) => ({
        id: String(t.id),
        city: t.city,
        title: t.title,
        price: t.price,
        startDate: t.start_date || t.startDate,
        endDate: t.end_date || t.endDate,
        description: t.description,
        seats: t.seats,
        excursions: t.excursions ?? [],
        services: (t.services || []).map((s) => ({ id: String(s.id), name: s.name, cost: s.cost })),
        assignedClientIds: salesJson.filter((s) => s.tour_id === t.id).map((s) => String(s.client_id)),
        images: (t.images || []).map((img) => ({ url: `${base}${img.url}`, id: img.id, is_primary: img.is_primary })),
      }));

      const mappedSales = salesJson.map((s) => ({
        id: String(s.id),
        date: s.date ? String(s.date).split('T')[0] : null,
        tourId: String(s.tour_id),
        clientId: String(s.client_id),
        quantity: s.quantity || 1,
        services: s.services || [],
      }));

      const mappedManagers = (employeesJson || [])
        .filter((e) => !e.role || e.role === 'manager')
        .map((m) => ({
          id: String(m.id),
          name: m.name,
          email: m.email || '',
          phone: m.phone || '',
          photo: normalizePhotoUrl(m.photo || null),
          status: m.status || 'active',
        }));

      setState((current) => {
        let newCurrent = current.currentUser;
        if (current.currentUser) {
          const found = employeesJson.find((emp) => String(emp.id) === String(current.currentUser.id));
          if (found) {
            newCurrent = {
              ...current.currentUser,
              name: found.name,
              email: found.email || current.currentUser.email,
              phone: found.phone || current.currentUser.phone,
              photo: normalizePhotoUrl(found.photo || current.currentUser.photo || null),
              role: found.role || current.currentUser.role,
              position: (found.role || current.currentUser.role) === 'leader' ? 'Руководитель' : 'Менеджер',
            };
          }
        }
        return { ...current, clients: mappedClients, tours: mappedTours, sales: mappedSales, managers: mappedManagers, currentUser: newCurrent };
      });
    } catch (e) {
      // silent fallback
    }
  };

  useEffect(() => {
    fetchAndSetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentUser: state.currentUser,
        managers: state.managers,
        clients: state.clients,
        tours: state.tours,
        sales: state.sales,
        token: state.token ?? null,
      }),
    );
  }, [state]);

  const actions = useMemo(() => {
    const authHeaders = (contentType = true) => ({ ...(contentType ? { 'Content-Type': 'application/json' } : {}), ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}) });

    return {
      signInAsLeader: () => setState((current) => ({ ...current, currentUser: demoUser })),

      signIn: async (email, password) => {
        const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Auth failed');
        const data = await res.json();
        const user = data.user ?? data;
        const token = data.access_token ?? null;
        const mapped = {
          id: String(user.id),
          name: user.name,
          email: user.email || '',
          phone: user.phone || '',
          photo: normalizePhotoUrl(user.photo ?? null),
          role: user.role || 'manager',
          position: user.role === 'leader' ? 'Руководитель' : 'Менеджер',
        };
        setState((current) => ({ ...current, currentUser: mapped, token }));
        return mapped;
      },

      signOut: () => setState((current) => ({ ...current, currentUser: null, token: null })),

      resetDemoData: () =>
        setState(() => ({
          currentUser: null,
          managers: initialMockData.managers,
          clients: initialMockData.clients,
          tours: initialMockData.tours,
          sales: initialMockData.sales,
          token: null,
        })),

      reloadData: () => fetchAndSetData(),

      createClient: (client) => {
        (async () => {
          try {
            const res = await fetch('http://127.0.0.1:8000/api/clients', {
              method: 'POST',
              headers: authHeaders(true),
              body: JSON.stringify({ name: client.name, city: client.city, phone: client.phone, email: client.email, regular_customer: false }),
            });
            if (!res.ok) throw new Error('Failed to create client');
            const created = await res.json();
            setState((current) => ({
              ...current,
              clients: [...current.clients, { id: String(created.id), name: created.name, city: created.city || '', phone: created.phone || '', email: created.email || '', historyTourIds: [], discountPercent: created.regular_customer ? 10 : 0 }],
            }));
          } catch (e) {
            setState((current) => ({
              ...current,
              clients: [...current.clients, { id: nextId('c', current.clients), historyTourIds: [], discountPercent: 0, ...client }],
            }));
          }
        })();
      },

      updateClient: (clientId, client) => {
        (async () => {
          try {
            const res = await fetch(`http://127.0.0.1:8000/api/clients/${clientId}`, {
              method: 'PUT',
              headers: authHeaders(true),
              body: JSON.stringify({ name: client.name, city: client.city, phone: client.phone, email: client.email, regular_customer: client.regular_customer ?? false }),
            });
            if (!res.ok) throw new Error('Failed to update client');
            const updated = await res.json();
            setState((current) => ({
              ...current,
              clients: current.clients.map((c) =>
                c.id === String(updated.id)
                  ? { ...c, id: String(updated.id), name: updated.name, city: updated.city || '', phone: updated.phone || '', email: updated.email || '', discountPercent: updated.regular_customer ? 10 : 0 }
                  : c,
              ),
            }));
          } catch (e) {
            setState((current) => ({ ...current, clients: current.clients.map((c) => (c.id === clientId ? { ...c, ...client } : c)) }));
          }
        })();
      },

      removeClient: (clientId) => {
        (async () => {
          try {
            const res = await fetch(`http://127.0.0.1:8000/api/clients/${clientId}`, { method: 'DELETE', headers: authHeaders(false) });
            if (!res.ok) throw new Error('Failed to delete client');
            setState((current) => ({ ...current, clients: current.clients.filter((c) => c.id !== clientId) }));
          } catch (e) {
            setState((current) => ({ ...current, clients: current.clients.filter((c) => c.id !== clientId) }));
          }
        })();
      },

      addClientToTour: (tourId, clientId) =>
        setState((current) => ({
          ...current,
          tours: current.tours.map((tour) => (tour.id === tourId && !tour.assignedClientIds.includes(clientId) ? { ...tour, assignedClientIds: [...tour.assignedClientIds, clientId] } : tour)),
          clients: current.clients.map((client) => {
            if (client.id !== clientId) return client;
            const newHistory = client.historyTourIds.includes(tourId) ? client.historyTourIds : [...client.historyTourIds, tourId];
            return { ...client, historyTourIds: newHistory, discountPercent: newHistory.length >= 3 ? 10 : 0 };
          }),
        })),

      removeClientFromTour: (tourId, clientId) =>
        setState((current) => ({
          ...current,
          tours: current.tours.map((tour) => (tour.id === tourId ? { ...tour, assignedClientIds: tour.assignedClientIds.filter((id) => id !== clientId) } : tour)),
        })),

      createTour: (tour) =>
        setState((current) => ({ ...current, tours: [...current.tours, { id: nextId('t', current.tours), assignedClientIds: [], ...tour }] })),

      updateTour: (tourId, tour) =>
        setState((current) => ({ ...current, tours: current.tours.map((item) => (item.id === tourId ? { ...item, ...tour } : item)) })),

      deleteTour: (tourId) =>
        setState((current) => ({
          ...current,
          tours: current.tours.filter((tour) => tour.id !== tourId),
          clients: current.clients.map((client) => ({ ...client, historyTourIds: client.historyTourIds.filter((id) => id !== tourId) })),
          sales: current.sales.filter((sale) => sale.tourId !== tourId),
        })),

      addManager: (manager) => {
        (async () => {
          try {
            const res = await fetch('http://127.0.0.1:8000/api/employees/protected', {
              method: 'POST',
              headers: authHeaders(true),
              body: JSON.stringify({ name: manager.name, email: manager.email, phone: manager.phone, password: manager.password, role: 'manager' }),
            });
            if (!res.ok) throw new Error('Failed to create manager');
            const created = await res.json();
            setState((current) => ({ ...current, managers: [...current.managers, { id: String(created.id), name: created.name, email: created.email || '', phone: created.phone || '', status: created.status || 'active' }] }));
          } catch (e) {
            setState((current) => ({
              ...current,
              managers: [...current.managers, { id: nextId('m', current.managers), status: 'active', ...manager }],
            }));
          }
        })();
      },

      updateManager: (managerId, manager) => {
        (async () => {
          try {
            const res = await fetch(`http://127.0.0.1:8000/api/employees/${managerId}`, {
              method: 'PUT',
              headers: authHeaders(true),
              body: JSON.stringify({ name: manager.name, email: manager.email, phone: manager.phone, password: manager.password, role: 'manager' }),
            });
            if (!res.ok) throw new Error('Failed to update manager');
            const updated = await res.json();
            setState((current) => ({
              ...current,
              managers: current.managers.map((m) => (m.id === String(updated.id) ? { ...m, id: String(updated.id), name: updated.name, email: updated.email || '', phone: updated.phone || '', status: updated.status || 'active' } : m)),
            }));
          } catch (e) {
            setState((current) => ({ ...current, managers: current.managers.map((m) => (m.id === managerId ? { ...m, ...manager } : m)) }));
          }
        })();
      },

      updateProfile: (userId, profile) => {
        (async () => {
          try {
            const base = 'http://127.0.0.1:8000';
            let uploadedUrl = null;

            if (profile.photo && typeof profile.photo === 'string' && profile.photo.startsWith('data:')) {
              try {
                const blob = await dataUrlToBlob(profile.photo);
                const fd = new FormData();
                const ext = blob.type?.split('/')?.[1] || 'png';
                fd.append('file', blob, `photo.${ext}`);
                const upRes = await fetch(`${base}/api/employees/${userId}/photo`, {
                  method: 'POST',
                  headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
                  body: fd,
                });
                if (upRes.ok) {
                  const upJson = await upRes.json();
                  uploadedUrl = upJson.url;
                }
              } catch (e) {
                // ignore photo upload errors and continue with profile update
              }
            }

            const bodyPayload = { ...profile };
            delete bodyPayload.photo;
            bodyPayload.role = profile.role ?? state.currentUser?.role ?? 'manager';

            const res = await fetch(`${base}/api/employees/${userId}`, {
              method: 'PUT',
              headers: authHeaders(true),
              body: JSON.stringify(bodyPayload),
            });
            if (!res.ok) throw new Error('Failed to update profile');
            const updated = await res.json();
            const mapped = {
              id: String(updated.id),
              name: updated.name,
              email: updated.email || '',
              phone: updated.phone || '',
              role: updated.role ?? state.currentUser?.role ?? 'manager',
              position: (updated.role ?? state.currentUser?.role) === 'leader' ? 'Руководитель' : 'Менеджер',
              photo: normalizePhotoUrl(uploadedUrl ?? state.currentUser?.photo ?? null),
            };
            setState((current) => ({
              ...current,
              currentUser: mapped,
              managers: current.managers.map((m) => (m.id === String(mapped.id) ? { ...m, name: mapped.name, email: mapped.email, phone: mapped.phone } : m)),
            }));
          } catch (e) {
            setState((current) => ({
              ...current,
              currentUser: {
                ...current.currentUser,
                name: profile.name ?? current.currentUser?.name,
                email: profile.email ?? current.currentUser?.email,
                phone: profile.phone ?? current.currentUser?.phone,
                photo: normalizePhotoUrl(profile.photo ?? current.currentUser?.photo),
              },
              managers: current.managers.map((m) => (m.id === String(userId) ? { ...m, name: profile.name ?? m.name, email: profile.email ?? m.email, phone: profile.phone ?? m.phone } : m)),
            }));
          }
        })();
      },

      removeManager: (managerId) => {
        (async () => {
          try {
            const res = await fetch(`http://127.0.0.1:8000/api/employees/${managerId}`, { method: 'DELETE', headers: authHeaders(false) });
            if (!res.ok) throw new Error('Failed to delete manager');
            setState((current) => ({ ...current, managers: current.managers.filter((manager) => manager.id !== managerId) }));
          } catch (e) {
            setState((current) => ({ ...current, managers: current.managers.filter((manager) => manager.id !== managerId) }));
          }
        })();
      },

      uploadProfilePhoto: (userId, file) => {
        return (async () => {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch(`http://127.0.0.1:8000/api/employees/${userId}/photo`, {
            method: 'POST',
            headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
            body: fd,
          });
          if (!res.ok) throw new Error('Failed to upload photo');
          const data = await res.json();
          setState((current) => ({
            ...current,
            currentUser: current.currentUser ? { ...current.currentUser, photo: normalizePhotoUrl(data.url) } : current.currentUser,
          }));
          return data.url;
        })();
      },
    };
  }, [state.token, state.currentUser]);

  const value = useMemo(() => ({ ...state, ...actions }), [actions, state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};


