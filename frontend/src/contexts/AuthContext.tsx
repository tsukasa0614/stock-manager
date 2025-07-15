import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginResponse } from '../api/client';
import { apiClient } from '../api/client';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (id: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // アプリ起動時は常にログイン画面から開始
        console.log('AuthProvider - Clearing local storage on startup');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        apiClient.clearToken();
        setToken(null);
        setUser(null);
    }, []);

    const login = async (id: string, password: string) => {
        console.log('AuthContext - Login attempt:', { id });
        
        try {
            // 統合されたログインAPIを使用
            const response = await apiClient.login(id, password);

            console.log('AuthContext - Login response:', response);

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.data || !response.data.token || !response.data.user) {
                throw new Error('ログインレスポンスが無効です');
            }

            console.log('AuthContext - Setting token and user:', response.data);
            
            // トークンとユーザー情報を状態とローカルストレージに保存
            setToken(response.data.token);
            setUser(response.data.user);
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // APIクライアントにトークンを設定
            apiClient.setToken(response.data.token);

            console.log('AuthContext - Login successful, user role:', response.data.user.role);

        } catch (error) {
            console.error('AuthContext - Login failed:', error);
            // エラー時はクリーンアップ
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            apiClient.clearToken();
            throw error;
        }
    };

    const logout = () => {
        console.log('AuthContext - Logout');
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        apiClient.clearToken();
    };

    const isAuthenticated = token !== null && user !== null;
    
    console.log('AuthContext - Current state:', { token: !!token, user: !!user, userRole: user?.role, isAuthenticated });

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};