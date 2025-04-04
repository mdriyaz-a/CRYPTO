import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState, useRef } from 'react'

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const authCheckDone = useRef(false)

  useEffect(() => {
    // Only run this once
    if (authCheckDone.current) return;

    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        console.log('Checking authentication...');
        console.log('Token exists:', !!token);
        console.log('Refresh token exists:', !!refreshToken);

        // Simple check for tokens
        if (token && refreshToken) {
          console.log('Tokens found, considering authenticated');
          setAuthenticated(true);
        } else {
          console.log('No tokens found, not authenticated');
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthenticated(false);
      } finally {
        setChecking(false);
        authCheckDone.current = true;
      }
    };

    // Run immediately
    checkAuth();
  }, []);

  // Show loading state
  if (loading || checking) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  // Render children if authenticated
  return <Outlet />
}

export default ProtectedRoute