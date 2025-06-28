import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Stocktaking from "./pages/Stocktaking";
import Factories from "./pages/Factories";
import { Users } from "./pages/Users";
import Settings from "./pages/Settings";
import InventoryRegister from "./pages/InventoryRegister";
import './App.css';

function AppLayout() {
  return <Layout><Outlet /></Layout>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/register" element={<InventoryRegister />} />
          <Route path="/stocktaking" element={<Stocktaking />} />
          <Route path="/factories" element={<Factories />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
