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
import { createAdHocTask } from '@/app/actions/adhoc-task';
import { Project, Person } from '@/prisma/generated/client';
import { Loader2, Plus } from 'lucide-react';

interface CreateAdHocTaskDialogProps {
    projects: Project[];
    people: Person[];
}

export function CreateAdHocTaskDialog({ projects, people }: CreateAdHocTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectId: '',
        coResponsible: '',
        description: '',
        remarks: '',
        ticketNo: '',
        responsibleId: '',
        daysSpent: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createAdHocTask({
                projectId: Number(formData.projectId),
                description: formData.description,
                coResponsible: formData.coResponsible || undefined,
                remarks: formData.remarks || undefined,
                ticketNo: formData.ticketNo || undefined,
                responsibleId: formData.responsibleId ? Number(formData.responsibleId) : undefined,
                daysSpent: formData.daysSpent ? Number(formData.daysSpent) : 0,
            });
            setOpen(false);
            // Reset form
            setFormData({
                projectId: '',
                coResponsible: '',
                description: '',
                remarks: '',
                ticketNo: '',
                responsibleId: '',
                daysSpent: '',
            });
        } catch (error) {
            console.error('Failed to create task:', error);
            alert('İş oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Yeni İş Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Yeni Plan Harici İş Ekle</DialogTitle>
                    <DialogDescription>
                        Plansız yapılan bir işi kayıtlara ekleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
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

                    <div className="space-y-2">
                        <Label htmlFor="description">Yapılan İş Tanımı</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ne yapıldı?"
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
                                placeholder="Örn: SDEGEM-123"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coResponsible">Ortak Çalışma (İsim)</Label>
                            <Input
                                id="coResponsible"
                                value={formData.coResponsible}
                                onChange={(e) => setFormData({ ...formData, coResponsible: e.target.value })}
                                placeholder="Varsa diğer kişiler"
                            />
                        </div>
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
                            <Label htmlFor="daysSpent">Harcanan Süre (Gün)</Label>
                            <Input
                                id="daysSpent"
                                type="number"
                                step="0.5"
                                value={formData.daysSpent}
                                onChange={(e) => setFormData({ ...formData, daysSpent: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Notlar</Label>
                        <Input
                            id="remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            placeholder="Ek notlar..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading || !formData.projectId || !formData.description}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Oluştur
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
