
import { z } from "zod";

const SexeEnum = z.enum(["HOMME", "FEMME"]);
const GroupeSanguinEnum = z.enum([
  "A_POSITIF", "A_NEGATIF", 
  "B_POSITIF", "B_NEGATIF", 
  "AB_POSITIF", "AB_NEGATIF", 
  "O_POSITIF", "O_NEGATIF"
]);

export const patientSchema = z.object({
  nom: z.string().min(2, "Le nom est obligatoire"),
  prenom: z.string().min(2, "Le prénom est obligatoire"),
  dateNaissance: z.date({
    required_error: "La date de naissance est obligatoire",
  }).refine((date) => date < new Date(), "La date ne peut pas être dans le futur"),
  sexe: SexeEnum,
  cin: z.string().regex(/^[A-Z]{1,2}[0-9]{5,7}$/, "Format CIN invalide (ex: BE123456)").optional().or(z.literal("")),
  
  telephone: z.string().min(10, "Numéro de téléphone invalide"),
  telephoneSecondaire: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  
  numeroCNSS: z.string().optional(),
  mutuelle: z.string().optional(),
  numeroMutuelle: z.string().optional(),
  
  groupeSanguin: GroupeSanguinEnum.optional().nullable(),
  allergies: z.string().optional(),
  antecedentsMedicaux: z.string().optional(),
  antecedentsFamiliaux: z.string().optional(),
  medecinTraitant: z.string().optional(),
  
  diagnosticPrincipal: z.string().optional(),
  dateDecouverteCancer: z.date().optional().nullable(),
  stade: z.string().optional(),
  typeHistologique: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
