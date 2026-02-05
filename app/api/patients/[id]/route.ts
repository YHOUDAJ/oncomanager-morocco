// app/api/patients/[id]/route.ts
// API Routes pour GET, PUT, DELETE sur un patient spécifique

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validation pour la mise à jour
const updatePatientSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  dateNaissance: z.string().transform((str) => new Date(str)).optional(),
  sexe: z.enum(["HOMME", "FEMME"]).optional(),
  cin: z.string().regex(/^[A-Z]{1,2}[0-9]{5,7}$/).optional().nullable(),
  telephone: z.string().min(10).optional(),
  telephoneSecondaire: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
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
}).partial();

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/patients/[id] - Détail d'un patient
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { date: 'desc' },
          take: 5,
          select: {
            id: true,
            date: true,
            motif: true,
            conclusion: true,
          },
        },
        cures: {
          orderBy: { datePrevue: 'desc' },
          take: 5,
          include: {
            protocole: {
              select: {
                nom: true,
              },
            },
          },
        },
        rendezvous: {
          where: {
            dateHeure: { gte: new Date() },
            statut: { in: ['PLANIFIE', 'CONFIRME'] },
          },
          orderBy: { dateHeure: 'asc' },
          take: 3,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            nom: true,
            type: true,
            dateDocument: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            consultations: true,
            cures: true,
            documents: true,
            factures: true,
          },
        },
      },
    });
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      );
    }
    
    if (patient.isArchived) {
      return NextResponse.json(
        { error: 'Ce patient a été archivé' },
        { status: 410 }
      );
    }
    
    // Calcul de l'âge
    const age = Math.floor(
      (new Date().getTime() - new Date(patient.dateNaissance).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
    
    return NextResponse.json({
      ...patient,
      age,
    });
    
  } catch (error) {
    console.error('Erreur GET /api/patients/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du patient' },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Mise à jour d'un patient
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Vérification que le patient existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });
    
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      );
    }
    
    if (existingPatient.isArchived) {
      return NextResponse.json(
        { error: 'Impossible de modifier un patient archivé' },
        { status: 410 }
      );
    }
    
    // Validation
    const validationResult = updatePatientSchema.safeParse(body);
    
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
    
    // Vérification CIN unique si modifié
    if (data.cin && data.cin !== existingPatient.cin) {
      const patientWithCin = await prisma.patient.findUnique({
        where: { cin: data.cin },
      });
      
      if (patientWithCin) {
        return NextResponse.json(
          { error: 'Un patient avec ce CIN existe déjà' },
          { status: 409 }
        );
      }
    }
    
    // Mise à jour
    const patient = await prisma.patient.update({
      where: { id },
      data,
    });
    
    return NextResponse.json(patient);
    
  } catch (error) {
    console.error('Erreur PUT /api/patients/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du patient' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Archivage d'un patient (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Vérification que le patient existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });
    
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      );
    }
    
    if (existingPatient.isArchived) {
      return NextResponse.json(
        { error: 'Ce patient est déjà archivé' },
        { status: 410 }
      );
    }
    
    // TODO: Vérifier que l'utilisateur a le rôle MEDECIN
    // const session = await getServerSession(authOptions);
    // if (session?.user?.role !== 'MEDECIN') {
    //   return NextResponse.json(
    //     { error: 'Seul un médecin peut archiver un patient' },
    //     { status: 403 }
    //   );
    // }
    
    // Soft delete (archivage)
    await prisma.patient.update({
      where: { id },
      data: { isArchived: true },
    });
    
    return NextResponse.json(
      { message: 'Patient archivé avec succès' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erreur DELETE /api/patients/[id]:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'archivage du patient" },
      { status: 500 }
    );
  }
}
