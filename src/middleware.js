import arcjet, { createMiddleware, detectBot, shield } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
	'/dashboard(.*)',
	'/account(.*)',
	'/transaction(.*)',
]);

const aj = arcjet({
	key: process.env.ARCJET_KEY,
	rules: [
		shield({
			mode: 'LIVE',
		}),
		detectBot({
			mode: 'LIVE',
			allow: ['CATEGORY:SEARCH_ENGINE', 'GO_HTTP'],
		}),
	],
});

const clerk = clerkMiddleware(async (auth, req) => {
	const { userId, redirectToSignIn } = await auth();

	// Protect private routes
	if (!userId && isProtectedRoute(req)) {
		console.warn(
			`[ClerkMiddleware] Unauthorized access to ${req.nextUrl.pathname}`
		);
		return redirectToSignIn({ returnBackUrl: req.url });
	}
});

export default createMiddleware(aj, clerk);

export const config = {
	matcher: [
		// Protect dynamic routes but skip static assets and Next internals
		'/((?!_next|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|css|js|ts|tsx|html|json|woff2?|ttf|zip|csv|map)).*)',
		// Always include API routes
		'/api/(.*)',
	],
};
