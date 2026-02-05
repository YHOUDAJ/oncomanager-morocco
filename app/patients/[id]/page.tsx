"use client";

import React, { useState, use } from 'react';
import { usePatient } from '../../../hooks/usePatients';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function PatientDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: patient, isLoading, error } = usePatient(id);
  const [activeTab, setActiveTab] = useState('generale');

  if (isLoading) return <div className="text-center py-20">Chargement...</div>;
  if (error || !patient) return <div className="text-center py-20 text-red-600">Patient non trouvé</div>;

  const tabs = [
    { id: 'generale', label: 'Informations Générales' },
    { id: 'medical', label: 'Dossier Médical' },
    { id: 'consultations', label: 'Consultations' },
    { id: 'traitements', label: 'Traitements' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
          {patient.nom[0]}{patient.prenom[0]}
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className="text-2xl font-bold text-slate-900">{patient.nom.toUpperCase()} {patient.prenom}</h2>
          <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Né(e) le {format(parseISO(patient.dateNaissance as string), 'dd MMMM yyyy', { locale: fr })}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
              CIN: {patient.cin || 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/patients/${id}/modifier`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium">Modifier</button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm">Nouvelle Consultation</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <nav className="flex px-4" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'generale' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Téléphone</span><span className="font-medium">{patient.telephone}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Email</span><span className="font-medium">{patient.email || '-'}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Ville</span><span className="font-medium">{patient.ville || '-'}</span></div>
                  <div className="pt-2"><span className="text-slate-500 block mb-1">Adresse</span><span className="font-medium">{patient.adresse || '-'}</span></div>
                </div>
              </section>
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Couverture Médicale</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Mutuelle</span><span className="font-medium">{patient.mutuelle || 'Sans mutuelle'}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500">N° CNSS</span><span className="font-medium">{patient.numeroCNSS || '-'}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Groupe Sanguin</span><span className="font-medium text-red-600">{patient.groupeSanguin?.replace('_', ' ') || '-'}</span></div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-8">
              <section>
                <h4 className="text-sm font-bold text-slate-800 mb-3 bg-indigo-50 p-2 rounded">Antécédents & Allergies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Allergies</span>
                    <p className="text-slate-700">{patient.allergies || 'Aucune allergie signalée'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Médicaux/Chirurgicaux</span>
                    <p className="text-slate-700">{patient.antecedentsMedicaux || '-'}</p>
                  </div>
                </div>
              </section>
              <section>
                <h4 className="text-sm font-bold text-slate-800 mb-3 bg-red-50 p-2 rounded">Informations Oncologiques</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Diagnostic</span>
                    <p className="font-bold text-red-700">{patient.diagnosticPrincipal || 'Non défini'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Stade</span>
                    <p className="font-bold">{patient.stade || '-'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Type Histologique</span>
                    <p className="text-sm">{patient.typeHistologique || '-'}</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <p className="text-slate-500">Aucune consultation enregistrée pour le moment.</p>
              <button className="mt-4 text-blue-600 font-medium">+ Ajouter une consultation</button>
            </div>
          )}

          {['traitements', 'documents'].includes(activeTab) && (
            <div className="text-center py-10 text-slate-400 italic">Section en cours de développement</div>
          )}
        </div>
      </div>
    </div>
  );
};
