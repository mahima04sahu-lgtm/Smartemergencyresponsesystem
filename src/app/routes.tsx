import { createBrowserRouter, Navigate } from 'react-router';
import { Landing } from './pages/Landing';
import { CreateSystem } from './pages/CreateSystem';
import { EnterSystem } from './pages/EnterSystem';
import { Dashboard } from './pages/Dashboard';
import { EmergencyReport } from './pages/EmergencyReport';
import { History } from './pages/History';
import { StaffManagement } from './pages/StaffManagement';
import { Locations } from './pages/Locations';
import { Settings } from './pages/Settings';
import { GuestComplaint } from './pages/GuestComplaint';
import { MainLayout } from './components/MainLayout';

export const router = createBrowserRouter([
  // ── Public Pages ──────────────────────────────────────────
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/create-system',
    element: <CreateSystem />,
  },
  {
    path: '/enter-system',
    element: <EnterSystem />,
  },
  {
    // Legacy: redirect old /login to enter-system
    path: '/login',
    element: <Navigate to="/enter-system" replace />,
  },
  {
    // QR Code guest complaint page — publicly accessible
    path: '/complaint/:systemId',
    element: <GuestComplaint />,
  },
  {
    path: '/complaint',
    element: <GuestComplaint />,
  },
  // ── Authenticated App Pages (wrapped in MainLayout) ───────
  {
    // Pathless layout route — renders Sidebar + Outlet for all children
    element: <MainLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/emergency-report',
        element: <EmergencyReport />,
      },
      {
        path: '/history',
        element: <History />,
      },
      {
        path: '/staff-management',
        element: <StaffManagement />,
      },
      {
        path: '/locations',
        element: <Locations />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
]);
