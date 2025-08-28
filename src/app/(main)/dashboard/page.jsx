export const dynamic = 'force-dynamic';

import CreateAccountDrawer from '@/components/CreateAccountDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React from 'react';
import { getDashboardData, getUserAccounts } from '@/actions/dashboard';
import AccountCard from './_components/AccountCard';
import { getCurrentBudget } from '@/actions/budget';
import BudgetProgress from './_components/BudgetProgress';
import DashboardOverview from './_components/DashboardOverview';

const DashboardPage = async () => {
	const accounts = await getUserAccounts();

	const defaultAccount = accounts?.data.find((account) => account.isDefault);

	let budgetData = null;
	if (defaultAccount) {
		const budgetResponse = await getCurrentBudget(defaultAccount.id);
		if (budgetResponse.success) {
			budgetData = budgetResponse.data;
		} else {
			console.error('Failed to fetch budget:', budgetResponse.error);
		}
	}

	const transactions = await getDashboardData();

	return (
		<div className="space-y-8">
			{/* BUDGET PROGRESS */}
			{defaultAccount && (
				<BudgetProgress
					initialBudget={budgetData?.budget}
					currentExpenses={budgetData?.currentExpenses || 0}
				/>
			)}

			{/* OVERVIEW */}
			<DashboardOverview
				accounts={accounts}
				transactions={transactions || []}
			/>

			{/* ACCOUNTS GRID */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<CreateAccountDrawer>
					<Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
						<CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground pt-5">
							<Plus className="h-8 w-8 mb-2" />
							<p className="text-sm font-medium">Add New Account</p>
						</CardContent>
					</Card>
				</CreateAccountDrawer>

				{accounts.data.length > 0 &&
					accounts.data.map((account) => {
						return <AccountCard key={account.id} account={account} />;
					})}
			</div>
		</div>
	);
};

export default DashboardPage;
