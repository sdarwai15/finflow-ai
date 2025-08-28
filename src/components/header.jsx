export const dynamic = 'force-dynamic';

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, PenBox } from 'lucide-react';

import { checkUser } from '@/lib/auth';
import { Button } from './ui/button';

const Header = async () => {
	await checkUser();

	return (
		<div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
			<nav className="container p-4 mx-auto flex items-center justify-between">
				<Link href={'/'} className={'cursor-pointer'}>
					<Image
						src={'/logo.png'}
						alt="finflow-ai-logo"
						width={120}
						height={120}
						className="object-contain"
					/>
				</Link>

				<div className="flex items-center space-x-4">
					<SignedIn>
						<Link
							href="/dashboard"
							className="
                                flex 
                                items-center 
                                gap-2 
                                text-gray-600 
                                hover:text-blue-800
                            "
						>
							<Button className={'cursor-pointer'} variant={'outline'}>
								<LayoutDashboard size={18} />
								<span className="hidden md:inline">Dashboard</span>
							</Button>
						</Link>

						<Link
							href="/transaction/create"
							className="
                                flex 
                                items-center 
                                gap-2 
                                text-gray-600 
                                hover:text-blue-800
                            "
						>
							<Button className={'cursor-pointer'}>
								<PenBox size={18} />
								<span className="hidden md:inline">Add Transaction</span>
							</Button>
						</Link>
					</SignedIn>

					<SignedOut>
						<SignInButton forceRedirectUrl="/dashboard">
							<Button className={'cursor-pointer'} variant={'outline'}>
								Login
							</Button>
						</SignInButton>
					</SignedOut>

					<SignedIn>
						<UserButton
							appearance={{
								elements: {
									avatarBox: {
										width: '35px',
										height: '35px',
									},
								},
							}}
						/>
					</SignedIn>
				</div>
			</nav>
		</div>
	);
};

export default Header;
