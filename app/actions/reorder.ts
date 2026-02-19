'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function reorderAnnualPlans(items: { id: number; order: number }[]) {
    try {
        const transactions = items.map((item) =>
            prisma.annualPlan.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );

        await prisma.$transaction(transactions);
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to reorder annual plans:', error);
        throw new Error('Failed to reorder annual plans');
    }
}

export async function reorderAdHocTasks(items: { id: number; order: number }[]) {
    try {
        const transactions = items.map((item) =>
            prisma.adHocTask.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );

        await prisma.$transaction(transactions);
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to reorder ad-hoc tasks:', error);
        throw new Error('Failed to reorder ad-hoc tasks');
    }
}
