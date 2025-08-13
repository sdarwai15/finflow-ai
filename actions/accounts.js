'use server';

import { db } from '@/lib/prisma';
import { ACCOUNT_PATH, DASHBOARD_PATH } from '@/lib/routes';
import { serializeAccount } from '@/lib/serializeAccount';
import { revalidatePath } from 'next/cache';
import { getUserFromClerk } from '@/lib/auth';

/**
 * Sets a given account as the default and unsets any previous defaults.
 * @param {string} accountId - ID of the account to set as default.
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export const updateDefaultAccount = async (accountId) => {
	try {
		const user = await getUserFromClerk();

		await db.account.updateMany({
			where: { userId: user.id, isDefault: true },
			data: { isDefault: false },
		});

		const updatedAccount = await db.account.update({
			where: { id: accountId, userId: user.id },
			data: { isDefault: true },
		});

		revalidatePath(DASHBOARD_PATH);

		return {
			success: true,
			data: serializeAccount(updatedAccount),
		};
	} catch (error) {
		console.error('[updateDefaultAccount] Error:', error);
		return {
			success: false,
			error: error.message || 'Failed to update default account.',
		};
	}
};

/**
 * Fetches a specific user account with its related transactions.
 * @param {string} accountId - ID of the account to fetch.
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export const getAccountWithTransactions = async (accountId) => {
	try {
		const user = await getUserFromClerk();

		const account = await db.account.findUnique({
			where: { id: accountId, userId: user.id },
			include: {
				transactions: {
					orderBy: { date: 'desc' },
				},
				_count: {
					select: { transactions: true },
				},
			},
		});

		if (!account) {
			return { success: false, error: 'Account not found' };
		}

		return {
			success: true,
			data: {
				...serializeAccount(account),
				transactions: account.transactions.map(serializeAccount),
			},
		};
	} catch (error) {
		console.error('[getAccountWithTransactions] Error:', error);
		return {
			success: false,
			error: error.message || 'Failed to fetch account details.',
		};
	}
};

export const bulkDeleteTransactions = async (transactionIds) => {
	try {
		const user = await getUserFromClerk();

		const transactions = await db.transaction.findMany({
			where: {
				id: { in: transactionIds },
				userId: user.id,
			},
		});

		const accountBalanceChanges = transactions.reduce((acc, transaction) => {
			const change =
				transaction.type === 'EXPENSE'
					? transaction.amount
					: -transaction.amount;

			acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
			return acc;
		}, {});

		await db.$transaction(async (tx) => {
			await tx.transaction.deleteMany({
				where: { id: { in: transactionIds }, userId: user.id },
			});

			for (const [accountId, balanceChange] of Object.entries(
				accountBalanceChanges
			)) {
				await tx.account.update({
					where: { id: accountId, userId: user.id },
					data: { balance: { increment: balanceChange } },
				});
			}
		});

		revalidatePath(DASHBOARD_PATH);
		revalidatePath(ACCOUNT_PATH);

		return { success: true };
	} catch (error) {
		console.error('[bulkDeleteTransactions] Error:', error);
		return {
			success: false,
			error: error.message || 'Failed to delete transactions.',
		};
	}
};
