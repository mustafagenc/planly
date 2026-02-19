'use client';

import { AdHocTask, Project, Person } from '@/prisma/generated/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	CheckCircle2,
	Clock,
	AlertCircle,
	Pencil,
	GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState, useRef, DragEvent } from 'react';
import { WorkLogDialog } from './work-log-dialog';
import { CreateAdHocTaskDialog } from './create-adhoc-task-dialog';
import { EditAdHocTaskDialog } from './edit-adhoc-task-dialog';
import { reorderAdHocTasks } from '@/app/actions/reorder';

type TaskWithRelations = AdHocTask & {
	project: Project;
	responsible: Person | null;
};

interface AdHocTasksListProps {
	tasks: TaskWithRelations[];
	projects: Project[];
	people: Person[];
}

export function AdHocTasksList({
	tasks,
	projects,
	people,
}: AdHocTasksListProps) {
    const [showCompleted, setShowCompleted] = useState(false);

	const [orderedTasks, setOrderedTasks] =
		useState<TaskWithRelations[]>(tasks);

	const [prevTasks, setPrevTasks] = useState(tasks);
	if (tasks !== prevTasks) {
		setPrevTasks(tasks);
		setOrderedTasks(tasks);
	}

	// Native HTML5 drag & drop
	const dragIndexRef = useRef<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const handleDragStart = (index: number) => {
		dragIndexRef.current = index;
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
		e.preventDefault();
		if (dragIndexRef.current !== null && dragIndexRef.current !== index) {
			setDragOverIndex(index);
		}
	};

	const handleDrop = async (index: number) => {
		const fromIndex = dragIndexRef.current;
		dragIndexRef.current = null;
		setDragOverIndex(null);

		if (fromIndex === null || fromIndex === index) return;

		const newItems = [...visibleTasks];
		const [removed] = newItems.splice(fromIndex, 1);
		newItems.splice(index, 0, removed);

		const updates = newItems.map((item, i) => ({ id: item.id, order: i }));

		// Update the full ordered list based on visible tasks
		const hiddenTasks = orderedTasks.filter(
			(t) => !visibleTasks.some((v) => v.id === t.id),
		);
		setOrderedTasks([...newItems, ...hiddenTasks]);

		try {
			await reorderAdHocTasks(updates);
		} catch {
			setOrderedTasks(tasks);
		}
	};

	const handleDragEnd = () => {
		dragIndexRef.current = null;
		setDragOverIndex(null);
	};

    const visibleTasks = orderedTasks.filter((t) => {
        if (!showCompleted && t.progress === 100) return false;
        return true;
    });

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-xl font-semibold tracking-tight'>
						Plan Harici İşler
					</h2>
					<p className='text-sm text-muted-foreground mt-0.5'>
						Plansız ancak yapılan ek işlerin takibi
					</p>
				</div>
				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-2'>
						<Switch
							id='show-completed-adhoc'
							checked={showCompleted}
							onCheckedChange={setShowCompleted}
						/>
						<Label htmlFor='show-completed-adhoc' className='text-xs text-muted-foreground cursor-pointer'>
							Tamamlananlar
						</Label>
					</div>
					<CreateAdHocTaskDialog
						projects={projects}
						people={people}
					/>
				</div>
			</div>

			<div className='space-y-2'>
				{visibleTasks.map((task, index) => (
					<div
						key={task.id}
						draggable
						onDragStart={() => handleDragStart(index)}
						onDragOver={(e) => handleDragOver(e, index)}
						onDrop={() => handleDrop(index)}
						onDragEnd={handleDragEnd}
						className={cn(
							'group/drag flex items-stretch gap-1.5 transition-all duration-150',
							dragOverIndex === index && 'ring-2 ring-primary/40 ring-offset-1 rounded-xl',
						)}
					>
						<div className='cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground px-0.5 flex items-center shrink-0 rounded-lg transition-colors'>
							<GripVertical className='h-4 w-4' />
						</div>
						<div className='flex-1 min-w-0'>
							<TaskCard task={task} people={people} />
						</div>
					</div>
				))}
				{visibleTasks.length === 0 && (
					<div className='py-16 text-center text-sm text-muted-foreground/60 border border-dashed border-border/50 rounded-xl'>
						Henüz iş yok
					</div>
				)}
			</div>
		</div>
	);
}

function TaskCard({
	task,
	people,
}: {
	task: TaskWithRelations;
	people: Person[];
}) {
	return (
		<Card className='group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden border-border/60'>
			<div className='flex flex-col md:flex-row md:items-center p-5 gap-4'>
				<div className='flex-1 space-y-1.5 min-w-0'>
					<div className='flex items-center gap-2 flex-wrap'>
						<span className='font-semibold text-sm tracking-tight'>
							{task.project.name}
						</span>
						{task.ticketNo && (
							<span className='text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono font-medium'>
								{task.ticketNo}
							</span>
						)}
						<StatusBadge progress={task.progress} />
					</div>
					<p className='text-sm text-foreground/90 leading-relaxed'>{task.description}</p>
					<div className='flex items-center gap-3 pt-1'>
						{task.remarks && (
							<p className='text-xs text-muted-foreground/70 italic'>
								{task.remarks}
							</p>
						)}
						<div className='flex items-center gap-1'>
							<EditAdHocTaskDialog
								task={task}
								people={people}
								trigger={
									<Button
										variant='ghost'
										size='sm'
										className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
									>
										<Pencil className='h-3.5 w-3.5' />
									</Button>
								}
							/>
							<WorkLogDialog
								title={task.description}
								adHocTaskId={task.id}
								trigger={
									<Button
										variant='ghost'
										size='sm'
										className='h-7 text-xs px-2 text-muted-foreground hover:text-foreground'
									>
										<Clock className='mr-1 h-3 w-3' /> Efor Gir
									</Button>
								}
							/>
						</div>
					</div>
				</div>

				<div className='flex items-center gap-5 text-sm text-muted-foreground shrink-0'>
					{task.coResponsible && (
						<div className='flex flex-col items-end'>
							<span className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60'>
								Ortak
							</span>
							<span className='text-foreground/90 text-sm'>
								{task.coResponsible}
							</span>
						</div>
					)}
					<div className='flex flex-col items-end'>
						<span className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60'>
							Sorumlu
						</span>
						<span className='text-foreground/90 text-sm'>
							{task.responsible?.name || '-'}
						</span>
					</div>
					<div className='flex flex-col items-end'>
						<span className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60'>
							Efor
						</span>
						<span className='text-foreground font-semibold text-sm'>
							{task.daysSpent || 0} gün
						</span>
					</div>
				</div>
			</div>

			<div className='h-1 w-full bg-secondary'>
				<div
					className={cn(
						'h-full transition-all duration-500',
						task.progress === 100
							? 'bg-linear-to-r from-emerald-500 to-emerald-400'
							: 'bg-linear-to-r from-primary to-primary/70',
					)}
					style={{ width: `${Math.max(task.progress, 2)}%` }}
				/>
			</div>
		</Card>
	);
}

function StatusBadge({ progress }: { progress: number }) {
	let status = 'Devam Ediyor';
	let style = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
	let Icon = AlertCircle;

	if (progress === 0) {
		status = 'Başlamadı';
		style = 'bg-muted text-muted-foreground';
		Icon = Clock;
	} else if (progress === 100) {
		status = 'Tamamlandı';
		style = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
		Icon = CheckCircle2;
	}

	return (
		<span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', style)}>
			<Icon className='h-3 w-3' />
			{status}
		</span>
	);
}
