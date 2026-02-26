import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { user, loading, isAuthenticated } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Convert role strings to generic checks to avoid mismatch issues e.g. CAFE_OWNER vs cafe_owner
    if (requiredRole && user.role?.toUpperCase() !== requiredRole.toUpperCase()) {
        return <Navigate to="/" replace />;
    }

    return children;
}
