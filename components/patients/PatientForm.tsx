
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientFormValues } from '../../lib/validations/patient';

interface PatientFormProps {
  initialData?: Partial<PatientFormValues>;
  onSubmit: (data: PatientFormValues) => void;
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {
      sexe: 'FEMME',
    }
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const steps = [
    { id: 1, name: 'Identité' },
    { id: 2, name: 'Contact & Couverture' },
    { id: 3, name: 'Antécédents' },
    { id: 4, name: 'Oncologie' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((s, i) => (
            <li key={s.id} className={`relative ${i !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {s.id}
                </div>
                <div className="ml-2 text-xs font-semibold text-slate-500 hidden sm:block">{s.name}</div>
                {i !== steps.length - 1 && (
                  <div className={`absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full bg-slate-200 ${step > s.id ? 'bg-blue-600' : ''}`} style={{ width: '100%', left: '2rem' }}></div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom *</label>
            <input {...register("nom")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
            {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Prénom *</label>
            <input {...register("prenom")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
            {errors.prenom && <p className="mt-1 text-xs text-red-600">{errors.prenom.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date de Naissance *</label>
            <input 
              type="date" 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" 
              onChange={(e) => setValue('dateNaissance', new Date(e.target.value))}
            />
            {errors.dateNaissance && <p className="mt-1 text-xs text-red-600">{errors.dateNaissance.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Sexe *</label>
            <select {...register("sexe")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2">
              <option value="HOMME">Homme</option>
              <option value="FEMME">Femme</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CIN (Facultatif)</label>
            <input {...register("cin")} placeholder="ex: BE123456" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
            {errors.cin && <p className="mt-1 text-xs text-red-600">{errors.cin.message}</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-700">Téléphone *</label>
            <input {...register("telephone")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
            {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input {...register("email")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ville</label>
            <input {...register("ville")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mutuelle</label>
            <input {...register("mutuelle")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Adresse</label>
            <textarea {...register("adresse")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" rows={2} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-700">Groupe Sanguin</label>
            <select {...register("groupeSanguin")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2">
              <option value="">Non connu</option>
              <option value="A_POSITIF">A+</option>
              <option value="A_NEGATIF">A-</option>
              <option value="B_POSITIF">B+</option>
              <option value="B_NEGATIF">B-</option>
              <option value="AB_POSITIF">AB+</option>
              <option value="AB_NEGATIF">AB-</option>
              <option value="O_POSITIF">O+</option>
              <option value="O_NEGATIF">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Allergies</label>
            <textarea {...register("allergies")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" placeholder="Ex: Pénicilline, arachides..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Antécédents Médicaux</label>
            <textarea {...register("antecedentsMedicaux")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" rows={3} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Diagnostic Principal</label>
            <input {...register("diagnosticPrincipal")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" placeholder="Ex: Cancer du sein triple négatif" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Stade</label>
            <input {...register("stade")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" placeholder="Ex: T2N1M0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Type Histologique</label>
            <input {...register("typeHistologique")} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2" />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
        >
          Précédent
        </button>
        <div className="space-x-2">
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer le Dossier'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
