// hooks/usePatients.ts
// Hooks React Query pour les patients - Version API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient } from '@/types';

// Types pour les filtres et la pagination
interface PatientFilters {
  q?: string;
  sexe?: 'HOMME' | 'FEMME';
  ville?: string;
  avecDiagnostic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Fonction utilitaire pour les requêtes API
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
    throw new Error(error.error || `Erreur HTTP ${response.status}`);
  }
  
  return response.json();
}

// Hook: Liste des patients avec pagination et filtres
export const usePatients = (filters: PatientFilters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.q) queryParams.set('q', filters.q);
  if (filters.sexe) queryParams.set('sexe', filters.sexe);
  if (filters.ville) queryParams.set('ville', filters.ville);
  if (filters.avecDiagnostic !== undefined) {
    queryParams.set('avecDiagnostic', String(filters.avecDiagnostic));
  }
  if (filters.page) queryParams.set('page', String(filters.page));
  if (filters.limit) queryParams.set('limit', String(filters.limit));
  if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);
  
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => fetchApi<PaginatedResponse<Patient & { age: number }>>(
      `/api/patients?${queryParams.toString()}`
    ),
    staleTime: 30 * 1000, // 30 secondes
  });
};

// Hook: Détail d'un patient
export const usePatient = (id: string | undefined) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchApi<Patient & { age: number }>(`/api/patients/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook: Création d'un patient
export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'cabinetId' | 'isArchived'>) =>
      fetchApi<Patient>('/api/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalider la liste pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

// Hook: Mise à jour d'un patient
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      fetchApi<Patient>(`/api/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // Invalider le détail du patient et la liste
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

// Hook: Archivage d'un patient
export const useArchivePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ message: string }>(`/api/patients/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, id) => {
      // Invalider le détail du patient et la liste
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

// Hook: Recherche rapide (autocomplete)
export const usePatientSearch = (query: string) => {
  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () => fetchApi<PaginatedResponse<Patient & { age: number }>>(
      `/api/patients?q=${encodeURIComponent(query)}&limit=10`
    ),
    enabled: query.length >= 2,
    staleTime: 10 * 1000, // 10 secondes
  });
};
