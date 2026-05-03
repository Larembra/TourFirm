import './App.css';
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ClientsPage from './pages/ClientsPage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import SalesPage from './pages/SalesPage';
import ManagersPage from './pages/ManagersPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const app = useApp();
  if (!app.currentUser) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppShell = () => {
  const app = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    app.signInAsLeader();
    navigate('/profile');
  };

  const handleLogout = () => {
    app.signOut();
    navigate('/');
  };

  const routerState = {
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
  };

  return (
    <div className="app-shell">
      <Navigation user={app.currentUser} onLogout={handleLogout} onAuth={() => navigate('/auth')} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage onAuth={() => navigate('/auth')} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsPage
                  clients={routerState.clients}
                  tours={routerState.tours}
                  currentUser={app.currentUser}
                  onCreateClient={routerState.createClient}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tours"
            element={
              <ProtectedRoute>
                <ToursPage
                  tours={routerState.tours}
                  clients={routerState.clients}
                  currentUser={app.currentUser}
                  onCreateTour={routerState.createTour}
                  onUpdateTour={routerState.updateTour}
                  onDeleteTour={routerState.deleteTour}
                  onAddClientToTour={routerState.addClientToTour}
                  onRemoveClientFromTour={routerState.removeClientFromTour}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tours/:id"
            element={<ProtectedRoute><TourDetailPage /></ProtectedRoute>}
          />
          <Route
            path="/managers"
            element={
              <ProtectedRoute>
                <ManagersPage
                  managers={routerState.managers}
                  onAddManager={routerState.addManager}
                  onRemoveManager={routerState.removeManager}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage tours={routerState.tours} sales={routerState.sales} clients={routerState.clients} />
              </ProtectedRoute>
            }
          />
          <Route path="/sales" element={<ProtectedRoute><SalesPage sales={routerState.sales} tours={routerState.tours} clients={routerState.clients} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage currentUser={app.currentUser} managers={routerState.managers} clients={routerState.clients} tours={routerState.tours} sales={routerState.sales} onAddManager={routerState.addManager} onRemoveManager={routerState.removeManager} /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
