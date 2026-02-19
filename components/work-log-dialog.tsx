'use client';

import { useState } from 'react';
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
import { createWorkLog } from '@/app/actions/work-log';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface WorkLogDialogProps {
    trigger?: React.ReactNode;
    annualPlanId?: number;
    adHocTaskId?: number;
    title: string;
}

export function WorkLogDialog({
    trigger,
    annualPlanId,
    adHocTaskId,
    title,
}: WorkLogDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [daysWorked, setDaysWorked] = useState('1');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createWorkLog({
                date: new Date(date),
                daysWorked: parseFloat(daysWorked),
                description,
                annualPlanId,
                adHocTaskId,
            });
            setOpen(false);
            // Reset form
            setDescription('');
            setDaysWorked('1');
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
                    <DialogTitle>Efor Girişi</DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold text-foreground">{title}</span> için günlük çalışma sürenizi girin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Tarih</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="days">Çalışılan Gün</Label>
                            <Input
                                id="days"
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={daysWorked}
                                onChange={(e) => setDaysWorked(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Örn: Tam gün için 1, yarım gün için 0.5
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ne üzerinde çalıştınız?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
