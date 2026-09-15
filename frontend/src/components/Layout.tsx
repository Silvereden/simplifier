import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Truck, 
  Package, 
  LogOut, 
  Snowflake 
} from 'lucide-react';

export const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Redirection vers la page de connexion
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { path: '/customers', label: 'Clients', icon: Users },
    { path: '/orders', label: 'Commandes (PO)', icon: ShoppingBag },
    { path: '/deliveries', label: 'Bons de Livraison (BL)', icon: Truck },
    { path: '/products', label: 'Produits', icon: Package },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Barre Latérale (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* Logo & Titre */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Snowflake size={24} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wider text-white">GLACEMATIC</h1>
              <p className="text-[10px] text-slate-400 font-medium">Gestion Logistique</p>
            </div>
          </div>

          {/* Menu de Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bouton Déconnexion */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>

      {/* Contenu Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête supérieur (Header) */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Glacematic Web App v1.0
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <span className="text-sm font-semibold text-slate-700">Admin Glacematic</span>
          </div>
        </header>

        {/* Injection dynamique de la page active */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};