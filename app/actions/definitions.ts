'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth-utils';

// Projects
export async function getProjects() {
  const userId = await getCurrentUserId();
  return await prisma.project.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function createProject(name: string) {
  try {
    const userId = await getCurrentUserId();
    const project = await prisma.project.create({ data: { name, userId } });
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { success: false, error: 'Proje oluşturulurken bir hata oluştu.' };
  }
}

export async function updateProject(id: number, name: string) {
  try {
    const userId = await getCurrentUserId();
    const project = await prisma.project.update({ where: { id, userId }, data: { name } });
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to update project:', error);
    return { success: false, error: 'Proje güncellenirken bir hata oluştu.' };
  }
}

export async function deleteProject(id: number) {
  try {
    const userId = await getCurrentUserId();
    await prisma.project.delete({ where: { id, userId } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { success: false, error: 'Proje silinirken bir hata oluştu. İlişkili kayıtlar olabilir.' };
  }
}

// Units
export async function getUnits() {
  const userId = await getCurrentUserId();
  return await prisma.unit.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function createUnit(name: string) {
  try {
    const userId = await getCurrentUserId();
    const unit = await prisma.unit.create({ data: { name, userId } });
    revalidatePath('/');
    return { success: true, data: unit };
  } catch (error) {
    console.error('Failed to create unit:', error);
    return { success: false, error: 'Birim oluşturulurken bir hata oluştu.' };
  }
}

export async function updateUnit(id: number, name: string) {
  try {
    const userId = await getCurrentUserId();
    const unit = await prisma.unit.update({ where: { id, userId }, data: { name } });
    revalidatePath('/');
    return { success: true, data: unit };
  } catch (error) {
    console.error('Failed to update unit:', error);
    return { success: false, error: 'Birim güncellenirken bir hata oluştu.' };
  }
}

export async function deleteUnit(id: number) {
  try {
    const userId = await getCurrentUserId();
    await prisma.unit.delete({ where: { id, userId } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete unit:', error);
    return { success: false, error: 'Birim silinirken bir hata oluştu. İlişkili kayıtlar olabilir.' };
  }
}

// People
export async function getPeople() {
  const userId = await getCurrentUserId();
  return await prisma.person.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function createPerson(name: string) {
  try {
    const userId = await getCurrentUserId();
    const person = await prisma.person.create({ data: { name, userId } });
    revalidatePath('/');
    return { success: true, data: person };
  } catch (error) {
    console.error('Failed to create person:', error);
    return { success: false, error: 'Kişi oluşturulurken bir hata oluştu.' };
  }
}

export async function updatePerson(id: number, name: string) {
  try {
    const userId = await getCurrentUserId();
    const person = await prisma.person.update({ where: { id, userId }, data: { name } });
    revalidatePath('/');
    return { success: true, data: person };
  } catch (error) {
    console.error('Failed to update person:', error);
    return { success: false, error: 'Kişi güncellenirken bir hata oluştu.' };
  }
}

export async function deletePerson(id: number) {
  try {
    const userId = await getCurrentUserId();
    await prisma.person.delete({ where: { id, userId } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete person:', error);
    return { success: false, error: 'Kişi silinirken bir hata oluştu. İlişkili kayıtlar olabilir.' };
  }
}
