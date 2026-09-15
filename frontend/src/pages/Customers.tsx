import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Customer } from '../types';
import { Plus, Building2, Phone, Mail, MapPin } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Erreur de chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Clients</h1>
          <p className="text-slate-500 text-sm">Liste des grandes surfaces, hôtels et partenaires</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition">
          <Plus size={16} />
          Nouveau Client
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Chargement des clients...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((cli) => (
            <div key={cli.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {cli.code}
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg mt-1">{cli.company_name}</h3>
                </div>
                <Building2 className="text-slate-400" size={20} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {cli.ice && <p><span className="font-semibold text-slate-700">ICE :</span> {cli.ice}</p>}
                <p className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {cli.city}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};