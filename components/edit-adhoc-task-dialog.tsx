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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateAdHocTask, deleteAdHocTask } from '@/app/actions/adhoc-task';
import { AdHocTask, Project, Person } from '@/prisma/generated/client';
import { Loader2, Pencil, Trash2 } from 'lucide-react';

interface EditAdHocTaskDialogProps {
    task: AdHocTask & {
        project: Project;
        responsible: Person | null;
    };
    people: Person[];
    trigger?: React.ReactNode;
}

export function EditAdHocTaskDialog({ task, people, trigger }: EditAdHocTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        description: task.description,
        remarks: task.remarks || '',
        ticketNo: task.ticketNo || '',
        coResponsible: task.coResponsible || '',
        responsibleId: task.responsibleId?.toString() || '',
        daysSpent: task.daysSpent?.toString() || '',
        progress: task.progress.toString(),
        previousStatus: task.previousStatus || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateAdHocTask(task.id, {
                description: formData.description,
                remarks: formData.remarks,
                ticketNo: formData.ticketNo,
                coResponsible: formData.coResponsible,
                responsibleId: formData.responsibleId ? Number(formData.responsibleId) : undefined,
                daysSpent: formData.daysSpent ? Number(formData.daysSpent) : undefined,
                progress: Number(formData.progress),
                previousStatus: formData.previousStatus,
            });
            setOpen(false);
        } catch (error) {
            console.error('Failed to update task:', error);
            alert('Görev güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
        setIsDeleting(true);
        try {
            await deleteAdHocTask(task.id);
            setOpen(false);
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Görev silinirken bir hata oluştu.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Görevi Düzenle</DialogTitle>
                    <DialogDescription>
                        Plan harici işin detaylarını güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Read-only info */}
                    <div className="text-sm">
                        <span className="font-semibold">Proje:</span> {task.project.name}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Yapılan İş</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticketNo">Ticket No</Label>
                            <Input
                                id="ticketNo"
                                value={formData.ticketNo}
                                onChange={(e) => setFormData({ ...formData, ticketNo: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="progress">İlerleme (%)</Label>
                            <Input
                                id="progress"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Notlar</Label>
                        <Input
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="responsible">Sorumlu</Label>
                            <Select
                                value={formData.responsibleId}
                                onValueChange={(value) => setFormData({ ...formData, responsibleId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {people.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coResponsible">Ortak Çalışma</Label>
                            <Input
                                id="coResponsible"
                                value={formData.coResponsible}
                                onChange={(e) => setFormData({ ...formData, coResponsible: e.target.value })}
                                placeholder="Birim/Kişi"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="daysSpent">Harcanan Toplam Süre (Gün)</Label>
                        <Input
                            id="daysSpent"
                            type="number"
                            step="0.5"
                            value={formData.daysSpent}
                            onChange={(e) => setFormData({ ...formData, daysSpent: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Manuel güncelleme. Efor kayıtlarından bağımsızdır.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="previousStatus">Önceki Durum</Label>
                        <Input
                            id="previousStatus"
                            value={formData.previousStatus}
                            onChange={(e) => setFormData({ ...formData, previousStatus: e.target.value })}
                        />
                    </div>

                    <DialogFooter className="flex justify-between items-center sm:justify-between">
                        <Button type="button" variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting || loading}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>İptal</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kaydet
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
