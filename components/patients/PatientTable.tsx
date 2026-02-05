
import React from 'react';
import { Patient } from '../../types';
import { differenceInYears, parseISO } from 'date-fns';

interface PatientTableProps {
  patients: Patient[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({ patients, onView, onEdit, onDelete }) => {
  const calculateAge = (date: string | Date) => {
    const bday = typeof date === 'string' ? parseISO(date) : date;
    return differenceInYears(new Date(), bday);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Âge</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Téléphone</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnostic</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">CIN</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {patients.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">Aucun patient trouvé</td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {patient.nom[0]}{patient.prenom[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-slate-900">{patient.nom.toUpperCase()} {patient.prenom}</div>
                      <div className="text-xs text-slate-500">{patient.sexe === 'FEMME' ? 'Femme' : 'Homme'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {calculateAge(patient.dateNaissance)} ans
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {patient.telephone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {patient.diagnosticPrincipal || 'Non renseigné'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {patient.cin || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => onView(patient.id)} className="text-blue-600 hover:text-blue-900">Voir</button>
                  <button onClick={() => onEdit(patient.id)} className="text-amber-600 hover:text-amber-900">Modifier</button>
                  <button onClick={() => onDelete(patient.id)} className="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
