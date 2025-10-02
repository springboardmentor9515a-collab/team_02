import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

function Register() {
    // State to hold all five required form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [role, setRole] = useState('citizen'); // Default role is 'citizen'
    const navigate = useNavigate();

    // Simple styles to make the form look organized and save time on CSS
    const inputStyle = { display: 'block', width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box' };
    const containerStyle = { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Call the service with all 5 pieces of data
            await AuthService.register(name, email, password, location, role);
            alert('Registration successful! Redirecting to login.');
            navigate('/login'); // Send the user to the login page
        } catch (error) {
            console.error('Registration error:', error);
            // Display an error message from the backend if available
            alert('Registration failed. ' + (error.response?.data?.message || 'Check network connection or backend server.'));
        }
    };

    return (
        <div style={containerStyle}>
            <h2>Register for Civix</h2>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Full Name (Jane Doe)" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                <input type="email" placeholder="Email (your@email.com)" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                
                {/* LOCATION INPUT - Required for geo-targeting */}
                <input type="text" placeholder="Location (e.g., San Diego, CA)" value={location} onChange={(e) => setLocation(e.target.value)} required style={inputStyle} />
                
                {/* ROLE SELECTION - Required for role-based system */}
                <label style={{ display: 'block', marginTop: '10px' }}>Registering as:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                    <option value="citizen">Citizen</option>
                    <option value="official">Public Official</option>
                </select>
                
                <button type="submit" style={{ ...inputStyle, backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
                    Create Account
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>Already have an account? <a href="/login">Sign in</a></p>
        </div>
    );
}

export default Register;