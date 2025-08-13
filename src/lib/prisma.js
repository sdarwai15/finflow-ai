import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis;

// Avoid multiple instances during dev hot-reloads
const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export const db = prisma;
