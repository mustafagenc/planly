'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getWorkLogs, getYearlyWorkStats, deleteWorkLog } from '@/app/actions/work-log';
import type { YearlyStats } from '@/app/actions/work-log';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { format, getDaysInMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, CalendarDays, Zap } from 'lucide-react';
import { type WorkLog, type Task, type Project } from '@/prisma/generated/client';
import { WorkLogDataTable } from './work-log-data-table';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = {
    annualPlan: 'hsl(220, 70%, 55%)',
    adHoc: 'hsl(35, 90%, 55%)',
};

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

    const projectSummary = logs.reduce((acc, log) => {
        const name = log.task.project.name;
        acc[name] = (acc[name] || 0) + log.daysWorked;
        return acc;
    }, {} as Record<string, number>);

    const currentMonthStats = yearlyStats?.months[date.getMonth()];
    const monthAnnual = currentMonthStats?.annualPlanDays ?? 0;
    const monthAdHoc = currentMonthStats?.adHocDays ?? 0;

    const pieData = yearlyStats && yearlyStats.grandTotal > 0
        ? [
            { name: 'Yıllık İş Planı', value: yearlyStats.annualPlanTotal },
            { name: 'Plan Harici İşler', value: yearlyStats.adHocTotal },
        ]
        : [];

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

    const hasAnyDailyEffort = dailyEffortData.some(d => d.total > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Aylık Efor Raporu</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Aylık bazda harcanan efor ve proje dağılımı</p>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1">
                    <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8 rounded-md">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[130px] text-center text-sm font-medium px-2">
                        {format(date, 'MMMM yyyy', { locale: tr })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-md">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Efor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">{totalDays} <span className="text-base font-medium text-muted-foreground">gün</span></div>
                        <p className="text-xs text-muted-foreground mt-1">{format(date, 'MMMM', { locale: tr })} ayı toplam</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" style={{ color: CHART_COLORS.annualPlan }} />
                            Yıllık İş Planı
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">{monthAnnual} <span className="text-base font-medium text-muted-foreground">gün</span></div>
                        <p className="text-xs text-muted-foreground mt-1">Planlı işler</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5" style={{ color: CHART_COLORS.adHoc }} />
                            Plan Harici İşler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">{monthAdHoc} <span className="text-base font-medium text-muted-foreground">gün</span></div>
                        <p className="text-xs text-muted-foreground mt-1">Plan dışı işler</p>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Effort Bar Chart */}
            {!loading && hasAnyDailyEffort && (
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Günlük Efor Dağılımı</CardTitle>
                        <CardDescription className="text-xs">
                            {format(date, 'MMMM yyyy', { locale: tr })} — gün bazında harcanan efor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dailyEffortData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis tick={{ fontSize: 11 }} unit=" gün" width={50} tickLine={false} axisLine={false} />
                                <Tooltip
                                    formatter={(value, name) => [`${value ?? 0} gün`, name ?? '']}
                                    labelFormatter={(label) => `${label} ${format(date, 'MMMM', { locale: tr })}`}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend />
                                <Bar dataKey="annualPlan" name="Yıllık İş Planı" fill={CHART_COLORS.annualPlan} stackId="effort" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="adHoc" name="Plan Harici İşler" fill={CHART_COLORS.adHoc} stackId="effort" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Charts */}
            {yearlyLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : yearlyStats && yearlyStats.grandTotal > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Aylık Dağılım ({yearlyStats.year})</CardTitle>
                            <CardDescription className="text-xs">Yıllık İş Planı vs Plan Harici İşler</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={yearlyStats.months} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} unit=" gün" />
                                    <Tooltip formatter={(value, name) => [`${value ?? 0} gün`, name ?? '']} labelStyle={{ fontWeight: 'bold' }} />
                                    <Legend />
                                    <Bar dataKey="annualPlanDays" name="Yıllık İş Planı" fill={CHART_COLORS.annualPlan} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="adHocDays" name="Plan Harici İşler" fill={CHART_COLORS.adHoc} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Yıllık Toplam ({yearlyStats.year})</CardTitle>
                            <CardDescription className="text-xs">Toplam {yearlyStats.grandTotal} gün</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                                        <Cell fill={CHART_COLORS.annualPlan} />
                                        <Cell fill={CHART_COLORS.adHoc} />
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value ?? 0} gün`]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-2 mt-4 w-full text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.annualPlan }} />
                                        <span>Yıllık İş Planı</span>
                                    </div>
                                    <span className="font-semibold">{yearlyStats.annualPlanTotal} gün</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.adHoc }} />
                                        <span>Plan Harici İşler</span>
                                    </div>
                                    <span className="font-semibold">{yearlyStats.adHocTotal} gün</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card><CardContent className="py-8 text-center text-muted-foreground">{yearlyStats?.year} yılında henüz efor kaydı bulunmuyor.</CardContent></Card>
            )}

            {/* Proje Dağılımı */}
            {logs.length > 0 && (
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Proje Dağılımı</CardTitle>
                        <CardDescription className="text-xs">Proje bazlı toplam efor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(projectSummary).sort(([, a], [, b]) => b - a).map(([project, days]) => (
                                <div key={project} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{project}</p>
                                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{days} gün</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/80 rounded-full transition-all duration-500" style={{ width: `${totalDays > 0 ? (days / totalDays) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Efor Kayıtları Data Table */}
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
                <WorkLogDataTable logs={logs} onUpdate={() => { fetchLogs(); fetchYearlyStats(); }} />
            )}
        </div>
    );
}
