import './App.css';
import React, { useEffect, useMemo, useState } from 'react';
import Navigation from './components/Navigation';
import { AppProvider, useApp } from './context/AppContext';
import AppRouter from './routes/AppRouter';

const protectedPages = new Set(['clients', 'tours', 'sales', 'profile']);

const AppShell = () => {
  const app = useApp();
  const [activePage, setActivePage] = useState('home');

  const isAuthenticated = Boolean(app.currentUser);

  useEffect(() => {
    if (!isAuthenticated && protectedPages.has(activePage)) {
      setActivePage('auth');
    }

    if (isAuthenticated && activePage === 'auth') {
      setActivePage('profile');
    }
  }, [activePage, isAuthenticated]);

  const handleNavigate = (page) => {
    if (!isAuthenticated && protectedPages.has(page)) {
      setActivePage('auth');
      return;
    }

    setActivePage(page);
  };

  const handleLogin = () => {
    app.signInAsLeader();
    setActivePage('profile');
  };

  const handleLogout = () => {
    app.signOut();
    setActivePage('home');
  };

  const routerState = useMemo(
    () => ({
      clients: app.clients,
      managers: app.managers,
      sales: app.sales,
      tours: app.tours,
      createClient: app.createClient,
      createTour: app.createTour,
      updateTour: app.updateTour,
      deleteTour: app.deleteTour,
      addClientToTour: app.addClientToTour,
      removeClientFromTour: app.removeClientFromTour,
      addManager: app.addManager,
      removeManager: app.removeManager,
      signInAsLeader: app.signInAsLeader,
    }),
    [app],
  );

  return (
    <div className="app-shell">
      <Navigation
        activePage={activePage}
        user={app.currentUser}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onAuth={() => setActivePage('auth')}
      />
      <main className="app-main">
        <AppRouter
          activePage={activePage}
          setActivePage={setActivePage}
          currentUser={app.currentUser}
          onLogin={handleLogin}
          {...routerState}
        />
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
