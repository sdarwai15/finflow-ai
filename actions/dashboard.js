'use server';

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

/**
 * Fetch the current user from Clerk and retrieve their account details.
 * Throw an error if the user is not authenticated or not found in the database.
 * @returns {Promise<Object>} The user object from the database.
 * @throws {Error} If the user is not authenticated or not found.
 **/
async function getUserFromClerk() {
	const { userId } = await auth();

	if (!userId) {
		throw new Error('Unauthorized: No User ID found');
	}

	const user = await db.user.findUnique({
		where: { clerkUserId: userId },
	});

	if (!user) {
		throw new Error('User not found!');
	}

	return user;
}

/**
 * Ensures Prisma Decimal values are serialized for client use
 */
function serializeAccount(account) {
	return {
		...account,
		balance: account.balance?.toNumber?.() ?? 0,
	};
}

/**
 * Creates a new user account with optional default status.
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
		if (isNaN(floatBalance)) {
			throw new Error('Invalid balance value: must be a number');
		}

		const result = await db.$transaction(async (tx) => {
			const existingAccounts = await tx.account.findMany({
				where: { userId: user.id },
				select: { id: true, isDefault: true },
			});

			const shouldBeDefault = existingAccounts.length === 0 ? true : isDefault;

			if (shouldBeDefault) {
				await tx.account.updateMany({
					where: { userId: user.id, isDefault: true },
					data: { isDefault: false },
				});
			}

			const newAccount = await tx.account.create({
				data: {
					name,
					type,
					balance: floatBalance,
					isDefault: shouldBeDefault,
					userId: user.id,
				},
			});

			return newAccount;
		});

		revalidatePath('/dashboard');
		return { success: true, data: serializeAccount(result) };
	} catch (error) {
		console.error('[createAccount] Error:', error);
		return { success: false, error: error.message || 'Unknown error' };
	}
}