import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export default function ProtectedRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const check = isAuthenticated();
    setAuth(check);
    setAuthChecked(true);
  }, []);

  if (!authChecked)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 animate-pulse text-lg">Checking access...</p>
      </div>
    );

  if (!auth) return <Navigate to="/login" replace />;

  return children;
}
