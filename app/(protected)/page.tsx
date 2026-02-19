import { MonthlyEffortReport } from '@/components/monthly-effort-report';

export const dynamic = 'force-dynamic';

export default function HomePage() {
	return (
		<div className='animate-in'>
			<MonthlyEffortReport />
		</div>
	);
}
