// app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const patientUpdateSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  dateNaissance: z.string().transform((str) => new Date(str)).optional(),
  sexe: z.enum(["HOMME", "FEMME"]).optional(),
  cin: z.string().optional().nullable(),
  telephone: z.string().min(10).optional(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  ville: z.string().optional().nullable(),
  adresse: z.string().optional().nullable(),
  mutuelle: z.string().optional().nullable(),
  groupeSanguin: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  antecedentsMedicaux: z.string().optional().nullable(),
  diagnosticPrincipal: z.string().optional().nullable(),
  stade: z.string().optional().nullable(),
  typeHistologique: z.string().optional().nullable(),
}).partial();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        consultations: { orderBy: { date: 'desc' }, take: 5 },
        cures: { orderBy: { datePrevue: 'desc' }, take: 5, include: { protocole: true } },
        rendezvous: { orderBy: { dateHeure: 'asc' }, take: 5, where: { dateHeure: { gte: new Date() } } },
        documents: { orderBy: { createdAt: 'desc' }, take: 5 },
      }
    });

    if (!patient || patient.isArchived) {
      return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
    }

    // Calcul de l'âge
    const birthDate = new Date(patient.dateNaissance);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    return NextResponse.json({ ...patient, age });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération du patient" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = patientUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: "Données invalides", details: validatedData.error.flatten().fieldErrors }, { status: 400 });
    }

    const { cin } = validatedData.data;

    if (cin) {
      const existing = await prisma.patient.findFirst({
        where: { cin, NOT: { id: params.id } }
      });
      if (existing) {
        return NextResponse.json({ error: "Un autre patient avec ce CIN existe déjà" }, { status: 409 });
      }
    }

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: validatedData.data
    });

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du patient" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.patient.update({
      where: { id: params.id },
      data: { isArchived: true }
    });
    return NextResponse.json({ message: "Patient archivé avec succès" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'archivage du patient" }, { status: 500 });
  }
}
