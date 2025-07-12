import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AlertProvider } from "./contexts/AlertContext";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import ProductDetail from "./pages/ProductDetail";
import Stocktaking from "./pages/Stocktaking";
import Factories from "./pages/Factories";
import { Users } from "./pages/Users";
import Settings from "./pages/Settings";
import InventoryRegister from "./pages/InventoryRegister";
import ErrorBoundary from "./components/ErrorBoundary";
import './App.css';
import { ProtectedPage } from "./components/ProtectedPage";

function AppLayout() {
  return (
  <Layout>
    <ProtectedPage>
      <Outlet />
    </ProtectedPage>
  </Layout>);
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AlertProvider>
          <Router>
            <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
              <Route element={<AppLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/detail/:itemCode" element={<ProductDetail />} />
                <Route path="/inventory/register" element={<InventoryRegister />} />
                <Route path="/stocktaking" element={<Stocktaking />} />
                <Route path="/factories" element={<Factories />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </AlertProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
