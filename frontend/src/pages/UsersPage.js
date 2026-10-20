import React from 'react';

const UsersPage = () => {
  const users = [
    {
      id: 'USR-001',
      name: 'Dr. Sarah Chen',
      email: 'admin@robovault.edu',
      role: 'ADMIN',
      department: 'Robotics & Mechatronics Lab',
      accessLevel: 'Full System Control (Approvals, Assets, Config)'
    },
    {
      id: 'USR-002',
      name: 'Alex Rivera',
      email: 'assistant@robovault.edu',
      role: 'ASSISTANT',
      department: 'Laboratory Operations',
      accessLevel: 'Issue/Receive Hardware, Diagnostics, Maintenance Logs'
    },
    {
      id: 'USR-003',
      name: 'John Doe',
      email: 'student@robovault.edu',
      role: 'STUDENT',
      department: 'Autonomous Systems Capstone',
      accessLevel: 'Catalog Search, Hardware Request, Incident Reports'
    },
    {
      id: 'USR-004',
      name: 'Maya Lin',
      email: 'maya.lin@student.edu',
      role: 'STUDENT',
      department: 'UAV & Aerial Robotics',
      accessLevel: 'Catalog Search, Hardware Request, Incident Reports'
    }
  ];

  return (
    <div className="page-content">
      <div className="control-bar">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Laboratory Personnel & Access Permissions</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Role-Based Access Control matrix for Faculty, Staff Engineers, and Student Researchers
          </p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-title">
          <h3>Authorized Lab Users</h3>
        </div>
        <table className="responsive-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department / Group</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="mono-font" style={{ color: '#38bdf8' }}>{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="role-pill">{u.role}</span>
                </td>
                <td>{u.department}</td>
                <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{u.accessLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;

