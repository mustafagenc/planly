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
import { updateAnnualPlan, deleteAnnualPlan } from '@/app/actions/annual-plan';
import { Project, Unit, Person, AnnualPlan } from '@/prisma/generated/client';
import { Loader2, Pencil, Trash2 } from 'lucide-react';

interface EditAnnualPlanDialogProps {
    plan: AnnualPlan & {
        project: Project;
        unit: Unit | null;
        responsible: Person | null;
    };
    people: Person[];
    trigger?: React.ReactNode;
}

export function EditAnnualPlanDialog({ plan, people, trigger }: EditAnnualPlanDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        taskSummary: plan.taskSummary,
        detail: plan.detail || '',
        status: plan.status,
        responsibleId: plan.responsibleId?.toString() || '',
        estimatedDays: plan.estimatedDays?.toString() || '',
        progress: plan.progress.toString(),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateAnnualPlan(plan.id, {
                taskSummary: formData.taskSummary,
                detail: formData.detail,
                status: formData.status,
                responsibleId: formData.responsibleId ? Number(formData.responsibleId) : undefined, // Handle unassignment if needed, though prisma update partial might need explicit null
                estimatedDays: formData.estimatedDays ? Number(formData.estimatedDays) : undefined,
                progress: Number(formData.progress),
            });
            setOpen(false);
        } catch (error) {
            console.error('Failed to update plan:', error);
            alert('Plan güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu planı silmek istediğinize emin misiniz?')) return;
        setIsDeleting(true);
        try {
            await deleteAnnualPlan(plan.id);
            setOpen(false);
        } catch (error) {
            console.error('Failed to delete plan:', error);
            alert('Plan silinirken bir hata oluştu.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Yıllık Plan Düzenle</DialogTitle>
                    <DialogDescription>
                        Plan detaylarını güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Read-only info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold">Proje:</span> {plan.project.name}
                        </div>
                        <div>
                            <span className="font-semibold">Birim:</span> {plan.unit?.name || '-'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="taskSummary">Konu / İş</Label>
                        <Input
                            id="taskSummary"
                            value={formData.taskSummary}
                            onChange={(e) => setFormData({ ...formData, taskSummary: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="detail">Detay</Label>
                        <Input
                            id="detail"
                            value={formData.detail}
                            onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Durum</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beklemede">Beklemede</SelectItem>
                                    <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                                    <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                                    <SelectItem value="İptal">İptal</SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Label htmlFor="estimatedDays">Tahmini Süre</Label>
                            <Input
                                id="estimatedDays"
                                type="number"
                                step="0.5"
                                value={formData.estimatedDays}
                                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                            />
                        </div>
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
