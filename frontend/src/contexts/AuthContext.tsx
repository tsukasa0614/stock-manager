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

    const login = (id: string, password: string) => {
        // TODO: ログイン処理
        setToken("test-token");
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