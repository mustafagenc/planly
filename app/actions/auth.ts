'use server';

import prisma from '@/lib/prisma';
import { saltAndHashPassword } from '@/lib/password';
import { signIn } from '@/app/auth';
import { AuthError } from 'next-auth';

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: false, error: 'E-posta veya şifre hatalı.' };
        }
        throw error;
    }
}

export async function register(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' };
        }

        const hashedPassword = await saltAndHashPassword(password);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER',
            },
        });

        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: true };
        }
        console.error('Registration failed:', error);
        return { success: false, error: 'Kayıt sırasında bir hata oluştu.' };
    }
}

export async function hasAnyUser(): Promise<boolean> {
    const count = await prisma.user.count();
    return count > 0;
}
