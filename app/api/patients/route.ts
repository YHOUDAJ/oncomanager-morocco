// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour la création d'un patient
const patientCreateSchema = z.object({
  nom: z.string().min(2, "Le nom est obligatoire"),
  prenom: z.string().min(2, "Le prénom est obligatoire"),
  dateNaissance: z.string().transform((str) => new Date(str)),
  sexe: z.enum(["HOMME", "FEMME"]),
  cin: z.string().optional().nullable(),
  telephone: z.string().min(10, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional().nullable().or(z.literal("")),
  ville: z.string().optional().nullable(),
  adresse: z.string().optional().nullable(),
  mutuelle: z.string().optional().nullable(),
  groupeSanguin: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  antecedentsMedicaux: z.string().optional().nullable(),
  diagnosticPrincipal: z.string().optional().nullable(),
  stade: z.string().optional().nullable(),
  typeHistologique: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const sexe = searchParams.get('sexe');
    const ville = searchParams.get('ville');
    const avecDiagnostic = searchParams.get('avecDiagnostic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const where: any = {
      isArchived: false,
      OR: q ? [
        { nom: { contains: q } },
        { prenom: { contains: q } },
        { cin: { contains: q } },
        { telephone: { contains: q } },
      ] : undefined,
    };

    if (sexe) where.sexe = sexe;
    if (ville) where.ville = { contains: ville };
    if (avecDiagnostic === 'true') where.diagnosticPrincipal = { not: null };

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.patient.count({ where }),
    ]);

    // Calcul de l'âge au vol
    const patientsWithAge = patients.map(p => {
      const birthDate = new Date(p.dateNaissance);
      const ageDiffMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return { ...p, age };
    });

    return NextResponse.json({
      data: patientsWithAge,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des patients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = patientCreateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: "Données invalides", details: validatedData.error.flatten().fieldErrors }, { status: 400 });
    }

    const { cin } = validatedData.data;

    // Vérification CIN unique
    if (cin) {
      const existing = await prisma.patient.findUnique({ where: { cin } });
      if (existing) {
        return NextResponse.json({ error: "Un patient avec ce CIN existe déjà" }, { status: 409 });
      }
    }

    // Identifiants par défaut pour le prototype (à remplacer par l'auth)
    const cabinetId = (await prisma.cabinet.findFirst())?.id || (await prisma.cabinet.create({ data: { nom: "Cabinet Principal" } })).id;
    const userId = (await prisma.user.findFirst())?.id || (await prisma.user.create({
      data: {
        nom: "Admin",
        prenom: "System",
        email: "admin@oncomanager.ma",
        passwordHash: "hash",
        cabinetId
      }
    })).id;

    const patient = await prisma.patient.create({
      data: {
        ...validatedData.data,
        cabinetId,
        createdById: userId,
      }
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la création du patient" }, { status: 500 });
  }
}
