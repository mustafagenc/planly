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
import { createTask } from '@/app/actions/task';
import {
	type Project,
	type Unit,
	type Person,
} from '@/prisma/generated/client';
import { Loader2, Plus } from 'lucide-react';

interface CreateTaskDialogProps {
	projects: Project[];
	units: Unit[];
	people: Person[];
}

const INITIAL_FORM = {
	type: 'ADHOC' as 'ANNUAL_PLAN' | 'ADHOC',
	projectId: '',
	title: '',
	detail: '',
	ticketNo: '',
	unitId: '',
	responsibleId: '',
	coResponsible: '',
	year: new Date().getFullYear().toString(),
	estimatedDays: '',
	remarks: '',
};

export function CreateTaskDialog({
	projects,
	units,
	people,
}: CreateTaskDialogProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState(INITIAL_FORM);

	const isAnnual = form.type === 'ANNUAL_PLAN';

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await createTask({
				type: form.type,
				projectId: Number(form.projectId),
				title: form.title,
				detail: form.detail || undefined,
				ticketNo: form.ticketNo || undefined,
				unitId: form.unitId ? Number(form.unitId) : undefined,
				responsibleId: form.responsibleId
					? Number(form.responsibleId)
					: undefined,
				coResponsible: form.coResponsible || undefined,
				year: isAnnual ? Number(form.year) : undefined,
				estimatedDays: form.estimatedDays
					? Number(form.estimatedDays)
					: undefined,
				remarks: form.remarks || undefined,
			});
			setOpen(false);
			setForm(INITIAL_FORM);
		} catch (error) {
			console.error('Failed to create task:', error);
			alert('İş oluşturulurken bir hata oluştu.');
		} finally {
			setLoading(false);
		}
	};

	const set = (key: string, value: string) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className='gap-1.5'>
					<Plus className='h-4 w-4' /> Yeni İş
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[520px]'>
				<DialogHeader>
					<DialogTitle className='text-lg'>
						Yeni İş Oluştur
					</DialogTitle>
					<DialogDescription>
						Yeni bir iş kaydı ekleyin.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4 py-2'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label>Tip</Label>
							<Select
								value={form.type}
								onValueChange={(v) => set('type', v)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='ANNUAL_PLAN'>
										Yıllık İş Planı
									</SelectItem>
									<SelectItem value='ADHOC'>
										Plan Harici
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label>Proje</Label>
							<Select
								value={form.projectId}
								onValueChange={(v) => set('projectId', v)}
							>
								<SelectTrigger>
									<SelectValue placeholder='Seçiniz' />
								</SelectTrigger>
								<SelectContent>
									{projects.map((p) => (
										<SelectItem
											key={p.id}
											value={p.id.toString()}
										>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Başlık</Label>
						<Input
							value={form.title}
							onChange={(e) => set('title', e.target.value)}
							placeholder='Yapılacak iş...'
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label>Detay</Label>
						<Input
							value={form.detail}
							onChange={(e) => set('detail', e.target.value)}
							placeholder='Opsiyonel açıklama...'
						/>
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
										<SelectItem
											key={p.id}
											value={p.id.toString()}
										>
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
								onChange={(e) =>
									set('ticketNo', e.target.value)
								}
								placeholder='SDEGEM-123'
							/>
						</div>
					</div>

					{isAnnual && (
						<div className='grid grid-cols-3 gap-4'>
							<div className='space-y-2'>
								<Label>Yıl</Label>
								<Input
									type='number'
									value={form.year}
									onChange={(e) =>
										set('year', e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label>Birim</Label>
								<Select
									value={form.unitId}
									onValueChange={(v) => set('unitId', v)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Seçiniz' />
									</SelectTrigger>
									<SelectContent>
										{units.map((u) => (
											<SelectItem
												key={u.id}
												value={u.id.toString()}
											>
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
									onChange={(e) =>
										set('estimatedDays', e.target.value)
									}
								/>
							</div>
						</div>
					)}

					{!isAnnual && (
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label>Ortak Çalışma</Label>
								<Input
									value={form.coResponsible}
									onChange={(e) =>
										set('coResponsible', e.target.value)
									}
									placeholder='Diğer kişiler'
								/>
							</div>
							<div className='space-y-2'>
								<Label>Not</Label>
								<Input
									value={form.remarks}
									onChange={(e) =>
										set('remarks', e.target.value)
									}
									placeholder='Ek notlar...'
								/>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							type='submit'
							disabled={loading || !form.projectId || !form.title}
							size='sm'
						>
							{loading && (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							)}
							Oluştur
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
