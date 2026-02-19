'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { type Prisma } from '@/prisma/generated/client';

export async function getWorkLogs(month?: number, year?: number) {
    const where: Prisma.WorkLogWhereInput = {};

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        where.date = { gte: startDate, lte: endDate };
    }

    return await prisma.workLog.findMany({
        where,
        include: {
            task: {
                include: { project: true },
            },
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

export async function getYearlyWorkStats(year: number): Promise<YearlyStats> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const logs = await prisma.workLog.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: { task: { select: { type: true } } },
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
        if (log.task.type === 'ANNUAL_PLAN') {
            months[m].annualPlanDays += log.daysWorked;
        } else {
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
    taskId: number;
}) {
    const log = await prisma.workLog.create({ data });

    await prisma.task.update({
        where: { id: data.taskId },
        data: { daysSpent: { increment: data.daysWorked } },
    });

    revalidatePath('/');
    return log;
}

export async function createWorkLogBatch(entries: {
    date: Date;
    daysWorked: number;
    description?: string;
    taskId: number;
}[]) {
    if (entries.length === 0) return [];

    const taskId = entries[0].taskId;
    const totalDays = entries.reduce((sum, e) => sum + e.daysWorked, 0);

    const logs = await prisma.$transaction(
        entries.map((entry) => prisma.workLog.create({ data: entry }))
    );

    await prisma.task.update({
        where: { id: taskId },
        data: { daysSpent: { increment: totalDays } },
    });

    revalidatePath('/');
    return logs;
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
    revalidatePath('/');
    return log;
}

export async function deleteWorkLog(id: number) {
    const log = await prisma.workLog.findUnique({ where: { id } });
    if (log) {
        await prisma.task.update({
            where: { id: log.taskId },
            data: { daysSpent: { decrement: log.daysWorked } },
        });
    }
    await prisma.workLog.delete({ where: { id } });
    revalidatePath('/');
}
