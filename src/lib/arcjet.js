import arcjet, { tokenBucket } from '@arcjet/next';

const aj = arcjet({
	key: process.env.ARCJET_KEY,
	characteristics: ['userId'], // Track based on Clerk user ID
	rules: [
		tokenBucket({
			mode: 'LIVE',
			refillRate: 10, // 10 tokens per hour
			interval: 3600, // 1 hour
			capacity: 10, // Maximum of 10 tokens
		}),
	],
});

export default aj;
