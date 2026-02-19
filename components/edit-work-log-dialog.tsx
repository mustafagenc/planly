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
import { updateWorkLog, deleteWorkLog } from '@/app/actions/work-log';
import { WorkLog } from '@/prisma/generated/client';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface EditWorkLogDialogProps {
	log: WorkLog;
	trigger?: React.ReactNode;
	onUpdate?: () => void;
}

export function EditWorkLogDialog({ log, trigger, onUpdate }: EditWorkLogDialogProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [formData, setFormData] = useState({
		date: format(new Date(log.date), 'yyyy-MM-dd'),
		daysWorked: log.daysWorked.toString(),
		description: log.description || '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await updateWorkLog(log.id, {
				date: new Date(formData.date),
				daysWorked: parseFloat(formData.daysWorked),
				description: formData.description,
			});
			setOpen(false);
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error('Failed to update log:', error);
			alert('Kayıt güncellenirken bir hata oluştu.');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
		setIsDeleting(true);
		try {
			await deleteWorkLog(log.id);
			setOpen(false);
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error('Failed to delete log:', error);
			alert('Kayıt silinirken bir hata oluştu.');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant='ghost'
						size='icon'
						className='h-8 w-8 text-muted-foreground hover:text-foreground'
					>
						<Pencil className='h-4 w-4' />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Efor Kaydını Düzenle</DialogTitle>
					<DialogDescription>Çalışma kaydını güncelleyin veya silin.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='date'>Tarih</Label>
						<Input
							id='date'
							type='date'
							value={formData.date}
							onChange={(e) => setFormData({ ...formData, date: e.target.value })}
							required
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='daysWorked'>Çalışılan Gün</Label>
						<Input
							id='daysWorked'
							type='number'
							step='0.5'
							value={formData.daysWorked}
							onChange={(e) =>
								setFormData({ ...formData, daysWorked: e.target.value })
							}
							required
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='description'>Açıklama</Label>
						<Input
							id='description'
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
						/>
					</div>

					<DialogFooter className='flex justify-between items-center sm:justify-between'>
						<Button
							type='button'
							variant='destructive'
							size='icon'
							onClick={handleDelete}
							disabled={isDeleting || loading}
						>
							{isDeleting ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<Trash2 className='h-4 w-4' />
							)}
						</Button>
						<div className='flex gap-2'>
							<Button type='button' variant='outline' onClick={() => setOpen(false)}>
								İptal
							</Button>
							<Button type='submit' disabled={loading}>
								{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Kaydet
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
