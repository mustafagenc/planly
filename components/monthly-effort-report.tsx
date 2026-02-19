'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWorkLogs, getYearlyWorkStats, deleteWorkLog } from '@/app/actions/work-log';
import type { YearlyStats } from '@/app/actions/work-log';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Pencil, CalendarDays, Zap } from 'lucide-react';
import { WorkLog, AnnualPlan, Project, AdHocTask } from '@/prisma/generated/client';
import { EditWorkLogDialog } from './edit-work-log-dialog';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = {
    annualPlan: 'hsl(220, 70%, 55%)',
    adHoc: 'hsl(35, 90%, 55%)',
};

export function MonthlyEffortReport() {
    const [date, setDate] = useState(new Date());
    const [logs, setLogs] = useState<(WorkLog & {
        annualPlan: (AnnualPlan & { project: Project }) | null;
        adHocTask: (AdHocTask & { project: Project }) | null;
    })[]>([]);
    const [loading, setLoading] = useState(true);
    const [yearlyStats, setYearlyStats] = useState<YearlyStats | null>(null);
    const [yearlyLoading, setYearlyLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getWorkLogs(date.getMonth() + 1, date.getFullYear());
            setLogs(data);
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

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
        try {
            await deleteWorkLog(id);
            fetchLogs();
            fetchYearlyStats();
        } catch (error) {
            console.error('Failed to delete log:', error);
            alert('Kayıt silinirken bir hata oluştu.');
        }
    };

    const previousMonth = () => {
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    };

    const totalDays = logs.reduce((acc, log) => acc + log.daysWorked, 0);

    const projectSummary = logs.reduce((acc, log) => {
        const projectName = log.annualPlan?.project.name || log.adHocTask?.project.name || 'Bilinmiyor';
        acc[projectName] = (acc[projectName] || 0) + log.daysWorked;
        return acc;
    }, {} as Record<string, number>);

    // Seçili ayın istatistikleri
    const currentMonthStats = yearlyStats?.months[date.getMonth()];
    const monthAnnual = currentMonthStats?.annualPlanDays ?? 0;
    const monthAdHoc = currentMonthStats?.adHocDays ?? 0;

    const pieData = yearlyStats && yearlyStats.grandTotal > 0
        ? [
            { name: 'Yıllık İş Planı', value: yearlyStats.annualPlanTotal },
            { name: 'Plan Harici İşler', value: yearlyStats.adHocTotal },
        ]
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Aylık Efor Raporu</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Aylık bazda harcanan efor ve proje dağılımı
                    </p>
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

            {/* Özet Kartları */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Efor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">{totalDays} <span className="text-base font-medium text-muted-foreground">gün</span></div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {format(date, 'MMMM', { locale: tr })} ayı toplam
                        </p>
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Planlı işler
                        </p>
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Plan dışı işler
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Yıllık Aylık Bar Chart + Yıllık Pie Chart */}
            {yearlyLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : yearlyStats && yearlyStats.grandTotal > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Aylık Dağılım ({yearlyStats.year})</CardTitle>
                            <CardDescription className="text-xs">
                                Yıllık İş Planı vs Plan Harici İşler
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={yearlyStats.months} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} unit=" gün" />
                                    <Tooltip
                                        formatter={(value, name) => [`${value ?? 0} gün`, name ?? '']}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="annualPlanDays"
                                        name="Yıllık İş Planı"
                                        fill={CHART_COLORS.annualPlan}
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="adHocDays"
                                        name="Plan Harici İşler"
                                        fill={CHART_COLORS.adHoc}
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base">Yıllık Toplam ({yearlyStats.year})</CardTitle>
                            <CardDescription className="text-xs">
                                Toplam {yearlyStats.grandTotal} gün
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                    >
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
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        {yearlyStats?.year} yılında henüz efor kaydı bulunmuyor.
                    </CardContent>
                </Card>
            )}

            {/* Detaylı İş Listesi ve Proje Dağılımı */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2 border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Detaylı İş Listesi</CardTitle>
                        <CardDescription className="text-xs">
                            Günlük bazda yapılan işler
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12 text-sm text-muted-foreground/60">
                                Kayıt bulunamadı
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-start justify-between py-3 group hover:bg-muted/20 -mx-2 px-2 rounded-lg transition-colors">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium leading-snug">
                                                {log.annualPlan?.project.name || log.adHocTask?.project.name}
                                                <span className="text-muted-foreground font-normal"> · {format(new Date(log.date), 'dd MMM yyyy', { locale: tr })}</span>
                                            </p>
                                            {log.description && (
                                                <p className="text-xs text-muted-foreground/70 italic">{log.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-sm font-semibold tabular-nums">
                                                {log.daysWorked} gün
                                            </span>
                                            <EditWorkLogDialog
                                                log={log}
                                                onUpdate={() => { fetchLogs(); fetchYearlyStats(); }}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        className="h-7 w-7 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span className="sr-only">Düzenle</span>
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Proje Dağılımı</CardTitle>
                        <CardDescription className="text-xs">
                            Proje bazlı toplam efor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(projectSummary)
                                .sort(([, a], [, b]) => b - a)
                                .map(([project, days]) => (
                                    <div key={project} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{project}</p>
                                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">{days} gün</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/80 rounded-full transition-all duration-500"
                                                style={{ width: `${(days / totalDays) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            {logs.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground/60 py-12">Kayıt yok</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
