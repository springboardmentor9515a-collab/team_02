import axios from 'axios';

// IMPORTANT: This path is relative because of the 'proxy' setting in package.json
// It points to the API layer of your Node/Express backend.
const API_URL = '/api/auth/';

const AuthService = {
    // 1. Handles Registration (sends all 5 required fields to backend)
    register: (name, email, password, location, role) => {
        return axios.post(API_URL + 'register', {
            name,
            email,
            password,
            location,
            role,
        });
    },

    // 2. Handles Login and saves the crucial JWT token
    login: (email, password) => {
        return axios.post(API_URL + 'login', {
            email,
            password,
        })
        .then((response) => {
            // Check if the backend returned the token/data
            if (response.data.token && response.data.user) {
                // Save the data to local storage for the entire app to use
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        });
    },

    // 3. Helper function to retrieve the current user's data
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    // 4. Logs out user by removing the token
    logout: () => {
        localStorage.removeItem('user');
    }
};

export default AuthService;