import { version } from '@/package.json';
import { CompactThemeSwitcher } from '@/components/compact-theme-switcher';

export function Footer() {
	return (
		<footer className='w-full border-t border-border/50 py-4 bg-background'>
			<div className='max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between'>
				<p className='text-xs text-muted-foreground/70'>
					&copy; {new Date().getFullYear()} Mustafa Genç
				</p>
				<div className='flex items-center gap-3'>
					<span className='text-xs text-muted-foreground/50 font-mono'>
						v{version}
					</span>
					<CompactThemeSwitcher />
				</div>
			</div>
		</footer>
	);
}
