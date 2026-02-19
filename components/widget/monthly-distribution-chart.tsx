'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import type { YearlyStats } from '@/app/actions/work-log';

const CHART_COLORS = {
	annualPlan: 'hsl(220, 70%, 55%)',
	adHoc: 'hsl(35, 90%, 55%)',
};

interface MonthlyDistributionChartProps {
	yearlyStats: YearlyStats;
}

export function MonthlyDistributionChart({ yearlyStats }: MonthlyDistributionChartProps) {
	return (
		<Card className='md:col-span-2 border-border/60'>
			<CardHeader>
				<CardTitle className='text-base'>Aylık Dağılım ({yearlyStats.year})</CardTitle>
				<CardDescription className='text-xs'>
					Yıllık İş Planı vs Plan Harici İşler
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width='100%' height={320}>
					<BarChart
						data={yearlyStats.months}
						margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray='3 3' className='opacity-30' />
						<XAxis dataKey='monthLabel' tick={{ fontSize: 12 }} />
						<YAxis tick={{ fontSize: 12 }} unit=' gün' />
						<Tooltip
							formatter={(value, name) => [`${value ?? 0} gün`, name ?? '']}
							labelStyle={{ fontWeight: 'bold' }}
						/>
						<Legend />
						<Bar
							dataKey='annualPlanDays'
							name='Yıllık İş Planı'
							fill={CHART_COLORS.annualPlan}
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							dataKey='adHocDays'
							name='Plan Harici İşler'
							fill={CHART_COLORS.adHoc}
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
