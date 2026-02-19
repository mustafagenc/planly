'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorkLog, createWorkLogBatch } from '@/app/actions/work-log';
import { Loader2 } from 'lucide-react';
import { format, eachDayOfInterval, isWeekend, differenceInCalendarDays } from 'date-fns';
import { tr } from 'date-fns/locale';

interface WorkLogDialogProps {
    trigger?: React.ReactNode;
    taskId: number;
    title: string;
}

function getBusinessDays(start: Date, end: Date): Date[] {
    if (differenceInCalendarDays(end, start) < 0) return [];
    return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d));
}

export function WorkLogDialog({ trigger, taskId, title }: WorkLogDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const today = format(new Date(), 'yyyy-MM-dd');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [description, setDescription] = useState('');

    const businessDays = useMemo(() => {
        if (!startDate || !endDate) return [];
        return getBusinessDays(new Date(startDate), new Date(endDate));
    }, [startDate, endDate]);

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        if (!endDate || value > endDate) setEndDate(value);
    };

    const handleEndDateChange = (value: string) => {
        setEndDate(value);
    };

    const isRange = startDate !== endDate && businessDays.length > 1;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isRange) {
                const entries = businessDays.map((day) => ({
                    date: day,
                    daysWorked: 1,
                    description: description || undefined,
                    taskId,
                }));
                await createWorkLogBatch(entries);
            } else {
                await createWorkLog({
                    date: new Date(startDate),
                    daysWorked: 1,
                    description: description || undefined,
                    taskId,
                });
            }
            setOpen(false);
            setDescription('');
            setStartDate(today);
            setEndDate(today);
        } catch (error) {
            console.error('Failed to log work:', error);
            alert('Kayıt eklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm">Efor Gir</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">Efor Girişi</DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold text-foreground">{title}</span> için çalışma sürenizi girin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                                <Input id="startDate" type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                                <Input id="endDate" type="date" value={endDate} min={startDate} onChange={(e) => handleEndDateChange(e.target.value)} required />
                            </div>
                        </div>
                        {businessDays.length > 0 && (
                            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                                {isRange ? (
                                    <>
                                        <p className="text-xs text-muted-foreground">
                                            Hafta sonları hariç <span className="font-semibold text-foreground">{businessDays.length} iş günü</span> için
                                            ayrı ayrı <span className="font-semibold text-foreground">1&apos;er gün</span> kayıt oluşturulacak.
                                        </p>
                                        <p className="text-[11px] text-muted-foreground/70">
                                            {businessDays.map((d) => format(d, 'd MMM', { locale: tr })).join(', ')}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">{format(businessDays[0], 'd MMMM yyyy', { locale: tr })}</span> için <span className="font-semibold text-foreground">1 gün</span> kayıt oluşturulacak.
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ne üzerinde çalıştınız?" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || businessDays.length === 0} size="sm">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isRange ? `${businessDays.length} Kayıt Oluştur` : 'Kaydet'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
