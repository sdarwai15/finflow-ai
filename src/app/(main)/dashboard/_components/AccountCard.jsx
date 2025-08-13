'use client';

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/useFetch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { updateDefaultAccount } from '../../../../../actions/accounts';
import { toast } from 'sonner';
import { useEffect } from 'react';

const AccountCard = ({ account }) => {
	const { id, name, type, balance, isDefault } = account;

	const {
		loading: updateDefaultLoading,
		data: updatedAccount,
		execute: updateDefaultAccountFn,
		error,
	} = useFetch(updateDefaultAccount);

	const handleDefaultChange = async (e) => {
		e.preventDefault();

		if (isDefault) {
			toast.warning('You need atleast 1 default account.');
			return;
		}

		updateDefaultAccountFn(id);
	};

	useEffect(() => {
		if (updatedAccount?.success) {
			toast.success('Default Account Updated Successfully!');
		}
	}, [updatedAccount, updateDefaultLoading]);

	useEffect(() => {
		if (error) {
			toast.error(error.message || 'Failed to Update Default Account');
		}
	}, [error]);

	return (
		<Card className="hover:shadow-md transition-shadow cursor-pointer group relative">
			<Link href={`/account/${id}`}>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium capitalize">
						{name}
					</CardTitle>
					<Switch
						checked={isDefault}
						onClick={handleDefaultChange}
						disabled={updateDefaultLoading}
						className={'cursor-pointer'}
					/>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						${parseFloat(balance).toFixed(2)}
					</div>
					<p className="text-xs text-muted-foreground">
						{type.charAt(0) + type.slice(1).toLowerCase()} Account
					</p>
				</CardContent>
				<CardFooter className="flex justify-between text-sm text-muted-foreground">
					<div className="flex items-center">
						<ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
						Income
					</div>
					<div className="flex items-center">
						<ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
						Expense
					</div>
				</CardFooter>
			</Link>
		</Card>
	);
};

export default AccountCard;
