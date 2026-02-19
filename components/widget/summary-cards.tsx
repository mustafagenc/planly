'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Zap } from 'lucide-react';

const CHART_COLORS = {
    annualPlan: 'hsl(220, 70%, 55%)',
    adHoc: 'hsl(35, 90%, 55%)',
};

interface SummaryCardsProps {
    totalDays: number;
    monthAnnual: number;
    monthAdHoc: number;
    date: Date;
}

export function SummaryCards({ totalDays, monthAnnual, monthAdHoc, date }: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Efor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">
                        {totalDays} <span className="text-base font-medium text-muted-foreground">gün</span>
                    </div>
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
                    <div className="text-3xl font-bold tracking-tight">
                        {monthAnnual} <span className="text-base font-medium text-muted-foreground">gün</span>
                    </div>
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
                    <div className="text-3xl font-bold tracking-tight">
                        {monthAdHoc} <span className="text-base font-medium text-muted-foreground">gün</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Plan dışı işler</p>
                </CardContent>
            </Card>
        </div>
    );
}
