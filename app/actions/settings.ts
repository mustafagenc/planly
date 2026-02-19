'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { type SettingType } from '@/prisma/generated/client';

export async function getSettings() {
    return await prisma.setting.findMany({ orderBy: { key: 'asc' } });
}

export async function getSetting(key: string) {
    return await prisma.setting.findUnique({ where: { key } });
}

export async function createSetting(data: {
    key: string;
    value: string;
    type: SettingType;
    label: string;
    description?: string;
}) {
    try {
        const setting = await prisma.setting.create({ data });
        revalidatePath('/');
        return { success: true, data: setting };
    } catch (error) {
        console.error('Failed to create setting:', error);
        return { success: false, error: 'Ayar oluşturulurken bir hata oluştu. Anahtar zaten mevcut olabilir.' };
    }
}

export async function updateSetting(id: number, data: {
    value?: string;
    label?: string;
    description?: string;
}) {
    try {
        const setting = await prisma.setting.update({ where: { id }, data });
        revalidatePath('/');
        return { success: true, data: setting };
    } catch (error) {
        console.error('Failed to update setting:', error);
        return { success: false, error: 'Ayar güncellenirken bir hata oluştu.' };
    }
}

export async function deleteSetting(id: number) {
    try {
        await prisma.setting.delete({ where: { id } });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete setting:', error);
        return { success: false, error: 'Ayar silinirken bir hata oluştu.' };
    }
}
