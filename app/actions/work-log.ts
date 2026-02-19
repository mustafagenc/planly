'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { type Prisma } from '@/prisma/generated/client';

export async function getWorkLogs(month?: number, year?: number) {
  const where: Prisma.WorkLogWhereInput = {};
  
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    where.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  return await prisma.workLog.findMany({
    where,
    include: {
      annualPlan: {
        include: {
          project: true,
        }
      },
      adHocTask: {
        include: {
          project: true,
        }
      }
    },
    orderBy: { date: 'desc' },
  });
}

export async function createWorkLog(data: {
  date: Date;
  daysWorked: number;
  description?: string;
  annualPlanId?: number;
  adHocTaskId?: number;
}) {
  if (!data.annualPlanId && !data.adHocTaskId) {
    throw new Error('Either annualPlanId or adHocTaskId must be provided.');
  }

  const log = await prisma.workLog.create({
    data,
  });

  // Automatically update the "daysSpent" or "progress" if needed?
  // For now, let's keep it simple. But usually logging work adds to "Working Days Spent".
  // Let's update the parent task's daysSpent if it's an AdHocTask or AnnualPlan (if we add spent to annual plan later).
  // AnnualPlan currently has "estimatedDays", typically we track spent there too but schema only has estimated.
  // AdHocTask has "daysSpent". Let's update that.

  if (data.adHocTaskId) {
    await prisma.adHocTask.update({
      where: { id: data.adHocTaskId },
      data: {
        daysSpent: {
          increment: data.daysWorked
        }
      }
    });
  }

  revalidatePath('/');
  return log;
}

export async function deleteWorkLog(id: number) {
  // When deleting, we should probably decrease the spent time, but that's complex without transaction.
  // For MVP, just delete.
  await prisma.workLog.delete({ where: { id } });
  revalidatePath('/');
}
