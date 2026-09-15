import React, { useState } from 'react';
import { FileText, ArrowRight, CheckCircle2, Truck, Plus } from 'lucide-react';

export const Orders: React.FC = () => {
  // Démo de commandes en attente de conversion
  const [orders, setOrders] = useState([
    {
      id: '1',
      po_number: 'PO-MARJANE-2026-001',
      client: 'Marjane Holding',
      date: '16/08/2026',
      total: '4,500.00 DH',
      items: '150 Sacs de Glace 5kg',
      status: 'PENDING'
    },
    {
      id: '2',
      po_number: 'PO-LABELVIE-2026-004',
      client: 'Label\'Vie',
      date: '15/08/2026',
      total: '2,800.00 DH',
      items: '80 Sacs de Glace 10kg',
      status: 'CONVERTED'
    }
  ]);

  const handleConvertToBL = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'CONVERTED' };
      }
      return order;
    }));
    alert("Bon de Livraison (BL) généré avec succès !");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bons de Commande (PO)</h1>
          <p className="text-slate-500 text-sm">Gestion des commandes clients et conversion en Bon de Livraison</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition">
          <Plus size={16} />
          Importer / Saisir un PO
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">N° Bon de Commande</th>
              <th className="p-4">Client</th>
              <th className="p-4">Articles</th>
              <th className="p-4">Montant Total</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                <td className="p-4 font-bold text-blue-700 flex items-center gap-2">
                  <FileText size={16} />
                  {ord.po_number}
                </td>
                <td className="p-4 font-semibold text-slate-800">{ord.client}</td>
                <td className="p-4 text-slate-600">{ord.items}</td>
                <td className="p-4 font-bold text-slate-900">{ord.total}</td>
                <td className="p-4">
                  {ord.status === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      En attente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} /> Converti en BL
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {ord.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleConvertToBL(ord.id)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition shadow-sm"
                    >
                      <Truck size={14} />
                      Générer BL
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button className="text-xs text-blue-600 font-semibold hover:underline">
                      Voir le BL
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};