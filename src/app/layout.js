import { ClerkProvider } from '@clerk/nextjs';
import { Geist } from 'next/font/google';

import './globals.css';

import Header from '@/components/header';

const geist = Geist({
	subsets: ['latin'],
});

export const metadata = {
	title: 'FinFlow AI',
	description: 'Your AI-powered financial assistant',
};

export default function RootLayout({ children }) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={`${geist.className}`}>
					{/* HEADER */}
					<Header />

					{/* MAIN CONTENT */}
					<main className="min-h-screen">{children}</main>

					{/* FOOTER */}
					<footer className="bg-blue-50 py-12">
						<div className="container px-4 mx-auto text-center text-gray-600">
							<p>© 2025 FinFlow AI. All rights reserved.</p>
						</div>
					</footer>
				</body>
			</html>
		</ClerkProvider>
	);
}
