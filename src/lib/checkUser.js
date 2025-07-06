import { currentUser } from '@clerk/nextjs/server';
import { db } from './prisma';

/**
 * Ensures the current Clerk user exists in the database.
 * If not, creates a new user entry.
 * @returns {Promise<Object|null>} The existing or newly created user record.
 */
export const checkUser = async () => {
	try {
		const user = await currentUser();

		if (!user) return null;

		const { id, firstName, lastName, emailAddresses, imageUrl } = user;
		const email = emailAddresses?.[0]?.emailAddress || '';

		// Attempt to find existing user
		let dbUser = await db.user.findUnique({
			where: { clerkUserId: id },
		});

		if (!dbUser) {
			// Create user if not found
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
		console.error('[checkUser] Failed to fetch or create user:', error);
		return null;
	}
};
