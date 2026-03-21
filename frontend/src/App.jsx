import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Prompts     from './pages/Prompts';
import Favorites   from './pages/Favorites';
import Profile     from './pages/Profile';
import Analytics   from './pages/Analytics';
import Collections from './pages/Collections';
import Explore     from './pages/Explore';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#161b22',
              color: '#e6edf3',
              border: '1px solid #30363d',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#39d353', secondary: '#161b22' } },
            error:   { iconTheme: { primary: '#f78166', secondary: '#161b22' } },
          }}
        />
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/prompts"     element={<Prompts />} />
            <Route path="/favorites"   element={<Favorites />} />
            <Route path="/analytics"   element={<Analytics />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/explore"     element={<Explore />} />
            <Route path="/profile"     element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
