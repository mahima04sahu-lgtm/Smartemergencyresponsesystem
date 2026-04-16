import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { EmergencyProvider } from './contexts/EmergencyContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </EmergencyProvider>
    </AuthProvider>
  );
}
