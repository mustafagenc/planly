'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = {
    annualPlan: 'hsl(220, 70%, 55%)',
    adHoc: 'hsl(35, 90%, 55%)',
};

interface DailyEffortEntry {
    day: number;
    label: string;
    annualPlan: number;
    adHoc: number;
    total: number;
}

interface DailyEffortChartProps {
    data: DailyEffortEntry[];
    date: Date;
}

export function DailyEffortChart({ data, date }: DailyEffortChartProps) {
    const hasAnyEffort = data.some(d => d.total > 0);

    if (!hasAnyEffort) return null;

    return (
        <Card className="border-border/60">
            <CardHeader>
                <CardTitle className="text-base">Günlük Efor Dağılımı</CardTitle>
                <CardDescription className="text-xs">
                    {format(date, 'MMMM yyyy', { locale: tr })} — gün bazında harcanan efor
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
    );
}
