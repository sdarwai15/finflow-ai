import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

/**
 * Ensures the current Clerk user exists in the database.
 * If not, creates a new user entry.
 * Use in public or layout-level logic where the user may not exist yet.
 *
 * @returns {Promise<Object|null>} User object or null if not authenticated.
 */
export const checkUser = async () => {
	try {
		const user = await currentUser();
		if (!user) return null;

		const { id, firstName, lastName, emailAddresses, imageUrl } = user;
		const email = emailAddresses?.[0]?.emailAddress || '';

		let dbUser = await db.user.findUnique({
			where: { clerkUserId: id },
		});

		if (!dbUser) {
			dbUser = await db.user.create({
				data: {
					clerkUserId: id,
					name: `${firstName || ''} ${lastName || ''}`.trim(),
					imageUrl,
					email,
				},
			});
		}

		return dbUser;
	} catch (error) {
		console.error('[checkUser] Failed to fetch/create user:', error);
		return null;
	}
};

/**
 * Fetches the authenticated user from Clerk and database.
 * Use in secure routes, actions, or server logic where user *must* exist.
 *
 * @returns {Promise<Object>} DB user object
 * @throws {Error} If not authenticated or not found in DB
 */
export const getUserFromClerk = async () => {
	const { userId } = await auth();
	if (!userId) throw new Error('Unauthorized: Missing user ID');

	const dbUser = await db.user.findUnique({
		where: { clerkUserId: userId },
	});

	if (!dbUser) throw new Error('User not found in database');

	return dbUser;
};
