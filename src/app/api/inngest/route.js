import { serve } from 'inngest/next';

import { inngest } from '@/lib/inngest/client';
import {
	checkBudgetAlerts,
	generateMonthlyReports,
	processRecurringTransaction,
	triggerRecurringTransactions,
	pingSupabase,
} from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		processRecurringTransaction,
		triggerRecurringTransactions,
		generateMonthlyReports,
		checkBudgetAlerts,
		pingSupabase,
	],
});
