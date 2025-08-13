import CreateAccountDrawer from '@/components/CreateAccountDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React from 'react';
import { getUserAccounts } from '../../../../actions/dashboard';
import AccountCard from './_components/AccountCard';

const DashboardPage = async () => {
	const accounts = await getUserAccounts();

	console.log('Accounts:', accounts);

	return (
		<div>
			{/* BUDGET PROGRESS */}

			{/* OVERVIEW */}

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
