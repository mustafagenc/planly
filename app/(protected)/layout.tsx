import { redirect } from 'next/navigation';
import { auth } from '@/app/auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect('/login');
	}

	const user = {
		name: session.user?.name,
		email: session.user?.email,
		role: (session.user as { role?: string })?.role,
	};

	return (
		<div className='min-h-screen bg-background bg-dots flex flex-col'>
			<Header user={user} />
			<main className='flex-1 px-6 py-8 lg:px-8'>
				<div className='max-w-7xl mx-auto'>{children}</div>
			</main>
			<Footer />
		</div>
	);
}
