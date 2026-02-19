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
import { createAnnualPlan } from '@/app/actions/annual-plan';
import { Project, Unit, Person } from '@/prisma/generated/client';
import { Loader2, Plus } from 'lucide-react';

interface CreateAnnualPlanDialogProps {
    projects: Project[];
    units: Unit[];
    people: Person[];
}

export function CreateAnnualPlanDialog({ projects, units, people }: CreateAnnualPlanDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        year: 2025,
        projectId: '',
        unitId: '',
        taskSummary: '',
        detail: '',
        responsibleId: '',
        estimatedDays: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createAnnualPlan({
                year: Number(formData.year),
                projectId: Number(formData.projectId),
                unitId: formData.unitId ? Number(formData.unitId) : undefined,
                taskSummary: formData.taskSummary,
                detail: formData.detail,
                responsibleId: formData.responsibleId ? Number(formData.responsibleId) : undefined,
                estimatedDays: formData.estimatedDays ? Number(formData.estimatedDays) : undefined,
                status: 'Beklemede'
            });
            setOpen(false);
            // Reset form
            setFormData({
                year: 2025,
                projectId: '',
                unitId: '',
                taskSummary: '',
                detail: '',
                responsibleId: '',
                estimatedDays: '',
            });
        } catch (error) {
            console.error('Failed to create plan:', error);
            alert('Plan oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Yeni Yıllık Plan Oluştur</DialogTitle>
                    <DialogDescription>
                        Yıllık iş planına yeni bir görev ekleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="year">Yıl</Label>
                            <Input
                                id="year"
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project">Uygulama/Proje</Label>
                            <Select
                                value={formData.projectId.toString()}
                                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit">Talep Eden Birim</Label>
                        <Select
                            value={formData.unitId.toString()}
                            onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seçiniz (Opsiyonel)" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((u) => (
                                    <SelectItem key={u.id} value={u.id.toString()}>
                                        {u.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="taskSummary">Konu / İş</Label>
                        <Input
                            id="taskSummary"
                            value={formData.taskSummary}
                            onChange={(e) => setFormData({ ...formData, taskSummary: e.target.value })}
                            placeholder="Kısaca yapılacak iş..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="detail">Detay</Label>
                        <Input
                            id="detail"
                            value={formData.detail}
                            onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                            placeholder="Varsa detaylı açıklama..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="responsible">Sorumlu</Label>
                            <Select
                                value={formData.responsibleId.toString()}
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
                            <Label htmlFor="estimatedDays">Tahmini Süre (Gün)</Label>
                            <Input
                                id="estimatedDays"
                                type="number"
                                step="0.5"
                                value={formData.estimatedDays}
                                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading || !formData.projectId || !formData.taskSummary}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Oluştur
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
