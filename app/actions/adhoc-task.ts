'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdHocTasks() {
  return await prisma.adHocTask.findMany({
    include: {
      project: true,
      responsible: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAdHocTask(data: {
  projectId: number;
  coResponsible?: string;
  description: string;
  remarks?: string;
  ticketNo?: string;
  responsibleId?: number;
  daysSpent?: number;
  previousStatus?: string;
}) {
  const task = await prisma.adHocTask.create({
    data: {
      ...data,
      progress: 0,
    },
  });
  revalidatePath('/');
  return task;
}

export async function updateAdHocTask(
  id: number,
  data: Partial<{
    coResponsible: string;
    description: string;
    remarks: string;
    ticketNo: string;
    responsibleId: number;
    daysSpent: number;
    progress: number;
    previousStatus: string;
  }>
) {
  const task = await prisma.adHocTask.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return task;
}

export async function deleteAdHocTask(id: number) {
  await prisma.adHocTask.delete({ where: { id } });
  revalidatePath('/');
}
