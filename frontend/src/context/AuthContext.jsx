import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Use raw axios (NOT the interceptor-wrapped `api`) to avoid
                // triggering the 401 → refresh → redirect loop for session checks
                const response = await axios.get('http://localhost:8080/api/auth/me', {
                    withCredentials: true
                });
                setUser(response.data);
            } catch (error) {
                // 401 means "not logged in" — perfectly fine, just set user to null
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
        }
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            // Don't use window.location.href — it causes full page reload
            // Navigation is handled by the component that calls logout
        }
    };

    const register = async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, register, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
