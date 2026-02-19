'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getWorkLogs, getYearlyWorkStats } from '@/app/actions/work-log';
import type { YearlyStats } from '@/app/actions/work-log';
import { Card, CardContent } from '@/components/ui/card';
import { getDaysInMonth } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { type WorkLog, type Task, type Project } from '@/prisma/generated/client';
import { WorkLogDataTable } from './work-log-data-table';
import { MonthNavigator } from './widget/month-navigator';
import { SummaryCards } from './widget/summary-cards';
import { DailyEffortChart } from './widget/daily-effort-chart';
import { MonthlyDistributionChart } from './widget/monthly-distribution-chart';
import { YearlyTotalChart } from './widget/yearly-total-chart';

type WorkLogWithTask = WorkLog & {
	task: Task & { project: Project };
};

export function MonthlyEffortReport() {
	const [date, setDate] = useState(new Date());
	const [logs, setLogs] = useState<WorkLogWithTask[]>([]);
	const [loading, setLoading] = useState(true);
	const [yearlyStats, setYearlyStats] = useState<YearlyStats | null>(null);
	const [yearlyLoading, setYearlyLoading] = useState(true);

	const fetchLogs = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getWorkLogs(date.getMonth() + 1, date.getFullYear());
			setLogs(data as WorkLogWithTask[]);
		} catch (error) {
			console.error('Failed to fetch logs:', error);
		} finally {
			setLoading(false);
		}
	}, [date]);

	const fetchYearlyStats = useCallback(async () => {
		setYearlyLoading(true);
		try {
			const data = await getYearlyWorkStats(date.getFullYear());
			setYearlyStats(data);
		} catch (error) {
			console.error('Failed to fetch yearly stats:', error);
		} finally {
			setYearlyLoading(false);
		}
	}, [date]);

	useEffect(() => {
		fetchLogs();
		fetchYearlyStats();
	}, [fetchLogs, fetchYearlyStats]);

	const previousMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
	const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));

	const totalDays = logs.reduce((acc, log) => acc + log.daysWorked, 0);

	//const projectSummary = logs.reduce(
	//	(acc, log) => {
	//		const name = log.task.project.name;
	//		acc[name] = (acc[name] || 0) + log.daysWorked;
	//		return acc;
	//	},
	//	{} as Record<string, number>,
	//);

	const currentMonthStats = yearlyStats?.months[date.getMonth()];
	const monthAnnual = currentMonthStats?.annualPlanDays ?? 0;
	const monthAdHoc = currentMonthStats?.adHocDays ?? 0;

	const dailyEffortData = useMemo(() => {
		const daysCount = getDaysInMonth(date);
		const dailyMap = Array.from({ length: daysCount }, (_, i) => ({
			day: i + 1,
			label: `${i + 1}`,
			annualPlan: 0,
			adHoc: 0,
			total: 0,
		}));

		for (const log of logs) {
			const logDate = new Date(log.date);
			const dayIndex = logDate.getDate() - 1;
			if (dayIndex >= 0 && dayIndex < daysCount) {
				const bucket = log.task.type === 'ANNUAL_PLAN' ? 'annualPlan' : 'adHoc';
				dailyMap[dayIndex][bucket] += log.daysWorked;
				dailyMap[dayIndex].total += log.daysWorked;
			}
		}

		return dailyMap;
	}, [logs, date]);

	const refreshAll = () => {
		fetchLogs();
		fetchYearlyStats();
	};

	return (
		<div className='space-y-6'>
			<MonthNavigator date={date} onPreviousMonth={previousMonth} onNextMonth={nextMonth} />

			<SummaryCards
				totalDays={totalDays}
				monthAnnual={monthAnnual}
				monthAdHoc={monthAdHoc}
				date={date}
			/>

			{!loading && <DailyEffortChart data={dailyEffortData} date={date} />}

			{yearlyLoading ? (
				<div className='flex justify-center p-8'>
					<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
				</div>
			) : yearlyStats && yearlyStats.grandTotal > 0 ? (
				<div className='grid gap-4 md:grid-cols-3'>
					<MonthlyDistributionChart yearlyStats={yearlyStats} />
					<YearlyTotalChart yearlyStats={yearlyStats} />
				</div>
			) : (
				<Card>
					<CardContent className='py-8 text-center text-muted-foreground'>
						{yearlyStats?.year} yılında henüz efor kaydı bulunmuyor.
					</CardContent>
				</Card>
			)}

			{loading ? (
				<div className='flex justify-center p-8'>
					<Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
				</div>
			) : (
				<WorkLogDataTable logs={logs} onUpdate={refreshAll} />
			)}
		</div>
	);
}
