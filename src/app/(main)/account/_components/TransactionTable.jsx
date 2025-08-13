'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import useFetch from '@/hooks/useFetch';
import { format } from 'date-fns';
import {
	ChevronDown,
	ChevronUp,
	Clock,
	MoreHorizontal,
	RefreshCw,
	Search,
	Trash,
	X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { bulkDeleteTransactions } from '../../../../../actions/accounts';
import { BarLoader } from 'react-spinners';

const RECURRING_INTERVALS = {
	DAILY: 'Daily',
	WEEKLY: 'Weekly',
	MONTHLY: 'Monthly',
	YEARLY: 'Yearly',
};

const TransactionTable = ({ transactions }) => {
	const router = useRouter();

	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const [sortConfig, setSortConfig] = useState({
		field: 'date',
		direction: 'asc',
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [recurringFilter, setRecurringFilter] = useState('');

	const {
		loading: deleteLoading,
		execute: deleteExecuteFn,
		data: deleteData,
	} = useFetch(bulkDeleteTransactions, { toastErrors: true });

	// Derived data: filters + sorting
	const filteredAndSortedTransactions = useMemo(() => {
		let result = [...transactions];

		if (searchTerm.trim()) {
			const lowerSearch = searchTerm.toLowerCase();
			result = result.filter((t) =>
				t.description?.toLowerCase().includes(lowerSearch)
			);
		}

		if (recurringFilter) {
			result = result.filter((t) =>
				recurringFilter === 'recurring' ? t.isRecurring : !t.isRecurring
			);
		}

		if (typeFilter) {
			result = result.filter((t) => t.type === typeFilter);
		}

		result.sort((a, b) => {
			const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
			switch (sortConfig.field) {
				case 'date':
					return (new Date(a.date) - new Date(b.date)) * multiplier;
				case 'amount':
					return (a.amount - b.amount) * multiplier;
				case 'category':
					return a.category.localeCompare(b.category) * multiplier;
				default:
					return 0;
			}
		});

		return result;
	}, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

	// Handlers
	const sortHandler = useCallback((field) => {
		setSortConfig((prev) => ({
			field,
			direction:
				prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
		}));
	}, []);

	const handleSelect = useCallback((id) => {
		setSelectedTransactions((prev) =>
			prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
		);
	}, []);

	const handleSelectAll = useCallback(() => {
		setSelectedTransactions((prev) =>
			prev.length === filteredAndSortedTransactions.length
				? []
				: filteredAndSortedTransactions.map((t) => t.id)
		);
	}, [filteredAndSortedTransactions]);

	const handleBulkDelete = useCallback(async () => {
		if (!confirm(`Delete ${selectedTransactions.length} transactions?`)) return;
		await deleteExecuteFn(selectedTransactions);
	}, [deleteExecuteFn, selectedTransactions]);

	const handleClearFilters = useCallback(() => {
		setSearchTerm('');
		setTypeFilter('');
		setRecurringFilter('');
		setSelectedTransactions([]);
	}, []);

	useEffect(() => {
		if (deleteData && !deleteLoading) {
			setSelectedTransactions([]);
		}
	}, [deleteData, deleteLoading]);

	return (
		<div className="space-y-4">
			{deleteLoading && (
				<BarLoader className="mt-4" width="100%" color="#9333ea" />
			)}

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search transactions..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-8"
					/>
				</div>

				<div className="flex gap-2">
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-[130px]">
							<SelectValue placeholder="All Types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="INCOME">Income</SelectItem>
							<SelectItem value="EXPENSE">Expense</SelectItem>
						</SelectContent>
					</Select>

					<Select value={recurringFilter} onValueChange={setRecurringFilter}>
						<SelectTrigger className="w-[130px]">
							<SelectValue placeholder="All Transactions" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="recurring">Recurring Only</SelectItem>
							<SelectItem value="non-recurring">Non-recurring Only</SelectItem>
						</SelectContent>
					</Select>

					{selectedTransactions.length > 0 && (
						<Button variant="destructive" size="sm" onClick={handleBulkDelete}>
							<Trash className="h-4 w-4 mr-2" /> Delete (
							{selectedTransactions.length})
						</Button>
					)}

					{(searchTerm || typeFilter || recurringFilter) && (
						<Button
							variant="outline"
							size="icon"
							onClick={handleClearFilters}
							title="Clear filters"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">
								<Checkbox
									className="cursor-pointer"
									onCheckedChange={handleSelectAll}
									checked={
										selectedTransactions.length ===
											filteredAndSortedTransactions.length &&
										filteredAndSortedTransactions.length > 0
									}
								/>
							</TableHead>
							<TableHead
								className="cursor-pointer"
								onClick={() => sortHandler('date')}
							>
								<div className="flex items-center">
									Date
									{sortConfig.field === 'date' &&
										(sortConfig.direction === 'asc' ? (
											<ChevronUp className="ml-1 h-4 w-4" />
										) : (
											<ChevronDown className="ml-1 h-4 w-4" />
										))}
								</div>
							</TableHead>
							<TableHead>Description</TableHead>
							<TableHead
								className="cursor-pointer"
								onClick={() => sortHandler('category')}
							>
								<div className="flex items-center">
									Category
									{sortConfig.field === 'category' &&
										(sortConfig.direction === 'asc' ? (
											<ChevronUp className="ml-1 h-4 w-4" />
										) : (
											<ChevronDown className="ml-1 h-4 w-4" />
										))}
								</div>
							</TableHead>
							<TableHead
								className="cursor-pointer"
								onClick={() => sortHandler('amount')}
							>
								<div className="flex items-center justify-end">
									Amount
									{sortConfig.field === 'amount' &&
										(sortConfig.direction === 'asc' ? (
											<ChevronUp className="ml-1 h-4 w-4" />
										) : (
											<ChevronDown className="ml-1 h-4 w-4" />
										))}
								</div>
							</TableHead>
							<TableHead>Recurring</TableHead>
							<TableHead className="w-[50px]" />
						</TableRow>
					</TableHeader>

					<TableBody>
						{filteredAndSortedTransactions.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center text-muted-foreground"
								>
									No Transactions Found
								</TableCell>
							</TableRow>
						) : (
							filteredAndSortedTransactions.map((transaction) => (
								<TableRow key={transaction.id}>
									<TableCell>
										<Checkbox
											className="cursor-pointer"
											onCheckedChange={() => handleSelect(transaction.id)}
											checked={selectedTransactions.includes(transaction.id)}
										/>
									</TableCell>
									<TableCell>
										{format(new Date(transaction.date), 'PP')}
									</TableCell>
									<TableCell>{transaction.description}</TableCell>
									<TableCell>
										<span
											style={{
												background: categoryColors[transaction.category],
											}}
											className="px-2 py-1 rounded text-white text-sm capitalize"
										>
											{transaction.category}
										</span>
									</TableCell>
									<TableCell
										className="text-right font-medium"
										style={{
											color: transaction.type === 'INCOME' ? 'green' : 'red',
										}}
									>
										{transaction.type === 'INCOME' ? '+' : '-'}$
										{transaction.amount.toFixed(2)}
									</TableCell>
									<TableCell>
										{transaction.isRecurring ? (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Badge
															variant="outline"
															className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
														>
															<RefreshCw className="h-3 w-3" />
															{RECURRING_INTERVALS[
																transaction.recurringInterval
															] || 'Daily'}
														</Badge>
													</TooltipTrigger>
													<TooltipContent>
														<div className="text-sm">
															<div className="font-medium">Next Date:</div>
															<div>
																{format(
																	new Date(transaction.nextRecurringDate),
																	'PP'
																)}
															</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										) : (
											<Badge variant="outline" className="gap-1">
												<Clock className="h-3 w-3" /> One-time
											</Badge>
										)}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem
													onClick={() =>
														router.push(
															`/transactions/create?edit=${transaction.id}`
														)
													}
												>
													Edit
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => deleteExecuteFn([transaction.id])}
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default TransactionTable;
