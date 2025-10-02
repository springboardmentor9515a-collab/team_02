import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Authentication Screens */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes: Uses PrivateRoute to enforce authentication */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* Placeholder routes for future milestones */}
                    <Route path="/petitions" element={<h1>Petitions List</h1>} /> 
                    <Route path="/polls" element={<h1>Polls List</h1>} /> 
                    <Route path="/reports" element={<h1>Reports</h1>} /> 
                </Route>

                {/* Default route redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </Router>
    );
}

export default App;