import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🛑 Skip auth check if guest mode
    useEffect(() => {
        const guestUser = localStorage.getItem('guestUser');

        if (guestUser) {
            setUser(JSON.parse(guestUser));
            setLoading(false);
            return;
        }

        const checkAuthStatus = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8080/api/auth/me',
                    { withCredentials: true }
                );
                setUser(response.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.user) {
            setUser(response.data.user);
            localStorage.removeItem('guestUser');
        }
        return response.data;
    };

    // ✅ Guest Login (DEV ONLY)
    const guestLogin = (role) => {
        const fakeUser = {
            firstName: 'Guest',
            lastName: role.replace('_', ' '),
            role: role.toUpperCase()
        };

        localStorage.setItem('guestUser', JSON.stringify(fakeUser));
        setUser(fakeUser);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('guestUser');
            setUser(null);
        }
    };

    const register = async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                logout,
                register,
                guestLogin,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};