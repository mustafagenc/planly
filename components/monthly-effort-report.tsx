'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWorkLogs, deleteWorkLog } from '@/app/actions/work-log';
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
import { Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { WorkLog, AnnualPlan, Project, AdHocTask } from '@/prisma/generated/client';

export function MonthlyEffortReport() {
    const [date, setDate] = useState(new Date());
    const [logs, setLogs] = useState<(WorkLog & {
        annualPlan: (AnnualPlan & { project: Project }) | null;
        adHocTask: (AdHocTask & { project: Project }) | null;
    })[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
        try {
            await deleteWorkLog(id);
            fetchLogs(); // Refresh list
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

    // Group logs by project for summary
    const projectSummary = logs.reduce((acc, log) => {
        const projectName = log.annualPlan?.project.name || log.adHocTask?.project.name || 'Bilinmiyor';
        acc[projectName] = (acc[projectName] || 0) + log.daysWorked;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Aylık Efor Raporu</h2>
                    <p className="text-muted-foreground">
                        Aylık bazda harcanan efor ve proje dağılımı.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[140px] text-center font-medium">
                        {format(date, 'MMMM yyyy', { locale: tr })}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Efor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDays} Gün</div>
                        <p className="text-xs text-muted-foreground">
                            {format(date, 'MMMM', { locale: tr })} ayında harcanan toplam süre
                        </p>
                    </CardContent>
                </Card>
                {/* Add more summary cards if needed */}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Detaylı İş Listesi</CardTitle>
                        <CardDescription>
                            Günlük bazda yapılan işler.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Kayıt bulunamadı.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {logs.map((log) => (
                                        <div key={log.id} className="flex items-start justify-between py-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {log.annualPlan?.project.name || log.adHocTask?.project.name} • {format(new Date(log.date), 'dd MMMM yyyy', { locale: tr })}
                                                </p>
                                                {log.description && (
                                                    <p className="text-xs text-muted-foreground italic">&quot;{log.description}&quot;</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="font-medium text-sm">
                                                    {log.daysWorked} Gün
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(log.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Sil</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Proje Dağılımı</CardTitle>
                        <CardDescription>
                            Proje bazlı toplam efor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(projectSummary).map(([project, days]) => (
                                <div key={project} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{project}</p>
                                        <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${(days / totalDays) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">Kayıt Yok</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
