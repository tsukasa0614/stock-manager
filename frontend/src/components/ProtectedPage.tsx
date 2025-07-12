import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

export const ProtectedPage: React.FC<Props> = ({ children }) => {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}