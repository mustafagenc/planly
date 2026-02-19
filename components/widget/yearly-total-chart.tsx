'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { YearlyStats } from '@/app/actions/work-log';

const CHART_COLORS = {
    annualPlan: 'hsl(220, 70%, 55%)',
    adHoc: 'hsl(35, 90%, 55%)',
};

interface YearlyTotalChartProps {
    yearlyStats: YearlyStats;
}

export function YearlyTotalChart({ yearlyStats }: YearlyTotalChartProps) {
    const pieData = yearlyStats.grandTotal > 0
        ? [
            { name: 'Yıllık İş Planı', value: yearlyStats.annualPlanTotal },
            { name: 'Plan Harici İşler', value: yearlyStats.adHocTotal },
        ]
        : [];

    return (
        <Card className="border-border/60">
            <CardHeader>
                <CardTitle className="text-base">Yıllık Toplam ({yearlyStats.year})</CardTitle>
                <CardDescription className="text-xs">Toplam {yearlyStats.grandTotal} gün</CardDescription>
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
    );
}
