'use client';

import { Geist } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });

export default function BodyWrapper({ children }) {
	return <body className={geist.className}>{children}</body>;
}
