'use client';

import { AnnualPlan, Project, Unit, Person } from '@/prisma/generated/client';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { WorkLogDialog } from './work-log-dialog';
import { CreateAnnualPlanDialog } from './create-annual-plan-dialog';
import { EditAnnualPlanDialog } from './edit-annual-plan-dialog';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderAnnualPlans } from '@/app/actions/reorder';
import { useEffect } from 'react';

interface AnnualPlansListProps {
	plans: (AnnualPlan & {
		project: Project;
		unit: Unit | null;
		responsible: Person | null;
	})[];
	projects: Project[];
	units: Unit[];
	people: Person[];
}

export function AnnualPlansList({
	plans,
	projects,
	units,
	people,
}: AnnualPlansListProps) {
	const [showCompleted, setShowCompleted] = useState(false);

	// Separate active and backlog plans
	// We maintain a local state for backlog to support DnD updates
	const [backlogPlans, setBacklogPlans] = useState<
		(AnnualPlan & {
			project: Project;
			unit: Unit | null;
			responsible: Person | null;
		})[]
	>(() => {
		return plans
			.filter((p) => p.progress === 0 && p.status !== 'Tamamlandı')
			.sort((a, b) => (a.order || 0) - (b.order || 0));
	});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Initialize/Update local state when props change
	useEffect(() => {
		// Initial Sort: Order ASC
		const backlog = plans
			.filter((p) => p.progress === 0 && p.status !== 'Tamamlandı')
			.sort((a, b) => (a.order || 0) - (b.order || 0));
		setBacklogPlans(backlog);
	}, [plans]);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			setBacklogPlans((items) => {
				const oldIndex = items.findIndex(
					(item) => item.id === active.id,
				);
				const newIndex = items.findIndex(
					(item) => item.id === over?.id,
				);

				const newItems = arrayMove(items, oldIndex, newIndex);

				// Call server action to persist order
				// We map to { id, order } where order is the index
				const updates = newItems.map((item, index) => ({
					id: item.id,
					order: index,
				}));

				// Optimistically update
				reorderAnnualPlans(updates);

				return newItems;
			});
		}
	};

	// Active Plans: Progress > 0 OR Status is Completed
	// Sorted by updatedAt DESC (Most recently worked on/completed at top)
	const activePlans = plans
		.filter((p) => p.progress > 0 || p.status === 'Tamamlandı')
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() -
				new Date(a.updatedAt).getTime(),
		);


	const PlanCard = ({
		plan,
	}: {
		plan: AnnualPlan & {
			project: Project;
			unit: Unit | null;
			responsible: Person | null;
		};
	}) => (
		<Card className='group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative h-full overflow-hidden border-border/60'>
			<CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
				<div className='space-y-1'>
					<CardTitle className='text-sm font-semibold tracking-tight'>
						{plan.project.name}
					</CardTitle>
					<CardDescription className='text-xs'>
						{plan.unit?.name || 'Genel'}
					</CardDescription>
				</div>
				<StatusBadge status={plan.status} />
			</CardHeader>
			<CardContent className='pb-5'>
				<p className='text-sm font-medium leading-snug mb-1.5'>
					{plan.taskSummary}
				</p>
				{plan.detail && (
					<p className='text-xs text-muted-foreground/80 line-clamp-2 mb-4'>
						{plan.detail}
					</p>
				)}

				<div className='flex items-center justify-between text-xs text-muted-foreground mb-3'>
					<span className='font-medium text-foreground/80'>
						{plan.responsible?.name || '-'}
					</span>
					<span className='font-mono text-xs font-semibold text-primary'>
						{plan.progress}%
					</span>
				</div>

				<div className='flex items-center justify-between'>
					<EditAnnualPlanDialog
						plan={plan}
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
						title={plan.taskSummary}
						annualPlanId={plan.id}
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
			</CardContent>
			{/* Progress bar */}
			<div className='absolute bottom-0 left-0 right-0 h-1 bg-secondary'>
				<div
					className='h-full bg-linear-to-r from-primary to-primary/70 transition-all duration-500'
					style={{ width: `${plan.progress}%` }}
				/>
			</div>
		</Card>
	);

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-xl font-semibold tracking-tight'>
						Yıllık İş Planı
					</h2>
					<p className='text-sm text-muted-foreground mt-0.5'>
						Planlanan işlerinizi takip edin ve yönetin
					</p>
				</div>
				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-2'>
						<Switch
							id='show-completed'
							checked={showCompleted}
							onCheckedChange={setShowCompleted}
						/>
						<Label htmlFor='show-completed' className='text-xs text-muted-foreground cursor-pointer'>
							Tamamlananlar
						</Label>
					</div>
					<CreateAnnualPlanDialog
						projects={projects}
						units={units}
						people={people}
					/>
				</div>
			</div>

			<div className='space-y-8'>
					{/* Active Section */}
					{activePlans.length > 0 && (
						<div className='space-y-4'>
							<h3 className='text-xs font-medium text-muted-foreground/70 uppercase tracking-widest flex items-center gap-2'>
								<div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
								Devam Eden / Tamamlanan
							</h3>
							<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
								{activePlans
									.filter((p) =>
										showCompleted
											? true
											: p.status !== 'Tamamlandı',
									)
									.map((plan) => (
										<div key={plan.id}>
											<PlanCard plan={plan} />
										</div>
									))}
							</div>
						</div>
					)}

					{/* Backlog Section (Draggable) */}
					<div className='space-y-4'>
						<h3 className='text-xs font-medium text-muted-foreground/70 uppercase tracking-widest flex items-center gap-2'>
							<div className='h-1.5 w-1.5 rounded-full bg-primary' />
							Yapılacaklar
						</h3>
						<DndContext
							id='annual-plans-dnd'
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={backlogPlans.map((p) => p.id)}
								strategy={rectSortingStrategy}
							>
								<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
									{backlogPlans.map((plan) => (
										<SortablePlanCard
											key={plan.id}
											plan={plan}
										>
											<div className='h-full'>
												<PlanCard plan={plan} />
											</div>
										</SortablePlanCard>
									))}
									{backlogPlans.length === 0 && (
										<div className='col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl'>
											Bekleyen iş yok.
										</div>
									)}
								</div>
							</SortableContext>
						</DndContext>
					</div>
				</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		Beklemede: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
		'Devam Ediyor': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
		Tamamlandı: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
	};

	const icons: Record<string, typeof Clock> = {
		Beklemede: Clock,
		'Devam Ediyor': AlertCircle,
		Tamamlandı: CheckCircle2,
	};

	const Icon = icons[status] || Clock;
	const style = styles[status] || 'bg-muted text-muted-foreground';

	return (
		<span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', style)}>
			<Icon className='h-3 w-3' />
			{status}
		</span>
	);
}

function SortablePlanCard({
	plan,
	children,
}: {
	plan: AnnualPlan;
	children: React.ReactNode;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: plan.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : 1,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			{children}
		</div>
	);
}
