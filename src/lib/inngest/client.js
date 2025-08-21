import { Inngest } from 'inngest';

export const inngest = new Inngest({
	id: 'finflow-ai', // Unique app ID
	name: 'FinFlow AI',
	retryFunction: async (attempt) => ({
		delay: Math.pow(2, attempt) * 1000, // Exponential backoff
		maxAttempts: 2,
	}),
});
