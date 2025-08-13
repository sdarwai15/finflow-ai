import React, { Suspense } from 'react';
import { getAccountWithTransactions } from '../../../../../actions/accounts';
import NotFound from '@/app/not-found';
import TransactionTable from '../_components/TransactionTable';
import { BarLoader } from 'react-spinners';
import AccountChart from '../_components/AccountChart';

const AccountPage = async ({ params }) => {
	const accountData = await getAccountWithTransactions(params.id);

	if (!accountData) {
		return <NotFound />;
	}

	const { transactions, ...account } = accountData.data;

	return (
		<div className="space-y-8 px-5">
			<div className="flex gap-4 items-end justify-between">
				<div>
					<h1 className="text-5xl sm:text-6xl font-bold gradient gradient-title capitalize">
						{account.name}
					</h1>
					<p className="text-muted-foreground">
						{account.type.charAt(0) + account.type.slice(1).toLowerCase()}{' '}
						Account
					</p>
				</div>

				<div className="text-right pb-2">
					<div className="text-xl sm:text-2xl font-bold">
						${parseFloat(account.balance).toFixed(2)}
					</div>
					<p className="text-sm text-muted-foreground">
						{account._count.transactions} Transactions
					</p>
				</div>
			</div>

			{/* CHART SECTION */}
			<Suspense
				fallback={<BarLoader className="mt-4" width={'100%'} color="#9333ea" />}
			>
				<AccountChart transactions={transactions} />
			</Suspense>

			{/* TRANSACTIONS TABLE */}
			<Suspense
				fallback={<BarLoader className="mt-4" width={'100%'} color="#9333ea" />}
			>
				<TransactionTable transactions={transactions} />
			</Suspense>
		</div>
	);
};

export default AccountPage;
