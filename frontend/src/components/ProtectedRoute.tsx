import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Page } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div>Please log in to access this page.</div> 
}) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
