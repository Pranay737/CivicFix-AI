import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { TrackComplaintPage } from '../pages/public/TrackComplaintPage';

// Citizen pages
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { ReportIssuePage } from '../pages/citizen/ReportIssuePage';
import { ComplaintDetailPage } from '../pages/citizen/ComplaintDetailPage';

// Officer pages
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';
import { OfficerDetailPage } from '../pages/officer/OfficerDetailPage';

// Dept Admin pages
import { DeptAdminDashboard } from '../pages/dept-admin/DeptAdminDashboard';
import { DeptAnalyticsPage } from '../pages/dept-admin/DeptAnalyticsPage';
import { DeptMapPage } from '../pages/dept-admin/DeptMapPage';

// System Admin pages
import { SysAdminDashboard } from '../pages/sys-admin/SysAdminDashboard';
import { UserManagementPage } from '../pages/sys-admin/UserManagementPage';
import { KnowledgeBasePage } from '../pages/sys-admin/KnowledgeBasePage';
import { SlaSettingsPage } from '../pages/sys-admin/SlaSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/track" element={<TrackComplaintPage />} />

        {/* Citizen Routes */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <ReportIssuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/complaints/:id"
          element={
            <ProtectedRoute
              allowedRoles={['CITIZEN', 'DEPARTMENT_ADMIN', 'SYSTEM_ADMIN', 'OFFICER']}
            >
              <ComplaintDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Generic shortcut for detail link */}
        <Route
          path="/complaints/:id"
          element={
            <ProtectedRoute
              allowedRoles={['CITIZEN', 'DEPARTMENT_ADMIN', 'SYSTEM_ADMIN', 'OFFICER']}
            >
              <ComplaintDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Officer Routes */}
        <Route
          path="/officer"
          element={
            <ProtectedRoute allowedRoles={['OFFICER']}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['OFFICER', 'SYSTEM_ADMIN']}>
              <OfficerDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Department Admin Routes */}
        <Route
          path="/dept-admin"
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN', 'SYSTEM_ADMIN']}>
              <DeptAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dept-admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN', 'SYSTEM_ADMIN']}>
              <DeptAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dept-admin/map"
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN', 'SYSTEM_ADMIN']}>
              <DeptMapPage />
            </ProtectedRoute>
          }
        />

        {/* System Admin Routes */}
        <Route
          path="/sys-admin"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <SysAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sys-admin/users"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sys-admin/kb"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <KnowledgeBasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sys-admin/sla"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <SlaSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
