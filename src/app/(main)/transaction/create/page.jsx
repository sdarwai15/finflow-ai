export const dynamic = 'force-dynamic';

import React from 'react';
import { getUserAccounts } from '@/actions/dashboard';
import AddTransactionForm from '../_components/AddTransactionForm';
import { defaultCategories } from '@/data/categories';
import { getTransaction } from '@/actions/transaction';

const AddTransaction = async ({ searchParams }) => {
	const accounts = await getUserAccounts();
	const editId = (await searchParams)?.edit ?? null;

	let initialData = null;
	if (editId) {
		const transaction = await getTransaction(editId);
		initialData = transaction;
	}
	return (
		<div className="max-w-3xl mx-auto px-5">
			<div className="flex justify-center md:justify-normal mb-8">
				<h1 className="text-5xl gradient gradient-title">
					{editId ? 'Edit' : 'Add'} Transaction
				</h1>
			</div>
			<AddTransactionForm
				accounts={accounts}
				categories={defaultCategories}
				editMode={!!editId}
				initialData={initialData}
			/>
		</div>
	);
};

export default AddTransaction;
