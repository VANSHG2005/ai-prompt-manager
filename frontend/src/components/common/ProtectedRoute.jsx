import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Spinner';

const ProtectedRoute = () => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <PageLoader />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
