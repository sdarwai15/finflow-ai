import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
	'/dashboard(.*)',
	'/account(.*)',
	'/transaction(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
	const { userId, redirectToSignIn } = await auth();

	// Protect private routes
	if (!userId && isProtectedRoute(req)) {
		console.warn(
			`[ClerkMiddleware] Unauthorized access to ${req.nextUrl.pathname}`
		);
		return redirectToSignIn({ returnBackUrl: req.url });
	}
});

export const config = {
	matcher: [
		// Protect dynamic routes but skip static assets and Next internals
		'/((?!_next|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|css|js|ts|tsx|html|json|woff2?|ttf|zip|csv|map)).*)',
		// Always include API routes
		'/api/(.*)',
	],
};
