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

export type MonthlyBreakdown = {
  month: number;
  monthLabel: string;
  annualPlanDays: number;
  adHocDays: number;
  total: number;
};

export type YearlyStats = {
  year: number;
  months: MonthlyBreakdown[];
  annualPlanTotal: number;
  adHocTotal: number;
  grandTotal: number;
};

const MONTH_LABELS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

/** Bir yıl için aylık bazda Yıllık İş Planı / Plan Harici dağılımını döndürür. */
export async function getYearlyWorkStats(year: number): Promise<YearlyStats> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const logs = await prisma.workLog.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    select: {
      date: true,
      daysWorked: true,
      annualPlanId: true,
      adHocTaskId: true,
    },
  });

  const months: MonthlyBreakdown[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthLabel: MONTH_LABELS[i],
    annualPlanDays: 0,
    adHocDays: 0,
    total: 0,
  }));

  for (const log of logs) {
    const m = new Date(log.date).getMonth();
    if (log.annualPlanId) {
      months[m].annualPlanDays += log.daysWorked;
    } else if (log.adHocTaskId) {
      months[m].adHocDays += log.daysWorked;
    }
    months[m].total += log.daysWorked;
  }

  const annualPlanTotal = months.reduce((s, m) => s + m.annualPlanDays, 0);
  const adHocTotal = months.reduce((s, m) => s + m.adHocDays, 0);

  return {
    year,
    months,
    annualPlanTotal,
    adHocTotal,
    grandTotal: annualPlanTotal + adHocTotal,
  };
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

export async function updateWorkLog(
  id: number,
  data: Partial<{
    date: Date;
    daysWorked: number;
    description: string;
  }>
) {
  const log = await prisma.workLog.update({
    where: { id },
    data,
  });

  // Note: We are not auto-adjusting parent task daysSpent on update to avoid complexity
  // and potential double-counting/drift. Users can manually adjust task totals if needed.

  revalidatePath('/');
  return log;
}

export async function deleteWorkLog(id: number) {
  // When deleting, we should probably decrease the spent time, but that's complex without transaction.
  // For MVP, just delete.
  await prisma.workLog.delete({ where: { id } });
  revalidatePath('/');
}
