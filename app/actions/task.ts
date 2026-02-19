'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { type TaskType, type TaskStatus, type Prisma } from '@/prisma/generated/client';

export async function getTasks(filters?: {
    type?: TaskType;
    status?: TaskStatus;
    projectId?: number;
    year?: number;
}) {
    const where: Prisma.TaskWhereInput = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.year) where.year = filters.year;

    return await prisma.task.findMany({
        where,
        include: {
            project: true,
            unit: true,
            responsible: true,
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
}

export async function getTasksByStatus() {
    const tasks = await prisma.task.findMany({
        include: {
            project: true,
            unit: true,
            responsible: true,
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return {
        BACKLOG: tasks.filter(t => t.status === 'BACKLOG'),
        TODO: tasks.filter(t => t.status === 'TODO'),
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
        DONE: tasks.filter(t => t.status === 'DONE'),
    };
}

export async function createTask(data: {
    type: TaskType;
    projectId: number;
    title: string;
    detail?: string;
    ticketNo?: string;
    unitId?: number;
    responsibleId?: number;
    coResponsible?: string;
    year?: number;
    estimatedDays?: number;
    remarks?: string;
}) {
    const task = await prisma.task.create({
        data: {
            ...data,
            status: 'BACKLOG',
            progress: 0,
            daysSpent: 0,
        },
    });
    revalidatePath('/');
    return task;
}

export async function updateTask(
    id: number,
    data: Partial<{
        type: TaskType;
        status: TaskStatus;
        title: string;
        detail: string;
        ticketNo: string;
        unitId: number;
        responsibleId: number;
        coResponsible: string;
        year: number;
        estimatedDays: number;
        daysSpent: number;
        progress: number;
        remarks: string;
    }>
) {
    const task = await prisma.task.update({
        where: { id },
        data,
    });
    revalidatePath('/');
    return task;
}

export async function updateTaskStatus(id: number, status: TaskStatus) {
    const progressMap: Record<TaskStatus, number | undefined> = {
        BACKLOG: 0,
        TODO: undefined,
        IN_PROGRESS: undefined,
        DONE: 100,
    };

    const progress = progressMap[status];

    const task = await prisma.task.update({
        where: { id },
        data: {
            status,
            ...(progress !== undefined && { progress }),
        },
    });
    revalidatePath('/');
    return task;
}

export async function deleteTask(id: number) {
    await prisma.task.delete({ where: { id } });
    revalidatePath('/');
}

export async function reorderTasks(items: { id: number; order: number }[]) {
    try {
        const transactions = items.map((item) =>
            prisma.task.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );
        await prisma.$transaction(transactions);
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to reorder tasks:', error);
        throw new Error('Failed to reorder tasks');
    }
}
