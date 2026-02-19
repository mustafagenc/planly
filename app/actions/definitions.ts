'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProjects() {
  return await prisma.project.findMany({ orderBy: { name: 'asc' } });
}

export async function createProject(name: string) {
  try {
    const project = await prisma.project.create({ data: { name } });
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { success: false, error: 'Proje oluşturulurken bir hata oluştu.' };
  }
}

export async function updateProject(id: number, name: string) {
  try {
    const project = await prisma.project.update({ where: { id }, data: { name } });
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to update project:', error);
    return { success: false, error: 'Proje güncellenirken bir hata oluştu.' };
  }
}

export async function deleteProject(id: number) {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { success: false, error: 'Proje silinirken bir hata oluştu. İlişkili kayıtlar olabilir.' };
  }
}

// Units
export async function getUnits() {
  return await prisma.unit.findMany({ orderBy: { name: 'asc' } });
}

export async function createUnit(name: string) {
  try {
    const unit = await prisma.unit.create({ data: { name } });
    revalidatePath('/');
    return { success: true, data: unit };
  } catch (error) {
    console.error('Failed to create unit:', error);
    return { success: false, error: 'Birim oluşturulurken bir hata oluştu.' };
  }
}

export async function updateUnit(id: number, name: string) {
  try {
    const unit = await prisma.unit.update({ where: { id }, data: { name } });
    revalidatePath('/');
    return { success: true, data: unit };
  } catch (error) {
    console.error('Failed to update unit:', error);
    return { success: false, error: 'Birim güncellenirken bir hata oluştu.' };
  }
}

export async function deleteUnit(id: number) {
  try {
    await prisma.unit.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete unit:', error);
    return { success: false, error: 'Birim silinirken bir hata oluştu. İlişkili kayıtlar olabilir.' };
  }
}

// People
export async function getPeople() {
  return await prisma.person.findMany({ orderBy: { name: 'asc' } });
}

export async function createPerson(name: string) {
  try {
    const person = await prisma.person.create({ data: { name } });
    revalidatePath('/');
    return { success: true, data: person };
  } catch (error) {
    console.error('Failed to create person:', error);
    return { success: false, error: 'Kişi oluşturulurken bir hata oluştu.' };
  }
}

export async function updatePerson(id: number, name: string) {
  try {
    const person = await prisma.person.update({ where: { id }, data: { name } });
    revalidatePath('/');
    return { success: true, data: person };
  } catch (error) {
    console.error('Failed to update person:', error);
    return { success: false, error: 'Kişi güncellenirken bir hata oluştu.' };
  }
}

export async function deletePerson(id: number) {
  try {
    await prisma.person.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete person:', error);
    return { success: false, error: 'Kişi silinirken bir hata oluştu. İlişkili kayıtlar olabilir.' };
  }
}
