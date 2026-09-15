import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Orders } from './pages/Orders';
import { Deliveries } from './pages/Deliveries';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route de connexion */}
        <Route path="/login" element={<Login />} />

        {/* Routes avec Sidebar & Header (Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/products" element={<div className="font-bold text-xl text-slate-800">Catalogue Produits (À venir)</div>} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;