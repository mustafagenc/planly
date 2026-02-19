'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { type TaskType, type TaskStatus, type Prisma } from '@/prisma/generated/client';
import { getCurrentUserId } from '@/lib/auth-utils';

export async function getTasks(filters?: {
	type?: TaskType;
	status?: TaskStatus;
	projectId?: number;
	year?: number;
}) {
	const userId = await getCurrentUserId();
	const where: Prisma.TaskWhereInput = { userId };

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
	const userId = await getCurrentUserId();
	const tasks = await prisma.task.findMany({
		where: { userId },
		include: {
			project: true,
			unit: true,
			responsible: true,
		},
		orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
	});

	return {
		BACKLOG: tasks.filter((t) => t.status === 'BACKLOG'),
		TODO: tasks.filter((t) => t.status === 'TODO'),
		IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
		DONE: tasks.filter((t) => t.status === 'DONE'),
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
	const userId = await getCurrentUserId();
	const task = await prisma.task.create({
		data: {
			...data,
			userId,
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
	}>,
) {
	const userId = await getCurrentUserId();
	const task = await prisma.task.update({
		where: { id, userId },
		data,
	});
	revalidatePath('/');
	return task;
}

export async function updateTaskStatus(id: number, status: TaskStatus) {
	const userId = await getCurrentUserId();
	const progressMap: Record<TaskStatus, number | undefined> = {
		BACKLOG: 0,
		TODO: undefined,
		IN_PROGRESS: undefined,
		DONE: 100,
	};

	const progress = progressMap[status];

	const task = await prisma.task.update({
		where: { id, userId },
		data: {
			status,
			...(progress !== undefined && { progress }),
		},
	});
	revalidatePath('/');
	return task;
}

export async function deleteTask(id: number) {
	const userId = await getCurrentUserId();
	await prisma.task.delete({ where: { id, userId } });
	revalidatePath('/');
}

export async function reorderTasks(items: { id: number; order: number }[]) {
	const userId = await getCurrentUserId();
	try {
		const transactions = items.map((item) =>
			prisma.task.update({
				where: { id: item.id, userId },
				data: { order: item.order },
			}),
		);
		await prisma.$transaction(transactions);
		revalidatePath('/');
	} catch (error) {
		console.error('Failed to reorder tasks:', error);
		throw new Error('Failed to reorder tasks');
	}
}
