import { createContext, useState, useContext } from "react";


interface AuthContextProps {
    token: string | null;
    login?: (id: string, password: string) => void;
    logout?: () => void;
}

const AuthContext = createContext<AuthContextProps>({
    token: null,
    login: undefined,
    logout: undefined,
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);

    const login = async (id: string, password: string) => {
        const response = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, password }),
        });

        if(!response.ok) {
            throw new Error('ログインに失敗しました');
        }

        const data = await response.json();
        setToken(data.token);
    };

    const logout = () => {
        setToken(null);
    };
    return (
        <AuthContext.Provider value={{ 
            token, 
            login, 
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};