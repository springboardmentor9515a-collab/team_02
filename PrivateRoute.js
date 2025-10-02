import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../services/AuthService';

const PrivateRoute = () => {
    // Check if the user object (containing the JWT token) is present
    const user = AuthService.getCurrentUser(); 
    
    // If authenticated (user object exists), render the child component (<Outlet />)
    // If not authenticated, redirect them to the login page.
    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;