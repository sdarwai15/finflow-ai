'use client';

import { useState, useMemo } from 'react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

/**
 * @typedef {Object} Transaction
 * @property {string} date - ISO date string
 * @property {"INCOME" | "EXPENSE"} type
 * @property {number} amount
 */

/**
 * Date range configuration
 */
const DATE_RANGES = Object.freeze({
	'7D': { label: 'Last 7 Days', days: 7 },
	'1M': { label: 'Last Month', days: 30 },
	'3M': { label: 'Last 3 Months', days: 90 },
	'6M': { label: 'Last 6 Months', days: 180 },
	ALL: { label: 'All Time', days: null },
});

/**
 * Filters transactions by selected date range.
 * @param {Transaction[]} transactions
 * @param {number|null} days
 * @returns {Transaction[]}
 */
const filterTransactionsByRange = (transactions, days) => {
	if (!Array.isArray(transactions)) return [];

	const now = new Date();
	const startDate = days
		? startOfDay(subDays(now, days))
		: startOfDay(new Date(0));

	return transactions.filter((t) => {
		const txDate = new Date(t.date);
		return txDate >= startDate && txDate <= endOfDay(now);
	});
};

/**
 * Groups transactions by date and aggregates income & expenses.
 * @param {Transaction[]} transactions
 * @returns {{date: string, income: number, expense: number}[]}
 */
const groupTransactionsByDate = (transactions) => {
	if (!transactions.length) return [];

	const grouped = transactions.reduce((acc, tx) => {
		const dateKey = format(new Date(tx.date), 'MMM dd');
		if (!acc[dateKey]) acc[dateKey] = { date: dateKey, income: 0, expense: 0 };

		if (tx.type === 'INCOME') acc[dateKey].income += tx.amount;
		else acc[dateKey].expense += tx.amount;

		return acc;
	}, {});

	return Object.values(grouped).sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);
};

/**
 * Calculates total income and expenses.
 * @param {{income:number, expense:number}[]} data
 * @returns {{income:number, expense:number}}
 */
const calculateTotals = (data) => {
	return data.reduce(
		(acc, day) => ({
			income: acc.income + day.income,
			expense: acc.expense + day.expense,
		}),
		{ income: 0, expense: 0 }
	);
};

const AccountChart = ({ transactions = [] }) => {
	const [dateRange, setDateRange] = useState('1M');

	const filteredData = useMemo(() => {
		const range = DATE_RANGES[dateRange];
		return groupTransactionsByDate(
			filterTransactionsByRange(transactions, range.days)
		);
	}, [transactions, dateRange]);

	const totals = useMemo(() => calculateTotals(filteredData), [filteredData]);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-7">
				<CardTitle className="text-base font-normal">
					Transaction Overview
				</CardTitle>
				<Select value={dateRange} onValueChange={setDateRange}>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Select range" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(DATE_RANGES).map(([key, { label }]) => (
							<SelectItem key={key} value={key}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardHeader>

			<CardContent>
				{/* Totals summary */}
				<div className="flex justify-around mb-6 text-sm">
					{[
						{
							label: 'Total Income',
							value: totals.income,
							color: 'text-green-500',
						},
						{
							label: 'Total Expenses',
							value: totals.expense,
							color: 'text-red-500',
						},
						{
							label: 'Net',
							value: totals.income - totals.expense,
							color:
								totals.income - totals.expense >= 0
									? 'text-green-500'
									: 'text-red-500',
						},
					].map(({ label, value, color }) => (
						<div key={label} className="text-center">
							<p className="text-muted-foreground">{label}</p>
							<p className={`text-lg font-bold ${color}`}>
								${value.toFixed(2)}
							</p>
						</div>
					))}
				</div>

				{/* Chart */}
				<div className="h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={filteredData}
							margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="date"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								fontSize={12}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v) => `$${v}`}
							/>
							<Tooltip
								formatter={(value) => [`$${value}`, undefined]}
								contentStyle={{
									backgroundColor: 'hsl(var(--popover))',
									border: '1px solid hsl(var(--border))',
									borderRadius: 'var(--radius)',
								}}
							/>
							<Legend />
							<Bar
								dataKey="income"
								name="Income"
								fill="#22c55e"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="expense"
								name="Expense"
								fill="#ef4444"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
};

export default AccountChart;
