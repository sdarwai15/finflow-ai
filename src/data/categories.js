// categories.js
export const defaultCategories = [
	// INCOME
	{
		id: 'INVESTMENT',
		name: 'Investments',
		type: 'INCOME',
		color: '#6366f1',
		icon: 'TrendingUp',
	},
	{
		id: 'SAVINGS',
		name: 'Savings',
		type: 'INCOME',
		color: '#0ea5e9',
		icon: 'PiggyBank',
	},
	{
		id: 'OTHER',
		name: 'Other Income',
		type: 'INCOME',
		color: '#94a3b8',
		icon: 'Plus',
	},

	// EXPENSE
	{
		id: 'FOOD',
		name: 'Food & Dining',
		type: 'EXPENSE',
		color: '#f43f5e',
		icon: 'UtensilsCrossed',
		subcategories: ['Groceries', 'Dining Out', 'Snacks'],
	},
	{
		id: 'TRANSPORT',
		name: 'Transportation',
		type: 'EXPENSE',
		color: '#f97316',
		icon: 'Car',
		subcategories: ['Fuel', 'Public Transit', 'Taxi', 'Parking'],
	},
	{
		id: 'UTILITIES',
		name: 'Utilities',
		type: 'EXPENSE',
		color: '#06b6d4',
		icon: 'Zap',
		subcategories: ['Electricity', 'Water', 'Internet', 'Phone'],
	},
	{
		id: 'ENTERTAINMENT',
		name: 'Entertainment',
		type: 'EXPENSE',
		color: '#8b5cf6',
		icon: 'Film',
		subcategories: ['Movies', 'Games', 'Streaming Services'],
	},
	{
		id: 'HEALTH',
		name: 'Healthcare',
		type: 'EXPENSE',
		color: '#14b8a6',
		icon: 'HeartPulse',
		subcategories: ['Medical', 'Pharmacy', 'Insurance'],
	},
	{
		id: 'INVESTMENT',
		name: 'Investments',
		type: 'EXPENSE',
		color: '#6366f1',
		icon: 'TrendingDown',
		subcategories: ['Stocks', 'Crypto', 'Mutual Funds'],
	},
	{
		id: 'SAVINGS',
		name: 'Savings',
		type: 'EXPENSE',
		color: '#0ea5e9',
		icon: 'PiggyBank',
		subcategories: ['Emergency Fund', 'Fixed Deposit'],
	},
	{
		id: 'OTHER',
		name: 'Other Expenses',
		type: 'EXPENSE',
		color: '#94a3b8',
		icon: 'MoreHorizontal',
		subcategories: ['Miscellaneous'],
	},
];

export const categoryColors = defaultCategories.reduce((acc, category) => {
	acc[category.id] = category.color;
	return acc;
}, {});
