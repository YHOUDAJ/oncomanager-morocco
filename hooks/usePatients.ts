
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient } from '../types';

// In a real Next.js app, these would call fetch('/api/patients/...')
// For the functional demo, we'll simulate the backend store in localStorage
const STORAGE_KEY = 'onco_patients_v1';

const getStoredPatients = (): Patient[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const savePatients = (patients: Patient[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};

export const usePatients = (filters?: any) => {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      // Simulate API lag
      await new Promise(r => setTimeout(r, 400));
      let patients = getStoredPatients().filter(p => !p.isArchived);
      
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        patients = patients.filter(p => 
          p.nom.toLowerCase().includes(q) || 
          p.prenom.toLowerCase().includes(q) || 
          p.cin?.toLowerCase().includes(q) ||
          p.telephone.includes(q)
        );
      }
      
      return patients;
    }
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 200));
      const p = getStoredPatients().find(p => p.id === id);
      if (!p) throw new Error("Patient non trouvé");
      return p;
    },
    enabled: !!id
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const patients = getStoredPatients();
      const newPatient: Patient = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdById: 'user-1',
        cabinetId: 'cab-1',
        isArchived: false,
      };
      patients.push(newPatient);
      savePatients(patients);
      return newPatient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
};

export const useArchivePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const patients = getStoredPatients();
      const index = patients.findIndex(p => p.id === id);
      if (index > -1) {
        patients[index].isArchived = true;
        savePatients(patients);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
};
