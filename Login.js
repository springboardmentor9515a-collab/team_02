import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

function Login() {
    // State to hold email and password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Reusing the simple styles from Register.js
    const inputStyle = { display: 'block', width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box' };
    const containerStyle = { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Call the service; it handles saving the JWT token to localStorage
            await AuthService.login(email, password);
            alert('Login successful! Redirecting to dashboard.');
            navigate('/dashboard'); // Send the user to the protected dashboard
        } catch (error) {
            console.error('Login error:', error);
            // Alert the user if the login failed
            alert('Login failed. Check credentials or server connection.');
        }
    };

    return (
        <div style={containerStyle}>
            <h2>Civix Login</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                
                <button type="submit" style={{ ...inputStyle, backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
                    Sign In
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>Don't have an account? <a href="/register">Register now</a></p>
        </div>
    );
}

export default Login;