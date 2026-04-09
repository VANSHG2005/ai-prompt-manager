import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Collections from './pages/Collections';
import Explore from './pages/Explore';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '9px',
                fontFamily: '"Geist", "Helvetica Neue", sans-serif',
                fontSize: '13.5px',
                fontWeight: 400,
                boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                padding: '10px 14px',
              },
              success: { iconTheme: { primary: '#3A6B5A', secondary: '#ffffff' } },
              error:   { iconTheme: { primary: '#C4441A', secondary: '#ffffff' } },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/"         element={<Landing />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — redirects to /login if not authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard"   element={<Dashboard />} />
                <Route path="/prompts"     element={<Prompts />} />
                <Route path="/favorites"   element={<Favorites />} />
                <Route path="/analytics"   element={<Analytics />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/explore"     element={<Explore />} />
                <Route path="/profile"     element={<Profile />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
