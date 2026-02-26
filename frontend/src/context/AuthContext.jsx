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
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                const response = await axios.get(
                    `${apiUrl}/auth/me`,
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

    const login = async (email, password, role) => {
        const response = await api.post('/auth/login', { email, password, role });
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
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};