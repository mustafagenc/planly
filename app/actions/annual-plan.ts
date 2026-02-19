'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProjects() {
  return await prisma.project.findMany();
}

export async function getUnits() {
  return await prisma.unit.findMany();
}

export async function getPeople() {
  return await prisma.person.findMany();
}

export async function getAnnualPlans(year: number = 2025) {
  return await prisma.annualPlan.findMany({
    where: { year },
    include: {
      project: true,
      unit: true,
      responsible: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAnnualPlan(data: {
  year: number;
  projectId: number;
  unitId?: number;
  taskSummary: string;
  detail?: string;
  status?: string;
  responsibleId?: number;
  estimatedDays?: number;
}) {
  const plan = await prisma.annualPlan.create({
    data: {
      ...data,
      progress: 0,
    },
  });
  revalidatePath('/');
  return plan;
}

export async function updateAnnualPlan(
  id: number,
  data: Partial<{
    taskSummary: string;
    detail: string;
    status: string;
    responsibleId: number;
    estimatedDays: number;
    progress: number;
  }>
) {
  const plan = await prisma.annualPlan.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return plan;
}

export async function deleteAnnualPlan(id: number) {
  await prisma.annualPlan.delete({ where: { id } });
  revalidatePath('/');
}

// Helpers to seed data if empty
export async function createProject(name: string) {
  return await prisma.project.create({ data: { name } });
}

export async function createUnit(name: string) {
  return await prisma.unit.create({ data: { name } });
}

export async function createPerson(name: string) {
  return await prisma.person.create({ data: { name } });
}
