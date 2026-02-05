
export type Sexe = "HOMME" | "FEMME";

export type GroupeSanguin = 
  | "A_POSITIF" | "A_NEGATIF" 
  | "B_POSITIF" | "B_NEGATIF" 
  | "AB_POSITIF" | "AB_NEGATIF" 
  | "O_POSITIF" | "O_NEGATIF";

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: Date | string;
  sexe: Sexe;
  cin?: string | null;
  telephone: string;
  telephoneSecondaire?: string | null;
  email?: string | null;
  adresse?: string | null;
  ville?: string | null;
  numeroCNSS?: string | null;
  mutuelle?: string | null;
  numeroMutuelle?: string | null;
  groupeSanguin?: GroupeSanguin | null;
  allergies?: string | null;
  antecedentsMedicaux?: string | null;
  antecedentsFamiliaux?: string | null;
  medecinTraitant?: string | null;
  diagnosticPrincipal?: string | null;
  dateDecouverteCancer?: Date | string | null;
  stade?: string | null;
  typeHistologique?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdById: string;
  cabinetId: string;
  isArchived: boolean;
  // Computed field for UI
  age?: number;
}
