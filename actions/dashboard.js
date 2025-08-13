'use server';

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { DASHBOARD_PATH } from '@/lib/routes';
import { serializeAccount } from '@/lib/serializeAccount';
import { getUserFromClerk } from '@/lib/auth';

/**
 * @function createAccount
 * Creates a user account and sets it as default if it's the first
 * @param {Object} params - Account creation payload
 * @returns {Promise<Object>} - Result with success or error
 */
export async function createAccount({
	name,
	type,
	balance,
	isDefault = false,
}) {
	try {
		const user = await getUserFromClerk();

		const floatBalance = parseFloat(balance);
		if (isNaN(floatBalance))
			throw new Error('Invalid balance: must be a valid number');

		const newAccount = await db.$transaction(async (tx) => {
			const existingAccounts = await tx.account.findMany({
				where: { userId: user.id },
				select: { id: true, isDefault: true },
			});

			const shouldBeDefault = existingAccounts.length === 0 || isDefault;

			if (shouldBeDefault) {
				await tx.account.updateMany({
					where: { userId: user.id, isDefault: true },
					data: { isDefault: false },
				});
			}

			return tx.account.create({
				data: {
					name,
					type,
					balance: floatBalance,
					isDefault: shouldBeDefault,
					userId: user.id,
				},
			});
		});

		revalidatePath(DASHBOARD_PATH);

		return {
			success: true,
			data: serializeAccount(newAccount),
		};
	} catch (err) {
		console.error('[createAccount] Error:', err);
		return {
			success: false,
			error: err?.message || 'Unknown error during account creation',
		};
	}
}

/**
 * @function getUserAccounts
 * Fetches all accounts of the authenticated user with transaction count
 * @returns {Promise<Object>} - Result with success or error
 */
export async function getUserAccounts() {
	try {
		const user = await getUserFromClerk();

		const accounts = await db.account.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			include: {
				_count: { select: { transactions: true } },
			},
		});

		return {
			success: true,
			data: accounts.map(serializeAccount),
		};
	} catch (err) {
		console.error('[getUserAccounts] Error:', err);
		return {
			success: false,
			error: err?.message || 'Failed to fetch accounts',
		};
	}
}
