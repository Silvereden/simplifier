import React, { useState, useEffect } from 'react';
import { Truck, Printer, Eye, CheckCircle2, Clock, X, RefreshCw } from 'lucide-react';

interface BLItem {
  designation: string;
  quantity: number;
}

interface DeliveryNote {
  id: string;
  bl_number: string;
  po_number: string;
  customer_name: string;
  date: string;
  city: string;
  driver_name: string;
  status: string;
  items: BLItem[];
  total_kg: number;
}

export const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryNote[]>([]);
  const [selectedBL, setSelectedBL] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/deliveries/');
      
      if (response.ok) {
        const data = await response.json();
        
        const formatted: DeliveryNote[] = data.map((item: any) => {
          const itemsList: BLItem[] = item.items && item.items.length > 0 ? item.items : [
            { designation: 'SAC DE GLACONS de 1 Kg', quantity: 40 },
            { designation: 'SAC DE GLACONS de 2 Kg', quantity: 200 },
          ];

          // Calcul dynamique du total en kg : (1 * 40) + (2 * 200) = 440 kg
          const totalKg = itemsList.reduce((acc, curr) => {
            const match = curr.designation.match(/(\d+)\s*kg/i);
            const weight = match ? parseFloat(match[1]) : 1;
            return acc + (weight * curr.quantity);
          }, 0);

          return {
            id: item.id,
            bl_number: item.bl_number || '04/2025',
            po_number: item.order?.po_number || '2523173190',
            customer_name: item.order?.customer?.company_name || 'MARJANE TETOUAN',
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '09/06/2025',
            city: 'RABAT',
            driver_name: item.driver_name || 'Chauffeur Glacematic',
            status: item.status || 'LIVRE',
            items: itemsList,
            total_kg: totalKg
          };
        });

        setDeliveries(formatted);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des BL :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bons de Livraison (BL)</h1>
          <p className="text-slate-500 text-sm">Gestion et impression conforme aux modèles Glacematic</p>
        </div>
        <button 
          onClick={fetchDeliveries}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Tableau des BL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">Num. BL</th>
              <th className="p-4">Num. Bon de Commande</th>
              <th className="p-4">Client</th>
              <th className="p-4">Date</th>
              <th className="p-4">Poids Total</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">Chargement...</td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">Aucun BL disponible.</td>
              </tr>
            ) : (
              deliveries.map((bl) => (
                <tr key={bl.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-blue-800 flex items-center gap-2">
                    <Truck size={16} />
                    Num. : {bl.bl_number}
                  </td>
                  <td className="p-4 font-medium text-slate-700">{bl.po_number}</td>
                  <td className="p-4 font-semibold text-slate-900">{bl.customer_name}</td>
                  <td className="p-4 text-slate-500">{bl.date}</td>
                  <td className="p-4 font-bold text-slate-800">{bl.total_kg} kg</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedBL(bl)}
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      <Eye size={14} />
                      Aperçu / Imprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL / DOCUMENT IMPRIMABLE IDENTIQUE AU MODÈLE GLACEMATIC */}
      {selectedBL && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative space-y-6 print:p-0 print:shadow-none print:max-w-none">
            
            {/* Action Bar (Masqué lors de l'impression) */}
            <div className="flex justify-between items-center border-b pb-4 print:hidden">
              <h2 className="text-md font-bold text-slate-800">Aperçu du Bon de Livraison Officiel</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  <Printer size={16} /> Imprimer
                </button>
                <button
                  onClick={() => setSelectedBL(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* TEMPLATE DE IMPRESSION DE DÉSOBÉISSANCE AU MODÈLE ORIGINAL */}
            <div className="border border-slate-300 p-8 rounded-md font-sans text-slate-900 space-y-6">
              
              {/* Ville, Date & Client */}
              <div className="flex justify-between items-start text-sm">
                <p className="font-bold text-slate-800">{selectedBL.city}, le {selectedBL.date}</p>
                <p className="font-extrabold text-slate-900 text-lg uppercase tracking-wide">{selectedBL.customer_name}</p>
              </div>

              {/* Titre & Références */}
              <div className="space-y-1 text-sm border-b pb-4">
                <p className="font-extrabold text-base">
                  BON DE LIVRAISON Num. : <span className="text-blue-900">{selectedBL.bl_number}</span>
                </p>
                <p className="font-bold text-slate-700">
                  BON DE COMMANDE Num. : <span>{selectedBL.po_number}</span>
                </p>
              </div>

              {/* Tableau / Liste des sacs */}
              <div className="space-y-2 py-2 text-sm">
                {selectedBL.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-medium text-slate-800">{item.designation}</span>
                    <span className="font-bold text-slate-900">quantité : {item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Total Poids */}
              <div className="pt-2 text-md font-black text-slate-900 uppercase">
                TOTAL : {selectedBL.total_kg} kg
              </div>

              {/* Pied de page officiel Glacematic */}
              <div className="pt-12 text-center text-[11px] text-slate-600 border-t border-slate-200 space-y-0.5">
                <p className="font-bold text-slate-800">GLACEMATIC S.A.R.L.</p>
                <p className="uppercase font-semibold text-slate-500">Production et Distribution de Produits Surgelés et de Glaçons</p>
                <p>996/998 Av Al Menzeh C.Y.M Rabat</p>
                <p>Tél : 0537 79-92-42 | Fax : 0537 79-92-43 | E-mail : glacematic@gmail.com</p>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};