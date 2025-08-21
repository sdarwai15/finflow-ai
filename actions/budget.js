'use server';

import { getUserFromClerk } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { DASHBOARD_PATH } from '@/lib/routes';
import { revalidatePath } from 'next/cache';

/**
 * Fetch the current budget and expenses for a given account
 * @param {string} accountId - ID of the account
 * @returns {Promise<{ budget: Object|null, currentExpenses: number }>}
 */
export async function getCurrentBudget(accountId) {
	try {
		const user = await getUserFromClerk();

		// Fetch user's budget
		const budget = await db.budget.findFirst({
			where: { userId: user.id },
		});

		// Get current month's expense range
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		// Aggregate monthly expenses for this account
		const { _sum } = await db.transaction.aggregate({
			where: {
				userId: user.id,
				type: 'EXPENSE',
				accountId,
				date: {
					gte: startOfMonth,
					lte: endOfMonth,
				},
			},
			_sum: { amount: true },
		});

		return {
			success: true,
			data: {
				budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
				currentExpenses: _sum.amount ? _sum.amount.toNumber() : 0,
			},
		};
	} catch (error) {
		console.error('[getCurrentBudget] Failed:', error);
		return {
			success: false,
			error: error.message || 'Failed to fetch budget',
		};
	}
}

/**
 * Update or create the user's budget
 * @param {number} amount - Budget amount
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function updateBudget(amount) {
	try {
		const user = await getUserFromClerk();

		if (typeof amount !== 'number' || amount < 0) {
			throw new Error('Invalid budget amount');
		}

		// Upsert ensures idempotency (update if exists, else create)
		const budget = await db.budget.upsert({
			where: { userId: user.id },
			update: { amount },
			create: { userId: user.id, amount },
		});

		// Revalidate dashboard cache
		revalidatePath(DASHBOARD_PATH);

		return {
			success: true,
			data: { ...budget, amount: budget.amount.toNumber() },
		};
	} catch (error) {
		console.error('[updateBudget] Failed:', error);
		return {
			success: false,
			error: error.message || 'Failed to update budget',
		};
	}
}
