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
      createClient: (client) =>
        setState((current) => ({
          ...current,
          clients: [
            ...current.clients,
            {
              id: nextId('c', current.clients),
              historyTourIds: [],
              // discount is assigned automatically based on history; new clients start with 0
              discountPercent: 0,
              ...client,
            },
          ],
        })),
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
      addManager: (manager) =>
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
        })),
      removeManager: (managerId) =>
        setState((current) => ({
          ...current,
          managers: current.managers.filter((manager) => manager.id !== managerId),
        })),
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

