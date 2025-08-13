/**
 * @function serializeAccount
 * Converts Prisma Decimal fields to numbers for client consumption
 * @param {Object} obj - Account or transaction-like object
 * @returns {Object} Serialized object
 */
export const serializeAccount = (obj) => {
	const clone = { ...obj };
	if (obj?.balance?.toNumber) clone.balance = obj.balance.toNumber();
	if (obj?.amount?.toNumber) clone.amount = obj.amount.toNumber();
	return clone;
};
