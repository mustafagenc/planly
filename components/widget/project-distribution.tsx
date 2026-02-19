'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectDistributionProps {
	projectSummary: Record<string, number>;
	totalDays: number;
}

export function ProjectDistribution({ projectSummary, totalDays }: ProjectDistributionProps) {
	const entries = Object.entries(projectSummary).sort(([, a], [, b]) => b - a);

	if (entries.length === 0) return null;

	return (
		<Card className='border-border/60'>
			<CardHeader>
				<CardTitle className='text-base'>Proje Dağılımı</CardTitle>
				<CardDescription className='text-xs'>Proje bazlı toplam efor</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
					{entries.map(([project, days]) => (
						<div key={project} className='space-y-1.5'>
							<div className='flex items-center justify-between'>
								<p className='text-sm font-medium'>{project}</p>
								<span className='text-xs font-semibold text-muted-foreground tabular-nums'>
									{days} gün
								</span>
							</div>
							<div className='h-1.5 w-full bg-secondary rounded-full overflow-hidden'>
								<div
									className='h-full bg-primary/80 rounded-full transition-all duration-500'
									style={{
										width: `${totalDays > 0 ? (days / totalDays) * 100 : 0}%`,
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
