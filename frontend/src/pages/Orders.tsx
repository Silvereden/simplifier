import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, CheckCircle2, Truck, Plus } from 'lucide-react';
import { ImportPOModal } from '../components/ImportPOModal';

interface Order {
  id: string;
  po_number: string;
  customer?: {
    company_name: string;
  };
  client_name?: string;
  total_amount: number;
  status: string;
  created_at?: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger la liste réelle des commandes depuis le backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/orders/');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Conversion PO -> BL via FastAPI
  const handleConvertToBL = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/orders/${orderId}/convert-to-bl`, {
        method: 'POST',
      });

      if (response.ok) {
        alert("Bon de Livraison (BL) généré avec succès !");
        fetchOrders(); // Rafraîchit le tableau après conversion
      } else {
        alert("Erreur lors de la génération du Bon de Livraison.");
      }
    } catch (error) {
      console.error("Erreur lors de la conversion :", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bons de Commande (PO)</h1>
          <p className="text-slate-500 text-sm">Gestion des commandes clients et conversion en Bon de Livraison</p>
        </div>
        
        {/* Bouton connecté à la modale */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition cursor-pointer"
        >
          <Plus size={16} />
          Importer / Saisir un PO
        </button>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">N° Bon de Commande</th>
              <th className="p-4">Client</th>
              <th className="p-4">Montant Total</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Chargement des commandes...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Aucun bon de commande trouvé. Importez votre premier document !
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-blue-700 flex items-center gap-2">
                    <FileText size={16} />
                    {ord.po_number}
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    {ord.customer?.company_name || ord.client_name || "Client"}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {Number(ord.total_amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                  </td>
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
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fenêtre modale d'importation PDF/Word */}
      <ImportPOModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </div>
  );
};