import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from '../auth/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AssetsPage from '../pages/AssetsPage';
import CheckoutsPage from '../pages/CheckoutsPage';
import MaintenancePage from '../pages/MaintenancePage';
import ProjectsPage from '../pages/ProjectsPage';
import FaultsPage from '../pages/FaultsPage';
import UsersPage from '../pages/UsersPage';
import ActivityLogsPage from '../pages/ActivityLogsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="checkouts" element={<CheckoutsPage />} />
        <Route
          path="maintenance"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'LAB_ASSISTANT']}>
              <MaintenancePage />
            </RoleGuard>
          }
        />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="faults" element={<FaultsPage />} />
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <UsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="activity-logs"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'LAB_ASSISTANT']}>
              <ActivityLogsPage />
            </RoleGuard>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

