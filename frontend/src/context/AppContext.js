import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoUser, initialMockData } from '../data/mockData';

const STORAGE_KEY = 'tourFirm.demoState.v1';

const AppContext = createContext(null);

const readStoredState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

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
  };
};

const nextId = (prefix, items) => {
  const suffix = items.length + 1;
  return `${prefix}-${suffix}-${Date.now().toString(36)}`;
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(createInitialState);


  const fetchAndSetData = async () => {
    try {
      const base = 'http://127.0.0.1:8000';
      const [clientsRes, toursRes, salesRes, employeesRes] = await Promise.all([
        fetch(`${base}/api/clients`),
        fetch(`${base}/api/tours`),
        fetch(`${base}/api/sales`),
        fetch(`${base}/api/employees`),
      ]);

      if (!clientsRes.ok || !toursRes.ok || !salesRes.ok || !employeesRes.ok) return;

      const clientsJson = await clientsRes.json();
      const toursJson = await toursRes.json();
      const salesJson = await salesRes.json();
      const employeesJson = await employeesRes.json();

      const mappedClients = clientsJson.map((c) => {
        const clientSales = salesJson.filter((s) => s.client_id === c.id);
        const historyTourIds = clientSales.map((s) => String(s.tour_id));
        return {
          id: String(c.id),
          name: c.name,
          city: c.city || '',
          phone: c.phone || '',
          email: c.email || '',
          historyTourIds,
          discountPercent: c.regular_customer ? 10 : 0,
        };
      });

      const mappedTours = toursJson.map((t) => {
        const assignedClientIds = salesJson.filter((s) => s.tour_id === t.id).map((s) => String(s.client_id));
        return {
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
          assignedClientIds,
          images: (t.images || []).map((img) => ({ url: `${base}${img.url}`, id: img.id, is_primary: img.is_primary })),
        };
      });

      const mappedSales = salesJson.map((s) => ({
        id: String(s.id),
        date: s.date ? String(s.date).split('T')[0] : null,
        tourId: String(s.tour_id),
        clientId: String(s.client_id),
        quantity: s.quantity || 1,
        services: s.services || [],
      }));

      // keep existing `managers` state shape by selecting only employees with role === 'manager'
      const mappedManagers = (employeesJson || [])
        .filter((e) => !e.role || e.role === 'manager')
        .map((m) => ({
          id: String(m.id),
          name: m.name,
          email: m.email || '',
          phone: m.phone || '',
          status: m.status || 'active',
        }));

      setState((current) => ({ ...current, clients: mappedClients, tours: mappedTours, sales: mappedSales, managers: mappedManagers }));
    } catch (e) {
      // silent fallback to stored or mock data
    }
  };

  useEffect(() => {
    fetchAndSetData();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentUser: state.currentUser,
        managers: state.managers,
        clients: state.clients,
        tours: state.tours,
        sales: state.sales,
      }),
    );
  }, [state]);

  const actions = useMemo(
    () => ({
      signInAsLeader: () => setState((current) => ({ ...current, currentUser: demoUser })),
      signIn: async (email, password) => {
        try {
          const base = 'http://127.0.0.1:8000';
          const res = await fetch(`${base}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) throw new Error('Auth failed');
          const user = await res.json();
          const mapped = {
            id: String(user.id),
            name: user.name,
            email: user.email || '',
            role: user.role || 'manager',
            position: user.role === 'leader' ? 'Руководитель' : 'Менеджер',
          };
          setState((current) => ({ ...current, currentUser: mapped }));
          return mapped;
        } catch (e) {
          console.error('Sign in failed', e);
          throw e;
        }
      },
      signOut: () => setState((current) => ({ ...current, currentUser: null })),
      // reset demo data from initial mock (useful when mockData.js was changed)
      resetDemoData: () =>
        setState(() => ({
          currentUser: null,
          managers: initialMockData.managers,
          clients: initialMockData.clients,
          tours: initialMockData.tours,
          sales: initialMockData.sales,
        })),
      createClient: (client) => {
        (async () => {
          try {
            const res = await fetch('http://127.0.0.1:8000/api/clients', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: client.name, city: client.city, phone: client.phone, email: client.email, regular_customer: false }),
            });
            if (!res.ok) throw new Error('Failed to create client');
            const created = await res.json();
            const mapped = {
              id: String(created.id),
              name: created.name,
              city: created.city || '',
              phone: created.phone || '',
              email: created.email || '',
              historyTourIds: created.historyTourIds ?? [],
              discountPercent: created.regular_customer ? 10 : 0,
            };
            setState((current) => ({ ...current, clients: [...current.clients, mapped] }));
            return;
          } catch (e) {
            setState((current) => ({
              ...current,
              clients: [
                ...current.clients,
                {
                  id: nextId('c', current.clients),
                  historyTourIds: [],
                  discountPercent: 0,
                  ...client,
                },
              ],
            }));
          }
        })();
      },
      updateClient: (clientId, client) => {
        (async () => {
          try {
            const base = 'http://127.0.0.1:8000';
            const res = await fetch(`${base}/api/clients/${clientId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: client.name, city: client.city, phone: client.phone, email: client.email, regular_customer: client.regular_customer ?? false }),
            });
            if (!res.ok) throw new Error('Failed to update client');
            const updated = await res.json();
            const mapped = {
              id: String(updated.id),
              name: updated.name,
              city: updated.city || '',
              phone: updated.phone || '',
              email: updated.email || '',
              historyTourIds: updated.historyTourIds ?? [],
              discountPercent: updated.regular_customer ? 10 : 0,
            };
            setState((current) => ({ ...current, clients: current.clients.map((c) => (c.id === String(mapped.id) ? { ...c, ...mapped } : c)) }));
            return;
          } catch (e) {
            // local fallback: update in-memory
            setState((current) => ({ ...current, clients: current.clients.map((c) => (c.id === clientId ? { ...c, ...client } : c)) }));
          }
        })();
      },
      removeClient: (clientId) => {
        (async () => {
          try {
            const base = 'http://127.0.0.1:8000';
            const res = await fetch(`${base}/api/clients/${clientId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete client');
            setState((current) => ({ ...current, clients: current.clients.filter((c) => c.id !== clientId) }));
            return;
          } catch (e) {
            // fallback to local removal
            setState((current) => ({ ...current, clients: current.clients.filter((c) => c.id !== clientId) }));
          }
        })();
      },
      reloadData: () => {
        fetchAndSetData();
      },
      addClientToTour: (tourId, clientId) =>
        setState((current) => ({
          ...current,
          tours: current.tours.map((tour) =>
            tour.id === tourId && !tour.assignedClientIds.includes(clientId)
              ? { ...tour, assignedClientIds: [...tour.assignedClientIds, clientId] }
              : tour,
          ),
          clients: current.clients.map((client) => {
            if (client.id !== clientId) return client;
            // compute new history (avoid duplicates)
            const newHistory = client.historyTourIds.includes(tourId)
              ? client.historyTourIds
              : [...client.historyTourIds, tourId];
            // assign discount based on business rule: >=3 tours => 10%
            const newDiscount = newHistory.length >= 3 ? 10 : 0;
            return { ...client, historyTourIds: newHistory, discountPercent: newDiscount };
          }),
        })),
      removeClientFromTour: (tourId, clientId) =>
        setState((current) => ({
          ...current,
          tours: current.tours.map((tour) =>
            tour.id === tourId
              ? { ...tour, assignedClientIds: tour.assignedClientIds.filter((id) => id !== clientId) }
              : tour,
          ),
        })),
      createTour: (tour) =>
        setState((current) => ({
          ...current,
          tours: [
            ...current.tours,
            {
              id: nextId('t', current.tours),
              assignedClientIds: [],
              ...tour,
            },
          ],
        })),
      updateTour: (tourId, tour) =>
        setState((current) => ({
          ...current,
          tours: current.tours.map((item) => (item.id === tourId ? { ...item, ...tour } : item)),
        })),
      deleteTour: (tourId) =>
        setState((current) => ({
          ...current,
          tours: current.tours.filter((tour) => tour.id !== tourId),
          clients: current.clients.map((client) => ({
            ...client,
            historyTourIds: client.historyTourIds.filter((id) => id !== tourId),
          })),
          sales: current.sales.filter((sale) => sale.tourId !== tourId),
        })),
      addManager: (manager) => {
        (async () => {
          try {
            const base = 'http://127.0.0.1:8000';
            const res = await fetch(`${base}/api/employees`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: manager.name, email: manager.email, phone: manager.phone, password: manager.password, role: 'manager' }),
            });
            if (!res.ok) throw new Error('Failed to create manager');
            const created = await res.json();
            const mapped = { id: String(created.id), name: created.name, email: created.email || '', phone: created.phone || '', status: created.status || 'active' };
            setState((current) => ({ ...current, managers: [...current.managers, mapped] }));
            return;
          } catch (e) {
            // fallback to local-only behavior
            setState((current) => ({
              ...current,
              managers: [
                ...current.managers,
                {
                  id: nextId('m', current.managers),
                  status: 'active',
                  ...manager,
                },
              ],
            }));
          }
        })();
      },
      updateManager: (managerId, manager) => {
        (async () => {
          try {
            const base = 'http://127.0.0.1:8000';
            const res = await fetch(`${base}/api/employees/${managerId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: manager.name, email: manager.email, phone: manager.phone, password: manager.password, role: 'manager' }),
            });
            if (!res.ok) throw new Error('Failed to update manager');
            const updated = await res.json();
            const mapped = { id: String(updated.id), name: updated.name, email: updated.email || '', phone: updated.phone || '', status: updated.status || 'active' };
            setState((current) => ({ ...current, managers: current.managers.map((m) => (m.id === String(mapped.id) ? { ...m, ...mapped } : m)) }));
            return;
          } catch (e) {
            // fallback to local update
            setState((current) => ({ ...current, managers: current.managers.map((m) => (m.id === managerId ? { ...m, ...manager } : m)) }));
          }
        })();
      },
      removeManager: (managerId) => {
        (async () => {
          try {
            const base = 'http://127.0.0.1:8000';
            const res = await fetch(`${base}/api/employees/${managerId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete manager');
            setState((current) => ({ ...current, managers: current.managers.filter((manager) => manager.id !== managerId) }));
            return;
          } catch (e) {
            // fallback to local removal
            setState((current) => ({ ...current, managers: current.managers.filter((manager) => manager.id !== managerId) }));
          }
        })();
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [actions, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
};

