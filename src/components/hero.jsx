'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

const HeroSection = () => {
	const BannerRef = useRef();

	useEffect(() => {
		const bannerElement = BannerRef.current;
		if (!bannerElement) return;

		const scrollThreshold = 120;

		const handleScroll = () => {
			const isScrolled = window.scrollY > scrollThreshold;
			bannerElement.classList.toggle('scrolled', isScrolled);
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // initial check

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<div className="pb-30 px-4">
			<div className="container mx-auto text-center">
				<h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient gradient-title">
					Manage Your Finances <br /> with Intelligence
				</h1>
				<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
					An AI-powered financial management platform that helps you track,
					analyze, and optimize your spending with real-time insights.
				</p>
				<div>
					<Link href="/dashboard">
						<Button size={'lg'} className={'px-8 cursor-pointer'}>
							Get Started
						</Button>
					</Link>
				</div>
				<div className="banner-wrapper mt-5 md:mt-0">
					<div ref={BannerRef} className="banner">
						<Image
							src={'/banner.png'}
							alt="hero-image"
							width={1040}
							height={720}
							priority
							className="mx-auto rounded-lg shadow-2xl border"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
