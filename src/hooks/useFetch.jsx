import { useState, useCallback } from 'react';

/**
 * useFetch - a utility hook for handling async data fetching.
 *
 * @param {Function} callback - Async function to fetch data.
 * @param {Object} options - Optional settings.
 * @param {boolean} options.toastErrors - Whether to toast errors (default: false).
 *
 * @returns {{
 *   data: any,
 *   loading: boolean,
 *   error: Error | null,
 *   execute: Function,
 *   setData: Function
 * }}
 */
const useFetch = (callback, { toastErrors = false } = {}) => {
	const [data, setData] = useState(undefined);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const execute = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);

			try {
				const result = await callback(...args);
				setData(result);
				if (toastErrors && typeof window !== 'undefined') {
					const { toast } = await import('sonner'); // dynamically import to decouple
					toast.success('Operation successful');
				}
				// Return the result for further processing if needed
				return result;
			} catch (err) {
				setError(err);
				if (toastErrors && typeof window !== 'undefined') {
					const { toast } = await import('sonner'); // dynamically import to decouple
					toast.error(err.message || 'Something went wrong');
				}
				return null;
			} finally {
				setLoading(false);
			}
		},
		[callback, toastErrors]
	);

	return { data, loading, error, execute, setData };
};

export default useFetch;
