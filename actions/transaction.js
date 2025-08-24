'use server';

import aj from '@/lib/arcjet';
import { db } from '@/lib/prisma';
import { DASHBOARD_PATH } from '@/lib/routes';
import { serializeAccount } from '@/lib/serializeAccount';
import { getUserFromClerk } from '@/src/lib/auth';
import { request } from '@arcjet/next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { revalidatePath } from 'next/cache';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Utils
const calculateNextRecurringDate = (startDate, interval) => {
	const date = new Date(startDate);

	switch (interval) {
		case 'DAILY':
			date.setDate(date.getDate() + 1);
			break;
		case 'WEEKLY':
			date.setDate(date.getDate() + 7);
			break;
		case 'MONTHLY':
			date.setMonth(date.getMonth() + 1);
			break;
		case 'YEARLY':
			date.setFullYear(date.getFullYear() + 1);
			break;
	}

	return date;
};

// Transactions
export async function createTransaction(data) {
	try {
		const user = await getUserFromClerk();

		// Rate Limiting with ArcJet
		const req = await request();
		const decision = await aj.protect(req, { userId: user.id, requested: 1 });

		if (decision.isDenied()) {
			if (decision.reason.isRateLimit()) {
				const { remaining, reset } = decision.reason;
				console.error({
					code: 'RATE_LIMIT_EXCEEDED',
					details: {
						remaining,
						resetInSeconds: reset,
					},
				});

				throw new Error('Too many requests. Please try again later.');
			}

			throw new Error('Request blocked');
		}

		// Account Check
		const account = await db.account.findUnique({
			where: {
				id: data.accountId,
				userId: user.id,
			},
		});

		if (!account) {
			throw new Error('Account not found');
		}

		// Balance Calculation
		const balanceChange = data.type === 'EXPENSE' ? -data.amount : data.amount;
		const newBalance = account.balance.toNumber() + balanceChange;

		// Transaction & Balance Update
		const transaction = await db.$transaction(async (tx) => {
			const newTransaction = await tx.transaction.create({
				data: {
					...data,
					userId: user.id,
					nextRecurringDate:
						data.isRecurring && data.recurringInterval
							? calculateNextRecurringDate(data.date, data.recurringInterval)
							: null,
				},
			});

			await tx.account.update({
				where: { id: data.accountId },
				data: { balance: newBalance },
			});

			return newTransaction;
		});

		revalidatePath(DASHBOARD_PATH);
		revalidatePath(`/account/${transaction.accountId}`);

		return { success: true, data: serializeAccount(transaction) };
	} catch (error) {
		throw new Error(error.message);
	}
}

export async function getTransaction(id) {
	const user = await getUserFromClerk();

	const transaction = await db.transaction.findUnique({
		where: {
			id,
			userId: user.id,
		},
	});

	if (!transaction) throw new Error('Transaction not found');

	return serializeAccount(transaction);
}

export async function updateTransaction(id, data) {
	try {
		const user = await getUserFromClerk();

		// Fetch Original Transaction
		const originalTransaction = await db.transaction.findUnique({
			where: {
				id,
				userId: user.id,
			},
			include: {
				account: true,
			},
		});

		if (!originalTransaction) throw new Error('Transaction not found');

		// Balance Adjustments
		const oldBalanceChange =
			originalTransaction.type === 'EXPENSE'
				? -originalTransaction.amount.toNumber()
				: originalTransaction.amount.toNumber();

		const newBalanceChange =
			data.type === 'EXPENSE' ? -data.amount : data.amount;

		const netBalanceChange = newBalanceChange - oldBalanceChange;

		// Update transaction and account balance in a transaction
		const transaction = await db.$transaction(async (tx) => {
			const updated = await tx.transaction.update({
				where: {
					id,
					userId: user.id,
				},
				data: {
					...data,
					nextRecurringDate:
						data.isRecurring && data.recurringInterval
							? calculateNextRecurringDate(data.date, data.recurringInterval)
							: null,
				},
			});

			// Update account balance
			await tx.account.update({
				where: { id: data.accountId },
				data: {
					balance: {
						increment: netBalanceChange,
					},
				},
			});

			return updated;
		});

		revalidatePath(DASHBOARD_PATH);
		revalidatePath(`/account/${data.accountId}`);

		return { success: true, data: serializeAccount(transaction) };
	} catch (error) {
		throw new Error(error.message);
	}
}

export async function getUserTransactions(query = {}) {
	try {
		const user = await getUserFromClerk();

		const transactions = await db.transaction.findMany({
			where: {
				userId: user.id,
				...query,
			},
			include: {
				account: true,
			},
			orderBy: {
				date: 'desc',
			},
		});

		return { success: true, data: transactions };
	} catch (error) {
		throw new Error(error.message);
	}
}

export async function scanReceipt(file) {
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

		// Converting file to ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();

		// ArrayBuffer to base64 string
		const base64String = Buffer.from(arrayBuffer).toString('base64');

		const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object`;

		const result = await model.generateContent([
			{
				inlineData: {
					data: base64String,
					mimeType: file.type,
				},
			},
			prompt,
		]);

		const response = await result.response;
		const text = response.text();
		const cleanedText = text.replace(/```(?:json)?\n?/g, '').trim();

		try {
			const data = JSON.parse(cleanedText || '{}');
			return {
				amount: parseFloat(data.amount),
				date: new Date(data.date),
				description: data.description,
				category: data.category,
				merchantName: data.merchantName,
			};
		} catch (error) {
			console.error('Error parsing JSON response:', parseError);
			throw new Error('Invalid response format from Gemini');
		}
	} catch (error) {
		console.error('Error scanning receipt:', error);
		throw new Error('Failed to scan receipt');
	}
}
