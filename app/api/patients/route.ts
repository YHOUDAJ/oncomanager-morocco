// app/api/patients/route.ts
// API Routes pour GET (liste) et POST (création) de patients

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validation pour la création
const createPatientSchema = z.object({
  nom: z.string().min(2, "Le nom est obligatoire"),
  prenom: z.string().min(2, "Le prénom est obligatoire"),
  dateNaissance: z.string().transform((str) => new Date(str)),
  sexe: z.enum(["HOMME", "FEMME"]),
  cin: z.string().regex(/^[A-Z]{1,2}[0-9]{5,7}$/, "Format CIN invalide").optional().nullable(),
  telephone: z.string().min(10, "Numéro de téléphone invalide"),
  telephoneSecondaire: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable(),
  adresse: z.string().optional().nullable(),
  ville: z.string().optional().nullable(),
  numeroCNSS: z.string().optional().nullable(),
  mutuelle: z.string().optional().nullable(),
  numeroMutuelle: z.string().optional().nullable(),
  groupeSanguin: z.enum([
    "A_POSITIF", "A_NEGATIF", 
    "B_POSITIF", "B_NEGATIF", 
    "AB_POSITIF", "AB_NEGATIF", 
    "O_POSITIF", "O_NEGATIF"
  ]).optional().nullable(),
  allergies: z.string().optional().nullable(),
  antecedentsMedicaux: z.string().optional().nullable(),
  antecedentsFamiliaux: z.string().optional().nullable(),
  medecinTraitant: z.string().optional().nullable(),
  diagnosticPrincipal: z.string().optional().nullable(),
  dateDecouverteCancer: z.string().transform((str) => str ? new Date(str) : null).optional().nullable(),
  stade: z.string().optional().nullable(),
  typeHistologique: z.string().optional().nullable(),
  localisationPrimaire: z.string().optional().nullable(),
});

// GET /api/patients - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Paramètres de recherche
    const q = searchParams.get('q') || '';
    const sexe = searchParams.get('sexe');
    const ville = searchParams.get('ville');
    const avecDiagnostic = searchParams.get('avecDiagnostic');
    
    // Paramètres de tri
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // TODO: Récupérer depuis la session authentifiée
    const cabinetId = searchParams.get('cabinetId') || 'cabinet-default';
    
    // Construction du filtre WHERE
    const where: any = {
      isArchived: false,
      // cabinetId: cabinetId, // Décommenter quand l'auth est en place
    };
    
    // Recherche textuelle
    if (q) {
      where.OR = [
        { nom: { contains: q, mode: 'insensitive' } },
        { prenom: { contains: q, mode: 'insensitive' } },
        { cin: { contains: q, mode: 'insensitive' } },
        { telephone: { contains: q } },
      ];
    }
    
    // Filtres additionnels
    if (sexe && (sexe === 'HOMME' || sexe === 'FEMME')) {
      where.sexe = sexe;
    }
    
    if (ville) {
      where.ville = { contains: ville, mode: 'insensitive' };
    }
    
    if (avecDiagnostic === 'true') {
      where.diagnosticPrincipal = { not: null };
    } else if (avecDiagnostic === 'false') {
      where.diagnosticPrincipal = null;
    }
    
    // Exécution des requêtes
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          nom: true,
          prenom: true,
          dateNaissance: true,
          sexe: true,
          cin: true,
          telephone: true,
          ville: true,
          diagnosticPrincipal: true,
          stade: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.patient.count({ where }),
    ]);
    
    // Calcul de l'âge pour chaque patient
    const patientsWithAge = patients.map((patient) => ({
      ...patient,
      age: Math.floor(
        (new Date().getTime() - new Date(patient.dateNaissance).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
      ),
    }));
    
    return NextResponse.json({
      data: patientsWithAge,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Erreur GET /api/patients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Création d'un patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const validationResult = createPatientSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Vérification CIN unique
    if (data.cin) {
      const existingPatient = await prisma.patient.findUnique({
        where: { cin: data.cin },
      });
      
      if (existingPatient) {
        return NextResponse.json(
          { error: 'Un patient avec ce CIN existe déjà' },
          { status: 409 }
        );
      }
    }
    
    // TODO: Récupérer depuis la session authentifiée
    const createdById = 'user-default';
    const cabinetId = 'cabinet-default';
    
    // Création du patient
    const patient = await prisma.patient.create({
      data: {
        ...data,
        createdById,
        cabinetId,
      },
    });
    
    return NextResponse.json(patient, { status: 201 });
    
  } catch (error) {
    console.error('Erreur POST /api/patients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du patient' },
      { status: 500 }
    );
  }
}
