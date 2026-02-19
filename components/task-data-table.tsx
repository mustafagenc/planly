'use client';

import { useState, useMemo } from 'react';
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	type Task,
	type Project,
	type Unit,
	type Person,
	type TaskType,
	type TaskStatus,
} from '@/prisma/generated/client';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import {
	CalendarDays,
	Zap,
	Clock,
	CheckCircle2,
	AlertCircle,
	CircleDashed,
	Pencil,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Search,
} from 'lucide-react';
import { WorkLogDialog } from './work-log-dialog';
import { EditTaskDialog } from './edit-task-dialog';
import { CreateTaskDialog } from './create-task-dialog';

type TaskWithRelations = Task & {
	project: Project;
	unit: Unit | null;
	responsible: Person | null;
};

interface TaskDataTableProps {
	tasks: TaskWithRelations[];
	projects: Project[];
	units: Unit[];
	people: Person[];
}

const TYPE_CONFIG: Record<
	TaskType,
	{ label: string; icon: typeof CalendarDays; className: string }
> = {
	ANNUAL_PLAN: {
		label: 'Yıllık Plan',
		icon: CalendarDays,
		className: 'bg-primary/10 text-primary',
	},
	ADHOC: {
		label: 'Plan Harici',
		icon: Zap,
		className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
	},
};

const STATUS_CONFIG: Record<
	TaskStatus,
	{ label: string; icon: typeof Clock; className: string }
> = {
	BACKLOG: {
		label: 'Beklemede',
		icon: CircleDashed,
		className: 'bg-muted text-muted-foreground',
	},
	TODO: {
		label: 'Yapılacak',
		icon: Clock,
		className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
	},
	IN_PROGRESS: {
		label: 'Devam Ediyor',
		icon: AlertCircle,
		className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	},
	DONE: {
		label: 'Tamamlandı',
		icon: CheckCircle2,
		className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
	},
};

function TypeBadge({ type }: { type: TaskType }) {
	const config = TYPE_CONFIG[type];
	const Icon = config.icon;
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
				config.className,
			)}
		>
			<Icon className='h-3 w-3' />
			{config.label}
		</span>
	);
}

function StatusBadge({ status }: { status: TaskStatus }) {
	const config = STATUS_CONFIG[status];
	const Icon = config.icon;
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
				config.className,
			)}
		>
			<Icon className='h-3 w-3' />
			{config.label}
		</span>
	);
}

function ProgressBar({ value, status }: { value: number; status: TaskStatus }) {
	return (
		<div className='flex items-center gap-2'>
			<div className='h-1.5 w-16 rounded-full bg-secondary overflow-hidden'>
				<div
					className={cn(
						'h-full rounded-full transition-all duration-500',
						status === 'DONE'
							? 'bg-emerald-500'
							: value > 50
								? 'bg-primary'
								: 'bg-primary/60',
					)}
					style={{ width: `${Math.max(value, 2)}%` }}
				/>
			</div>
			<span className='text-xs text-muted-foreground tabular-nums'>
				%{value}
			</span>
		</div>
	);
}

function SortableHeader({
	column,
	children,
}: {
	column: {
		toggleSorting: (desc: boolean) => void;
		getIsSorted: () => false | 'asc' | 'desc';
	};
	children: React.ReactNode;
}) {
	return (
		<Button
			variant='ghost'
			size='sm'
			className='-ml-3 h-8 text-xs font-semibold'
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
		>
			{children}
			<ArrowUpDown className='ml-1.5 h-3.5 w-3.5 text-muted-foreground/50' />
		</Button>
	);
}

function buildColumns(
	projects: Project[],
	units: Unit[],
	people: Person[],
): ColumnDef<TaskWithRelations>[] {
	return [
		{
			accessorKey: 'type',
			header: ({ column }) => (
				<SortableHeader column={column}>Tip</SortableHeader>
			),
			cell: ({ row }) => <TypeBadge type={row.original.type} />,
			filterFn: (row, _id, filterValue: string) => {
				if (filterValue === 'all') return true;
				return row.original.type === filterValue;
			},
			size: 130,
		},
		{
			accessorKey: 'project.name',
			id: 'project',
			header: ({ column }) => (
				<SortableHeader column={column}>Proje</SortableHeader>
			),
			cell: ({ row }) => (
				<span className='font-medium text-sm'>
					{row.original.project.name}
				</span>
			),
			filterFn: (row, _id, filterValue: string) => {
				if (filterValue === 'all') return true;
				return row.original.projectId.toString() === filterValue;
			},
		},
		{
			accessorKey: 'title',
			header: ({ column }) => (
				<SortableHeader column={column}>Başlık</SortableHeader>
			),
			cell: ({ row }) => {
				const task = row.original;
				return (
					<div className='max-w-[300px]'>
						<div className='flex items-center gap-1.5'>
							<span className='text-sm truncate'>
								{task.title}
							</span>
							{task.ticketNo && (
								<span className='text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-mono font-medium shrink-0'>
									{task.ticketNo}
								</span>
							)}
						</div>
						{task.detail && (
							<p className='text-xs text-muted-foreground/70 truncate mt-0.5'>
								{task.detail}
							</p>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: 'status',
			header: ({ column }) => (
				<SortableHeader column={column}>Durum</SortableHeader>
			),
			cell: ({ row }) => <StatusBadge status={row.original.status} />,
			filterFn: (row, _id, filterValue: string) => {
				if (filterValue === 'all') return true;
				return row.original.status === filterValue;
			},
			size: 140,
		},
		{
			accessorKey: 'responsible.name',
			id: 'responsible',
			header: ({ column }) => (
				<SortableHeader column={column}>Sorumlu</SortableHeader>
			),
			cell: ({ row }) => (
				<span className='text-sm text-foreground/80'>
					{row.original.responsible?.name ?? '-'}
				</span>
			),
			size: 120,
		},
		{
			accessorKey: 'daysSpent',
			header: ({ column }) => (
				<SortableHeader column={column}>Efor</SortableHeader>
			),
			cell: ({ row }) => {
				const task = row.original;
				const estimated = task.estimatedDays;
				return (
					<div className='text-right'>
						<span className='font-semibold text-sm tabular-nums'>
							{task.daysSpent}
						</span>
						{estimated != null && estimated > 0 && (
							<span className='text-xs text-muted-foreground'>
								/{estimated}
							</span>
						)}
						<span className='text-xs text-muted-foreground ml-0.5'>
							gün
						</span>
					</div>
				);
			},
			size: 100,
		},
		{
			accessorKey: 'progress',
			header: ({ column }) => (
				<SortableHeader column={column}>İlerleme</SortableHeader>
			),
			cell: ({ row }) => (
				<ProgressBar
					value={row.original.progress}
					status={row.original.status}
				/>
			),
			size: 140,
		},
		{
			id: 'actions',
			header: () => <span className='text-xs font-semibold'>İşlem</span>,
			cell: ({ row }) => {
				const task = row.original;
				return (
					<div className='flex items-center gap-0.5'>
						<EditTaskDialog
							task={task}
							projects={projects}
							units={units}
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
							taskId={task.id}
							title={task.title}
							trigger={
								<Button
									variant='ghost'
									size='sm'
									className='h-7 text-xs px-2 text-muted-foreground hover:text-foreground'
								>
									<Clock className='mr-1 h-3 w-3' /> Efor
								</Button>
							}
						/>
					</div>
				);
			},
			size: 120,
		},
	];
}

export function TaskDataTable({
	tasks,
	projects,
	units,
	people,
}: TaskDataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		{},
	);
	const [globalFilter, setGlobalFilter] = useState('');

	const columns = useMemo(
		() => buildColumns(projects, units, people),
		[projects, units, people],
	);

	const table = useReactTable({
		data: tasks,
		columns,
		state: { sorting, columnFilters, columnVisibility, globalFilter },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		globalFilterFn: (row, _columnId, filterValue: string) => {
			const search = filterValue.toLowerCase();
			const task = row.original;
			return (
				task.title.toLowerCase().includes(search) ||
				task.project.name.toLowerCase().includes(search) ||
				(task.ticketNo?.toLowerCase().includes(search) ?? false) ||
				(task.responsible?.name.toLowerCase().includes(search) ??
					false) ||
				(task.detail?.toLowerCase().includes(search) ?? false)
			);
		},
		initialState: {
			pagination: { pageSize: 10 },
		},
	});

	const typeFilter =
		(table.getColumn('type')?.getFilterValue() as string) ?? 'all';
	const statusFilter =
		(table.getColumn('status')?.getFilterValue() as string) ?? 'all';

	return (
		<div className='space-y-4'>
			{/* Header */}
			<div className='flex items-center justify-between flex-wrap gap-4'>
				<div>
					<h2 className='text-xl font-semibold tracking-tight'>
						İş Listesi
					</h2>
					<p className='text-sm text-muted-foreground mt-0.5'>
						Toplam{' '}
						<span className='font-medium text-foreground'>
							{table.getFilteredRowModel().rows.length}
						</span>{' '}
						iş
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className='flex items-center gap-3 flex-wrap'>
				<InputGroup className='max-w-xs'>
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						placeholder='Ara... (başlık, proje, ticket)'
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
					/>
				</InputGroup>
				<Select
					value={typeFilter}
					onValueChange={(v) =>
						table.getColumn('type')?.setFilterValue(v)
					}
				>
					<SelectTrigger className='w-[150px]'>
						<SelectValue placeholder='Tip' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>Tüm Tipler</SelectItem>
						<SelectItem value='ANNUAL_PLAN'>Yıllık Plan</SelectItem>
						<SelectItem value='ADHOC'>Plan Harici</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={statusFilter}
					onValueChange={(v) =>
						table.getColumn('status')?.setFilterValue(v)
					}
				>
					<SelectTrigger className='w-[150px]'>
						<SelectValue placeholder='Durum' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>Tüm Durumlar</SelectItem>
						<SelectItem value='BACKLOG'>Beklemede</SelectItem>
						<SelectItem value='TODO'>Yapılacak</SelectItem>
						<SelectItem value='IN_PROGRESS'>
							Devam Ediyor
						</SelectItem>
						<SelectItem value='DONE'>Tamamlandı</SelectItem>
					</SelectContent>
				</Select>
				<div className='ml-auto'>
					<CreateTaskDialog
						projects={projects}
						units={units}
						people={people}
					/>
				</div>
			</div>

			{/* Table */}
			<div className='rounded-xl border border-border/60 bg-card overflow-hidden'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className='hover:bg-transparent bg-muted/30'
							>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										style={{
											width:
												header.column.getSize() !== 150
													? header.column.getSize()
													: undefined,
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className='group'>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-32 text-center text-sm text-muted-foreground/60'
								>
									Gösterilecek iş bulunamadı
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<p className='text-xs text-muted-foreground'>Satır:</p>
					<Select
						value={table.getState().pagination.pageSize.toString()}
						onValueChange={(v) => table.setPageSize(Number(v))}
					>
						<SelectTrigger className='w-[70px]'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{[10, 20, 30, 40, 50].map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className='text-xs text-muted-foreground'>
						Sayfa {table.getState().pagination.pageIndex + 1} /{' '}
						{table.getPageCount() || 1}
					</p>
				</div>
				<div className='flex items-center gap-1'>
					<Button
						variant='outline'
						size='sm'
						className='h-8 w-8 p-0'
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronsLeft className='h-3.5 w-3.5' />
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='h-8 w-8 p-0'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft className='h-3.5 w-3.5' />
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='h-8 w-8 p-0'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRight className='h-3.5 w-3.5' />
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='h-8 w-8 p-0'
						onClick={() =>
							table.setPageIndex(table.getPageCount() - 1)
						}
						disabled={!table.getCanNextPage()}
					>
						<ChevronsRight className='h-3.5 w-3.5' />
					</Button>
				</div>
			</div>
		</div>
	);
}
