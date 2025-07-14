'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from './ui/drawer';
import { Input } from './ui/input';
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
	SelectItem,
} from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';

import { accountSchema } from '@/app/lib/schema';
import useFetch from '@/hooks/useFetch';
import { createAccount } from '../../actions/dashboard';

const CreateAccountDrawer = ({ children }) => {
	const [open, setOpen] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		reset,
	} = useForm({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			name: '',
			type: 'CURRENT',
			balance: '',
			isDefault: false,
		},
	});

	const {
		loading: isSubmitting,
		execute: executeAsync,
		data: createdAccount,
		error,
	} = useFetch(createAccount, { toastErrors: true });

	useEffect(() => {
		if (createdAccount && !isSubmitting) {
			toast.success('Account created successfully!');
			reset();
			setOpen(false);
		}
	}, [createdAccount, isSubmitting, reset]);

	const onSubmit = (formData) => {
		executeAsync(formData);
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Create New Account</DrawerTitle>
				</DrawerHeader>

				<div className="px-4 pb-4">
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						{/* Account Name */}
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium">
								Account Name
							</label>
							<Input
								id="name"
								placeholder="e.g., Main Checking"
								autoComplete="off"
								{...register('name')}
							/>
							{errors.name && (
								<p className="text-red-500 text-sm">{errors.name.message}</p>
							)}
						</div>

						{/* Account Type */}
						<div className="space-y-2">
							<label htmlFor="type" className="text-sm font-medium">
								Account Type
							</label>
							<Select
								value={watch('type')}
								onValueChange={(value) => setValue('type', value)}
							>
								<SelectTrigger id="type">
									<SelectValue placeholder="Select Account Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="CURRENT">Current</SelectItem>
									<SelectItem value="SAVINGS">Savings</SelectItem>
								</SelectContent>
							</Select>
							{errors.type && (
								<p className="text-red-500 text-sm">{errors.type.message}</p>
							)}
						</div>

						{/* Balance */}
						<div className="space-y-2">
							<label htmlFor="balance" className="text-sm font-medium">
								Initial Balance
							</label>
							<Input
								id="balance"
								type="number"
								step="0.01"
								placeholder="0.00"
								{...register('balance')}
							/>
							{errors.balance && (
								<p className="text-red-500 text-sm">{errors.balance.message}</p>
							)}
						</div>

						{/* Default Switch */}
						<div className="flex items-center justify-between border rounded-lg p-3">
							<div className="space-y-0.5">
								<label htmlFor="isDefault" className="text-sm font-medium">
									Set As Default Account
								</label>
								<p className="text-sm text-muted-foreground">
									This account will be selected by default for transactions.
								</p>
							</div>
							<Switch
								id="isDefault"
								checked={watch('isDefault')}
								onCheckedChange={(checked) => setValue('isDefault', checked)}
							/>
						</div>

						{/* Buttons */}
						<div className="flex gap-4 pt-4">
							<DrawerClose asChild>
								<Button
									type="button"
									variant="outline"
									className="flex-1"
									disabled={isSubmitting}
								>
									Cancel
								</Button>
							</DrawerClose>

							<Button type="submit" className="flex-1" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-1 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									'Create Account'
								)}
							</Button>
						</div>
					</form>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default CreateAccountDrawer;
