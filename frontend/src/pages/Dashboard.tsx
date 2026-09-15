import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Truck, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: "Chiffre d'Affaires (Mois)",
      value: '148 500 DH',
      change: '+12.5%',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      title: 'Commandes (PO)',
      value: '42',
      change: '+8%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'bg-indigo-500',
    },
    {
      title: 'Bons de Livraison (BL)',
      value: '38',
      change: '+15%',
      isPositive: true,
      icon: Truck,
      color: 'bg-emerald-500',
    },
    {
      title: 'Clients Actifs',
      value: '18',
      change: '0%',
      isPositive: true,
      icon: Users,
      color: 'bg-amber-500',
    },
  ];

  const recentOrders = [
    { id: 'PO-MARJANE-2026-001', client: 'MARJANE HOLDING', total: '12 500 DH', status: 'CONFIRMED' },
    { id: 'PO-LABELVIE-2026-004', client: "LABEL'VIE MARTIL", total: '8 400 DH', status: 'DELIVERED' },
    { id: 'PO-ACIMA-2026-002', client: 'ACIMA TETOUAN', total: '5 100 DH', status: 'PENDING' },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord</h1>
          <p className="text-slate-500 text-sm">Vue d'ensemble de l'activité Glacematic</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/orders"
            className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-medium px-4 py-2 rounded-xl text-sm shadow-sm transition"
          >
            <Plus size={16} /> Nouvelle Commande
          </Link>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2.5 rounded-xl text-white ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                <span className={`inline-flex items-center text-xs font-bold ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dernières Commandes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Commandes Récentes</h2>
          <Link to="/orders" className="text-blue-700 hover:underline text-xs font-semibold">
            Voir tout →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="py-3 flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold text-slate-900">{order.id}</p>
                <p className="text-xs text-slate-500">{order.client}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{order.total}</p>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};