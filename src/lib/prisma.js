import { PrismaClient } from '@/generated/prisma';

let db;

if (process.env.NODE_ENV === 'production') {
	// Always create a new client in production
	db = new PrismaClient();
} else {
	// Reuse client in development to avoid hot-reload issues
	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}
	db = global.prisma;
}

export { db };
