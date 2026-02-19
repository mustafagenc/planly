import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Noto_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from '@/components/session-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const notoSans = Noto_Sans({ variable: '--font-sans' });

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const APP_NAME = 'Planly';
const APP_DESCRIPTION = 'Kişisel iş planlama ve takip uygulaması';

export const viewport: Viewport = {
	themeColor: '#09090b',
};

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_NAME,
		template: `%s — ${APP_NAME}`,
	},
	description: APP_DESCRIPTION,
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: APP_NAME,
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: 'website',
		siteName: APP_NAME,
		title: APP_NAME,
		description: APP_DESCRIPTION,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='tr' className={notoSans.variable} suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
			>
				<SessionProvider>
					<ThemeProvider
						attribute='class'
						defaultTheme='system'
						enableSystem
						disableTransitionOnChange
					>
						<TooltipProvider>{children}</TooltipProvider>
						<Analytics />
					</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
