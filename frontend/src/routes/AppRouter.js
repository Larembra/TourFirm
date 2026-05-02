import React from 'react';
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import ClientsPage from '../pages/ClientsPage';
import ToursPage from '../pages/ToursPage';
import SalesPage from '../pages/SalesPage';
import ProfilePage from '../pages/ProfilePage';

const AppRouter = ({ activePage, setActivePage, currentUser, onLogin, ...state }) => {
  switch (activePage) {
    case 'auth':
      return <AuthPage onLogin={onLogin} />;
    case 'clients':
      return (
        <ClientsPage
          clients={state.clients}
          tours={state.tours}
          currentUser={currentUser}
          onCreateClient={state.createClient}
        />
      );
    case 'tours':
      return (
        <ToursPage
          tours={state.tours}
          clients={state.clients}
          currentUser={currentUser}
          onCreateTour={state.createTour}
          onUpdateTour={state.updateTour}
          onDeleteTour={state.deleteTour}
          onAddClientToTour={state.addClientToTour}
          onRemoveClientFromTour={state.removeClientFromTour}
        />
      );
    case 'sales':
      return <SalesPage sales={state.sales} tours={state.tours} clients={state.clients} />;
    case 'profile':
      return (
        <ProfilePage
          currentUser={currentUser}
          managers={state.managers}
          clients={state.clients}
          tours={state.tours}
          sales={state.sales}
          onAddManager={state.addManager}
          onRemoveManager={state.removeManager}
        />
      );
    case 'home':
    default:
      return <HomePage onAuth={() => setActivePage('auth')} />;
  }
};

export default AppRouter;


