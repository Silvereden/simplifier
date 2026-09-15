import React, { useState } from 'react';
import type { DeliveryNote } from '../types';
import { Truck, Printer, Eye, CheckCircle2, Clock, X } from 'lucide-react';

export const Deliveries: React.FC = () => {
  // Démo de Bons de Livraison
  const [deliveries] = useState<DeliveryNote[]>([
    {
      id: 'bl-1',
      bl_number: 'BL-2026-08001',
      po_number: 'PO-MARJANE-2026-001',
      customer_name: 'MARJANE HOLDING - TETOUAN',
      customer_ice: '001524893000045',
      address: 'Route de Sebta, Tétouan',
      city: 'Tétouan',
      date: '16/08/2026',
      driver_name: 'Karim (Camion Frigo #2)',
      status: 'EN_COURS',
      items: [
        { designation: 'Sac de Glace Alimentaire 5 Kg', quantity: 100, unit: 'Sacs' },
        { designation: 'Sac de Glace Alimentaire 2 Kg', quantity: 50, unit: 'Sacs' },
      ],
    },
    {
      id: 'bl-2',
      bl_number: 'BL-2026-08002',
      po_number: 'PO-LABELVIE-2026-004',
      customer_name: 'LABEL\'VIE MARTIL',
      customer_ice: '001524893000088',
      address: 'Avenue Mohamed V',
      city: 'Martil',
      date: '15/08/2026',
      driver_name: 'Ahmed (Camion Frigo #1)',
      status: 'LIVRE',
      items: [
        { designation: 'Sac de Glace Alimentaire 10 Kg', quantity: 80, unit: 'Sacs' },
      ],
    },
  ]);

  const [selectedBL, setSelectedBL] = useState<DeliveryNote | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bons de Livraison (BL)</h1>
          <p className="text-slate-500 text-sm">Suivi des expéditions et impression des bons pour les chauffeurs</p>
        </div>
      </div>

      {/* Tableau des BL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">N° Bon de Livraison</th>
              <th className="p-4">N° PO Associé</th>
              <th className="p-4">Client</th>
              <th className="p-4">Chauffeur</th>
              <th className="p-4">Date</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {deliveries.map((bl) => (
              <tr key={bl.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-blue-800 flex items-center gap-2">
                  <Truck size={16} />
                  {bl.bl_number}
                </td>
                <td className="p-4 text-slate-600 font-medium">{bl.po_number}</td>
                <td className="p-4 font-semibold text-slate-900">{bl.customer_name}</td>
                <td className="p-4 text-slate-600">{bl.driver_name}</td>
                <td className="p-4 text-slate-500">{bl.date}</td>
                <td className="p-4">
                  {bl.status === 'LIVRE' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} /> Livré
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock size={12} /> En cours
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedBL(bl)}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    <Eye size={14} />
                    Aperçu / Imprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL / DOCUMENT BL IMPRIMABLE */}
      {selectedBL && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative space-y-6 print:p-0 print:shadow-none print:max-w-none">
            
            {/* Boutons d'action Modal (masqués à l'impression) */}
            <div className="flex justify-between items-center border-b pb-4 print:hidden">
              <h2 className="text-lg font-bold text-slate-800">Aperçu du Bon de Livraison</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  <Printer size={16} /> Imprimer le BL
                </button>
                <button
                  onClick={() => setSelectedBL(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* EN-TÊTE DU BL OFFICIEL GLACEMATIC */}
            <div className="border border-slate-300 p-6 rounded-xl space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-blue-900 tracking-wider">GLACEMATIC SARL</h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Fabrication & Distribution de Glace Alimentaire
                  </p>
                  <p className="text-xs text-slate-400">Zone Industrielle, Tétouan - Maroc</p>
                  <p className="text-xs text-slate-400">ICE : 002983748000031 | IF : 5039281</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                    Bon de Livraison
                  </span>
                  <p className="text-lg font-bold text-slate-900 mt-2">{selectedBL.bl_number}</p>
                  <p className="text-xs text-slate-500">Date : {selectedBL.date}</p>
                </div>
              </div>

              {/* DÉTAILS CLIENT ET COMMANDE */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-700 uppercase mb-1">Informations Client :</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedBL.customer_name}</p>
                  <p className="text-slate-600">{selectedBL.address}</p>
                  <p className="text-slate-600">{selectedBL.city}</p>
                  {selectedBL.customer_ice && (
                    <p className="text-slate-500 mt-1 font-semibold">ICE Client : {selectedBL.customer_ice}</p>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-700 uppercase mb-1">Logistique & Commande :</p>
                  <p><span className="font-semibold text-slate-700">Réf. Bon de Commande :</span> {selectedBL.po_number}</p>
                  <p><span className="font-semibold text-slate-700">Livreur / Transport :</span> {selectedBL.driver_name}</p>
                </div>
              </div>

              {/* TABLEAU DES MARCHANDISES */}
              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 border-r border-slate-200">Désignation Produit</th>
                    <th className="p-2.5 border-r border-slate-200 text-center">Unité</th>
                    <th className="p-2.5 text-center">Quantité Livrée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedBL.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-800 border-r border-slate-200">{item.designation}</td>
                      <td className="p-2.5 text-center text-slate-600 border-r border-slate-200">{item.unit}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ZONES DE SIGNATURE ET CACHET */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center">
                <div className="border border-slate-300 rounded-lg p-4 h-28 flex flex-col justify-between">
                  <p className="font-bold text-slate-700">Nom & Signature du Chauffeur :</p>
                  <p className="text-slate-400 text-[10px]">Glacematic SARL</p>
                </div>
                <div className="border border-slate-300 rounded-lg p-4 h-28 flex flex-col justify-between">
                  <p className="font-bold text-slate-700">Cachet & Signature du Client Réceptionnaire :</p>
                  <p className="text-slate-400 text-[10px]">Mention : "Reçu en bon état"</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};