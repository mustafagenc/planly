/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '../prisma/generated/client';

declare global {
	var prisma: undefined | PrismaClient;
}

const prisma =
	global.prisma ??
	new PrismaClient({
		accelerateUrl: process.env.DATABASE_URL,
	} as any);

export default prisma;

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
