'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigatorProps {
    date: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
}

export function MonthNavigator({ date, onPreviousMonth, onNextMonth }: MonthNavigatorProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Aylık Efor Raporu</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Aylık bazda harcanan efor ve proje dağılımı
                </p>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={onPreviousMonth} className="h-8 w-8 rounded-md">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[130px] text-center text-sm font-medium px-2">
                    {format(date, 'MMMM yyyy', { locale: tr })}
                </span>
                <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8 rounded-md">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
