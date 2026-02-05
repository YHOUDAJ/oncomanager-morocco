
import React from 'react';
import { PatientForm } from '../../../components/patients/PatientForm';
import { useCreatePatient } from '../../../hooks/usePatients';

export const CreatePatient = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const createMutation = useCreatePatient();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      onNavigate('#/patients');
    } catch (error) {
      alert("Erreur lors de la création du patient");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => onNavigate('#/patients')}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Nouveau Dossier Patient</h2>
          <p className="text-slate-500 text-sm">Remplissez les informations pour créer un nouveau dossier</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Formulaire de Patient</h3>
        </div>
        <div className="p-8">
          <PatientForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
        </div>
      </div>
    </div>
  );
};
