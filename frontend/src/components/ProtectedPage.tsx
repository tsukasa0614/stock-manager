import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    children: React.ReactNode;
}

export const ProtectedPage: React.FC<Props> = ({ children }) => {
    const { token, user, isAuthenticated } = useAuth();
    
    console.log('ProtectedPage - Auth state:', { 
        token: !!token, 
        user: !!user, 
        isAuthenticated,
        userId: user?.id 
    });
    
    // トークンとユーザー情報の両方が必要
    if (!isAuthenticated || !token || !user) {
        console.log('ProtectedPage - Redirecting to login');
        return <Navigate to="/login" replace />;
    }
    
    console.log('ProtectedPage - Access granted');
    return <>{children}</>;
};