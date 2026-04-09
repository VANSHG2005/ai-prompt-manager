import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Prompts = lazy(() => import('./pages/Prompts'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Collections = lazy(() => import('./pages/Collections'));
const Explore = lazy(() => import('./pages/Explore'));

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
          <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/"         element={<Landing />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes — redirects to /login if not authenticated */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard"   element={<Dashboard />} />
                <Route path="/prompts"     element={<Prompts />} />
                <Route path="/favorites"   element={<Favorites />} />
                <Route path="/analytics"   element={<Analytics />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/explore"     element={<Explore />} />
                <Route path="/profile"     element={<Profile />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
