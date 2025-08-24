import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Header from '@/components/header';
import BodyWrapper from '@/components/BodyWrapper';
import { Toaster } from 'sonner';

export const metadata = {
	title: 'FinFlow AI',
	description: 'Your AI-powered financial assistant',
};

export default function RootLayout({ children }) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning={true}>
				<BodyWrapper>
					{/* HEADER */}
					<Header />

					{/* MAIN CONTENT */}
					<main className="min-h-screen">{children}</main>

					{/* TOASTER */}
					<Toaster />

					{/* FOOTER */}
					<footer className="bg-blue-50 py-12">
						<div className="container px-4 mx-auto text-center text-gray-600">
							<p>© 2025 FinFlow AI. All rights reserved.</p>
						</div>
					</footer>
				</BodyWrapper>
			</html>
		</ClerkProvider>
	);
}
