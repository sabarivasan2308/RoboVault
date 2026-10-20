import React from 'react';

const Navbar = ({ activeTab, currentUser, setCurrentUser }) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Laboratory Command Center', subtitle: 'Real-time telemetry, equipment availability & service metrics' };
      case 'assets':
        return { title: 'Robotics & Hardware Assets', subtitle: 'Manage microcontrollers, sensors, motors, and lab instrumentation' };
      case 'checkouts':
        return { title: 'Equipment Checkout & Custody', subtitle: 'Issue, approve, and track hardware returns with condition checks' };
      case 'maintenance':
        return { title: 'Maintenance & Service History', subtitle: 'Track hardware faults, repairs, technician logs and spare part costs' };
      case 'projects':
        return { title: 'Project Allocations', subtitle: 'Bind robotic components and sensors to research & capstone projects' };
      case 'faults':
        return { title: 'Fault & Defect Reporting', subtitle: 'Submit diagnostic alerts for damaged or malfunctioning lab hardware' };
      case 'users':
        return { title: 'Laboratory Access & Users', subtitle: 'Manage researchers, lab assistants, and faculty permissions' };
      default:
        return { title: 'RoboVault', subtitle: 'Robotics Lab Asset Platform' };
    }
  };

  const usersList = [
    { name: 'Dr. Sarah Chen', role: 'ADMIN', email: 'admin@robovault.edu' },
    { name: 'Alex Rivera', role: 'ASSISTANT', email: 'assistant@robovault.edu' },
    { name: 'John Doe', role: 'STUDENT', email: 'student@robovault.edu' },
  ];

  const { title, subtitle } = getTabTitle();

  return (
    <header className="top-navbar">
      <div className="page-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="nav-actions">
        <div className="user-selector">
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Role Persona:</span>
          <select
            value={currentUser.email}
            onChange={(e) => {
              const selected = usersList.find((u) => u.email === e.target.value);
              if (selected) setCurrentUser(selected);
            }}
          >
            {usersList.map((u) => (
              <option key={u.email} value={u.email}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

