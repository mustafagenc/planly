import { version } from '@/package.json';
import { CompactThemeSwitcher } from '@/components/compact-theme-switcher';
import Link from 'next/link';

export function Footer() {
	return (
		<footer className='w-full border-t border-border/50 py-4 bg-background'>
			<div className='max-w-7xl mx-auto flex items-center justify-between'>
				<p className='text-xs text-muted-foreground/70'>
					&copy; {new Date().getFullYear()}{' '}
					<Link href='https://mustafagenc.info'>Mustafa Genç</Link>
				</p>
				<div className='flex items-center gap-3'>
					<span className='text-xs text-muted-foreground/50 font-mono'>v{version}</span>
					<CompactThemeSwitcher />
				</div>
			</div>
		</footer>
	);
}
