import { PlanlyLogo } from './planly-logo';
import { Navigation } from './navigation';
import { UserMenu } from './user-menu';

interface HeaderProps {
	user: {
		name?: string | null;
		email?: string | null;
		role?: string;
	};
}

export function Header({ user }: HeaderProps) {
	return (
		<header className='sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl'>
			<div className='max-w-7xl mx-auto'>
				<div className='flex items-center justify-between h-16'>
					<PlanlyLogo size={120} />
					<div className='flex items-center gap-4'>
						<Navigation />
						<UserMenu user={user} />
					</div>
				</div>
			</div>
		</header>
	);
}
