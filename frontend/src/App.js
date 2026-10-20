import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import CheckoutsPage from './pages/CheckoutsPage';
import MaintenancePage from './pages/MaintenancePage';
import ProjectsPage from './pages/ProjectsPage';
import FaultsPage from './pages/FaultsPage';
import UsersPage from './pages/UsersPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Sarah Chen',
    role: 'ADMIN',
    email: 'admin@robovault.edu'
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'assets':
        return <AssetsPage currentUser={currentUser} />;
      case 'checkouts':
        return <CheckoutsPage currentUser={currentUser} />;
      case 'maintenance':
        return <MaintenancePage currentUser={currentUser} />;
      case 'projects':
        return <ProjectsPage currentUser={currentUser} />;
      case 'faults':
        return <FaultsPage currentUser={currentUser} />;
      case 'users':
        return <UsersPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
      />
      <div className="main-wrapper">
        <Navbar
          activeTab={activeTab}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;

