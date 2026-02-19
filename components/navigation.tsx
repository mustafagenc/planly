'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, List, Kanban, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
	{ href: '/', label: 'Raporlar', icon: BarChart3 },
	{ href: '/tasks', label: 'İş Listesi', icon: List },
	{ href: '/board', label: 'Kanban', icon: Kanban },
	{ href: '/definitions', label: 'Tanımlamalar', icon: Settings2 },
] as const;

export function Navigation() {
	const pathname = usePathname();

	return (
		<nav className='inline-flex h-11 gap-1 rounded-xl bg-muted/60 p-1 backdrop-blur-sm'>
			{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
				const isActive = pathname === href;

				return (
					<Link
						key={href}
						href={href}
						className={cn(
							'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
							isActive
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground hover:bg-background/50',
						)}
					>
						<Icon className='h-4 w-4' />
						<span className='hidden sm:inline'>{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
