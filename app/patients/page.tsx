
import React, { useState } from 'react';
import { PatientSearch } from '../../components/patients/PatientSearch';
import { PatientTable } from '../../components/patients/PatientTable';
import { DeletePatientDialog } from '../../components/patients/DeletePatientDialog';
import { usePatients, useArchivePatient } from '../../hooks/usePatients';
import { Patient } from '../../types';

export const PatientList = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const { data: response, isLoading } = usePatients({ q: searchQuery, ...filters });
  const patients = response?.data || [];
  const archiveMutation = useArchivePatient();

  const handleDelete = (id: string) => {
    const p = patients.find(p => p.id === id);
    if (p) setPatientToDelete(p);
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      await archiveMutation.mutateAsync(patientToDelete.id);
      setPatientToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Base Patients</h2>
          <p className="text-slate-500 text-sm">Gérez les dossiers médicaux de votre cabinet</p>
        </div>
        <button
          onClick={() => onNavigate('#/patients/nouveau')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Patient
        </button>
      </div>

      <PatientSearch
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Chargement des patients...</p>
        </div>
      ) : (
        <PatientTable
          patients={patients}
          onView={(id) => onNavigate(`#/patients/${id}`)}
          onEdit={(id) => onNavigate(`#/patients/${id}/modifier`)}
          onDelete={handleDelete}
        />
      )}

      <DeletePatientDialog
        isOpen={!!patientToDelete}
        patientName={patientToDelete ? `${patientToDelete.nom} ${patientToDelete.prenom}` : ''}
        onCancel={() => setPatientToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={archiveMutation.isPending}
      />
    </div>
  );
};
