import React from 'react';
import AuthService from '../services/AuthService';

function Dashboard() {
    // 1. Get the user data from the AuthService which retrieved it from local storage
    const fullUserData = AuthService.getCurrentUser();
    const user = fullUserData?.user; // This object contains { name, role, location, etc. }

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = '/login'; // Redirect on logout
    };

    if (!user) {
        return <div>Access Denied. Please Login.</div>;
    }

    // 2. CRUCIAL LOGIC: Check the user's role field
    const isOfficial = user.role === 'official';
    
    // Simple inline styles
    const containerStyle = { maxWidth: '900px', margin: '50px auto', padding: '30px', border: '2px solid #007bff', borderRadius: '8px' };
    const roleStyle = { color: isOfficial ? 'green' : '#007bff', fontWeight: 'bold' };
    const navItemStyle = { marginRight: '20px', textDecoration: 'none', color: '#333' };

    return (
        <div style={containerStyle}>
            
            <h1>Welcome to Civix, {user.name}!</h1>
            {/* 3. DISPLAY ROLE & LOCATION */}
            <p>You are logged in as a 
                <span style={roleStyle}>
                    {/* Condition 1: If Official, show "Verified Public Official" */}
                    {isOfficial ? ' Verified Public Official' : ' Citizen'}
                </span> 
                for *{user.location}*.
            </p>
            
            <hr style={{ margin: '20px 0' }} />

            {/* 4. NAVIGATION LINKS (Conditional visibility) */}
            <nav style={{ marginBottom: '20px' }}>
                <a href="/dashboard" style={{ ...navItemStyle, color: 'black' }}>Home</a>
                <a href="/petitions" style={navItemStyle}>Petitions (M2)</a>
                <a href="/polls" style={navItemStyle}>Polls (M3)</a>
                {/* Condition 2: Only render this link if isOfficial is true */}
                {isOfficial && (
                    <a href="/reports" style={{ ...navItemStyle, color: 'red' }}>Reports & Analytics (M4)</a> 
                )}
            </nav>

            {/* 5. CONTEXTUAL MESSAGE (Conditional content) */}
            <div style={{ padding: '20px', backgroundColor: '#f0f8ff', border: '1px dashed #007bff', borderRadius: '5px' }}>
                {isOfficial 
                    ? <h3>Public Official Dashboard: Focus on Reports and governance metrics.</h3>
                    : <h3>Citizen Dashboard: Start creating or signing petitions!</h3>
                }
            </div>

            <button onClick={handleLogout} style={{ marginTop: '25px', backgroundColor: 'red', color: 'white', padding: '10px 15px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                Sign Out
            </button>
        </div>
    );
}

export default Dashboard;