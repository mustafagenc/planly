'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { type SettingType } from '@/prisma/generated/client';
import { getCurrentUserId } from '@/lib/auth-utils';

export async function getSettings() {
	const userId = await getCurrentUserId();
	return await prisma.setting.findMany({ where: { userId }, orderBy: { key: 'asc' } });
}

export async function getSetting(key: string) {
	const userId = await getCurrentUserId();
	return await prisma.setting.findFirst({ where: { key, userId } });
}

export async function createSetting(data: {
	key: string;
	value: string;
	type: SettingType;
	label: string;
	description?: string;
}) {
	try {
		const userId = await getCurrentUserId();
		const setting = await prisma.setting.create({ data: { ...data, userId } });
		revalidatePath('/');
		return { success: true, data: setting };
	} catch (error) {
		console.error('Failed to create setting:', error);
		return {
			success: false,
			error: 'Ayar oluşturulurken bir hata oluştu. Anahtar zaten mevcut olabilir.',
		};
	}
}

export async function updateSetting(
	id: number,
	data: {
		value?: string;
		label?: string;
		description?: string;
	},
) {
	try {
		const userId = await getCurrentUserId();
		const setting = await prisma.setting.update({ where: { id, userId }, data });
		revalidatePath('/');
		return { success: true, data: setting };
	} catch (error) {
		console.error('Failed to update setting:', error);
		return { success: false, error: 'Ayar güncellenirken bir hata oluştu.' };
	}
}

export async function deleteSetting(id: number) {
	try {
		const userId = await getCurrentUserId();
		await prisma.setting.delete({ where: { id, userId } });
		revalidatePath('/');
		return { success: true };
	} catch (error) {
		console.error('Failed to delete setting:', error);
		return { success: false, error: 'Ayar silinirken bir hata oluştu.' };
	}
}
