import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
	'/dashboard(.*)',
	'/account(.*)',
	'/transaction(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
	const { userId, redirectToSignIn } = await auth();

	if (!userId && isProtectedRoute(req)) {
		return redirectToSignIn({ returnBackUrl: req.url });
	}
});

export const config = {
	matcher: [
		'/((?!_next|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|css|js|json|woff2?|ttf)).*)',
	],
};
