'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import useFetch from '@/hooks/useFetch';
import { updateBudget } from '../../../../../actions/budget';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BudgetProgress({ initialBudget, currentExpenses }) {
	const [isEditing, setIsEditing] = useState(false);
	const [newBudget, setNewBudget] = useState(
		initialBudget?.amount?.toString() ?? ''
	);

	const {
		loading: isLoading,
		fn: updateBudgetFn,
		data: updatedBudget,
		error,
	} = useFetch(updateBudget);

	// Compute percent only when inputs change
	const percentUsed = useMemo(() => {
		if (!initialBudget?.amount || initialBudget.amount <= 0) return 0;
		return (currentExpenses / initialBudget.amount) * 100;
	}, [initialBudget, currentExpenses]);

	const handleUpdateBudget = useCallback(async () => {
		const amount = parseFloat(newBudget);

		if (isNaN(amount) || amount <= 0) {
			toast.error('Please enter a valid positive amount');
			return;
		}

		await updateBudgetFn(amount);
	}, [newBudget, updateBudgetFn]);

	const handleCancel = useCallback(() => {
		setNewBudget(initialBudget?.amount?.toString() ?? '');
		setIsEditing(false);
	}, [initialBudget]);

	// Handle success
	useEffect(() => {
		if (updatedBudget?.success) {
			setIsEditing(false);
			toast.success('Budget updated successfully');
		}
	}, [updatedBudget]);

	// Handle error
	useEffect(() => {
		if (error) {
			toast.error(error.message || 'Failed to update budget');
		}
	}, [error]);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex-1">
					<CardTitle className="text-sm font-medium">
						Monthly Budget (Default Account)
					</CardTitle>

					<div className="flex items-center gap-2 mt-1">
						{isEditing ? (
							<div className="flex items-center gap-2">
								<Input
									type="number"
									inputMode="decimal"
									min="1"
									step="0.01"
									value={newBudget}
									onChange={(e) => setNewBudget(e.target.value)}
									className="w-32"
									placeholder="Enter amount"
									autoFocus
									disabled={isLoading}
									aria-label="Budget amount"
								/>

								<Button
									variant="ghost"
									size="icon"
									onClick={handleUpdateBudget}
									disabled={isLoading}
									aria-label="Save budget"
								>
									<Check className="h-4 w-4 text-green-500" />
								</Button>

								<Button
									variant="ghost"
									size="icon"
									onClick={handleCancel}
									disabled={isLoading}
									aria-label="Cancel edit"
								>
									<X className="h-4 w-4 text-red-500" />
								</Button>
							</div>
						) : (
							<>
								<CardDescription>
									{initialBudget
										? `$${currentExpenses.toFixed(
												2
										  )} of $${initialBudget.amount.toFixed(2)} spent`
										: 'No budget set'}
								</CardDescription>

								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsEditing(true)}
									className="h-6 w-6"
									aria-label="Edit budget"
								>
									<Pencil className="h-3 w-3" />
								</Button>
							</>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{initialBudget && (
					<div className="space-y-2">
						<Progress
							value={percentUsed}
							extraStyles={
								percentUsed >= 90
									? 'bg-red-500'
									: percentUsed >= 75
									? 'bg-yellow-500'
									: 'bg-green-500'
							}
						/>
						<p className="text-xs text-muted-foreground text-right">
							{percentUsed.toFixed(1)}% used
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
