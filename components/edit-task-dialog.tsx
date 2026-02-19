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
import { updateTask, deleteTask } from '@/app/actions/task';
import {
	type Task,
	type Project,
	type Unit,
	type Person,
	type TaskStatus,
} from '@/prisma/generated/client';
import { Loader2, Trash2 } from 'lucide-react';

interface EditTaskDialogProps {
	task: Task & { project: Project; unit: Unit | null; responsible: Person | null };
	units: Unit[];
	people: Person[];
	trigger: React.ReactNode;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
	{ value: 'BACKLOG', label: 'Beklemede' },
	{ value: 'TODO', label: 'Yapılacak' },
	{ value: 'IN_PROGRESS', label: 'Devam Ediyor' },
	{ value: 'DONE', label: 'Tamamlandı' },
];

export function EditTaskDialog({ task, units, people, trigger }: EditTaskDialogProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		title: task.title,
		detail: task.detail ?? '',
		ticketNo: task.ticketNo ?? '',
		status: task.status,
		responsibleId: task.responsibleId?.toString() ?? '',
		coResponsible: task.coResponsible ?? '',
		unitId: task.unitId?.toString() ?? '',
		estimatedDays: task.estimatedDays?.toString() ?? '',
		progress: task.progress.toString(),
		remarks: task.remarks ?? '',
	});

	const isAnnual = task.type === 'ANNUAL_PLAN';

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateTask(task.id, {
				title: form.title,
				detail: form.detail || undefined,
				ticketNo: form.ticketNo || undefined,
				status: form.status as TaskStatus,
				responsibleId: form.responsibleId ? Number(form.responsibleId) : undefined,
				coResponsible: form.coResponsible || undefined,
				unitId: form.unitId ? Number(form.unitId) : undefined,
				estimatedDays: form.estimatedDays ? Number(form.estimatedDays) : undefined,
				progress: Number(form.progress),
				remarks: form.remarks || undefined,
			});
			setOpen(false);
		} catch (error) {
			console.error('Failed to update task:', error);
			alert('Güncelleme başarısız.');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (
			!confirm(
				'Bu işi silmek istediğinize emin misiniz? İlişkili efor kayıtları da silinecek.',
			)
		)
			return;
		setLoading(true);
		try {
			await deleteTask(task.id);
			setOpen(false);
		} catch (error) {
			console.error('Failed to delete task:', error);
			alert('Silme başarısız.');
		} finally {
			setLoading(false);
		}
	};

	const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className='sm:max-w-[520px]'>
				<DialogHeader>
					<DialogTitle className='text-lg'>İş Düzenle</DialogTitle>
					<DialogDescription>
						{task.project.name} · {isAnnual ? 'Yıllık İş Planı' : 'Plan Harici'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4 py-2'>
					<div className='space-y-2'>
						<Label>Başlık</Label>
						<Input
							value={form.title}
							onChange={(e) => set('title', e.target.value)}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label>Detay</Label>
						<Input
							value={form.detail}
							onChange={(e) => set('detail', e.target.value)}
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Durum</Label>
							<Select value={form.status} onValueChange={(v) => set('status', v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUS_OPTIONS.map((s) => (
										<SelectItem key={s.value} value={s.value}>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label>İlerleme (%)</Label>
							<Input
								type='number'
								min='0'
								max='100'
								value={form.progress}
								onChange={(e) => set('progress', e.target.value)}
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Sorumlu</Label>
							<Select
								value={form.responsibleId}
								onValueChange={(v) => set('responsibleId', v)}
							>
								<SelectTrigger>
									<SelectValue placeholder='Seçiniz' />
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
						<div className='space-y-2'>
							<Label>Ticket No</Label>
							<Input
								value={form.ticketNo}
								onChange={(e) => set('ticketNo', e.target.value)}
							/>
						</div>
					</div>

					{isAnnual && (
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label>Birim</Label>
								<Select value={form.unitId} onValueChange={(v) => set('unitId', v)}>
									<SelectTrigger>
										<SelectValue placeholder='Seçiniz' />
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
							<div className='space-y-2'>
								<Label>Tahmini Gün</Label>
								<Input
									type='number'
									step='0.5'
									value={form.estimatedDays}
									onChange={(e) => set('estimatedDays', e.target.value)}
								/>
							</div>
						</div>
					)}

					<DialogFooter className='flex justify-between sm:justify-between'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							className='text-destructive hover:text-destructive'
							onClick={handleDelete}
							disabled={loading}
						>
							<Trash2 className='h-4 w-4 mr-1' /> Sil
						</Button>
						<Button type='submit' disabled={loading} size='sm'>
							{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							Kaydet
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
