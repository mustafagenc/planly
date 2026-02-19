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
					<h2 className='text-2xl font-bold tracking-tight'>
						Plan Harici İşler
					</h2>
					<p className='text-muted-foreground'>
						Plansız ancak yapılan ek işlerin takibi.
					</p>
				</div>
				<div className='flex items-center gap-4'>
					<div className='flex items-center space-x-2'>
						<Switch
							id='show-completed-adhoc'
							checked={showCompleted}
							onCheckedChange={setShowCompleted}
						/>
						<Label htmlFor='show-completed-adhoc'>
							Tamamlananları Göster
						</Label>
					</div>
					<CreateAdHocTaskDialog
						projects={projects}
						people={people}
					/>
				</div>
			</div>

			<div className='space-y-3'>
				{visibleTasks.map((task, index) => (
					<div
						key={task.id}
						draggable
						onDragStart={() => handleDragStart(index)}
						onDragOver={(e) => handleDragOver(e, index)}
						onDrop={() => handleDrop(index)}
						onDragEnd={handleDragEnd}
						className={cn(
							'flex items-stretch gap-2 transition-all',
							dragOverIndex === index &&
								'ring-2 ring-primary ring-offset-2 rounded-xl',
						)}
					>
						<div className='cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground px-1 flex items-center shrink-0 rounded-lg hover:bg-muted'>
							<GripVertical className='h-5 w-5' />
						</div>
						<div className='flex-1 min-w-0'>
							<TaskCard task={task} people={people} />
						</div>
					</div>
				))}
				{visibleTasks.length === 0 && (
					<div className='py-12 text-center text-muted-foreground border rounded-xl border-dashed'>
                    Henüz iş yok.
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
		<Card className='group hover:shadow-md transition-shadow'>
			<div className='flex flex-col md:flex-row md:items-center p-6 gap-4'>
				<div className='flex-1 space-y-1'>
					<div className='flex items-center gap-2'>
						<span className='font-semibold text-base'>
							{task.project.name}
						</span>
						{task.ticketNo && (
							<span className='text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-mono'>
								{task.ticketNo}
							</span>
						)}
						<StatusBadge progress={task.progress} />
					</div>
					<p className='text-sm'>{task.description}</p>
					<div className='flex items-center gap-4 mt-2'>
						{task.remarks && (
							<p className='text-xs text-muted-foreground'>
								Not: {task.remarks}
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
										className='h-6 w-6 p-0 text-muted-foreground hover:text-foreground'
									>
										<Pencil className='h-3 w-3' />
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
										className='h-6 text-xs px-2'
									>
										<Clock className='mr-1 h-3 w-3' /> Efor
										Gir
									</Button>
								}
							/>
						</div>
					</div>
				</div>

				<div className='flex items-center gap-6 text-sm text-muted-foreground min-w-[200px] justify-end'>
					{task.coResponsible && (
						<div className='flex flex-col items-end'>
							<span className='text-[10px] uppercase font-semibold'>
								Ortak Çalışma
							</span>
							<span className='text-foreground'>
								{task.coResponsible}
							</span>
						</div>
					)}
					<div className='flex flex-col items-end'>
						<span className='text-[10px] uppercase font-semibold'>
							Sorumlu
						</span>
						<span className='text-foreground'>
							{task.responsible?.name || '-'}
						</span>
					</div>
					<div className='flex flex-col items-end min-w-[60px]'>
						<span className='text-[10px] uppercase font-semibold'>
							Efor
						</span>
						<span className='text-foreground'>
							{task.daysSpent || 0} gün
						</span>
					</div>
				</div>
			</div>

			<div className='h-1 w-full bg-secondary overflow-hidden rounded-b-xl'>
				<div
					className={cn(
						'h-full transition-all duration-500',
						task.progress === 100 ? 'bg-green-500' : 'bg-blue-500',
					)}
					style={{ width: `${task.progress}%` }}
				/>
			</div>
		</Card>
	);
}

function StatusBadge({ progress }: { progress: number }) {
	let status = 'Devam Ediyor';
	let style =
		'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
	let Icon = AlertCircle;

	if (progress === 0) {
		status = 'Başlamadı';
		style = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		Icon = Clock;
	} else if (progress === 100) {
		status = 'Tamamlandı';
		style =
			'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
		Icon = CheckCircle2;
	}

	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ml-2',
				style,
			)}
		>
			<Icon className='h-3 w-3' />
			{status} ({progress}%)
		</span>
	);
}
