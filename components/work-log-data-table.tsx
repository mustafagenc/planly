'use client';

import { useState, useMemo } from 'react';
import {
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { type WorkLog, type Task, type Project } from '@/prisma/generated/client';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Pencil,
	Search,
	CalendarDays,
	Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { EditWorkLogDialog } from './edit-work-log-dialog';

type WorkLogWithTask = WorkLog & { task: Task & { project: Project } };

interface WorkLogDataTableProps {
	logs: WorkLogWithTask[];
	onUpdate: () => void;
}

function SortableHeader({
	column,
	children,
}: {
	column: { toggleSorting: (desc: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' };
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

function buildColumns(onUpdate: () => void): ColumnDef<WorkLogWithTask>[] {
	return [
		{
			accessorKey: 'date',
			header: ({ column }) => <SortableHeader column={column}>Tarih</SortableHeader>,
			cell: ({ row }) => (
				<span className='text-sm tabular-nums'>
					{format(new Date(row.original.date), 'dd MMM yyyy', { locale: tr })}
				</span>
			),
			sortingFn: (a, b) =>
				new Date(a.original.date).getTime() - new Date(b.original.date).getTime(),
		},
		{
			id: 'type',
			accessorFn: (row) => row.task.type,
			header: ({ column }) => <SortableHeader column={column}>Tip</SortableHeader>,
			cell: ({ row }) => {
				const type = row.original.task.type;
				return (
					<span
						className={cn(
							'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
							type === 'ANNUAL_PLAN'
								? 'bg-primary/10 text-primary'
								: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
						)}
					>
						{type === 'ANNUAL_PLAN' ? (
							<CalendarDays className='h-3 w-3' />
						) : (
							<Zap className='h-3 w-3' />
						)}
						{type === 'ANNUAL_PLAN' ? 'Yıllık Plan' : 'Plan Harici'}
					</span>
				);
			},
			filterFn: (row, _id, filterValue: string) => {
				if (filterValue === 'all') return true;
				return row.original.task.type === filterValue;
			},
		},
		{
			id: 'project',
			accessorFn: (row) => row.task.project.name,
			header: ({ column }) => <SortableHeader column={column}>Proje</SortableHeader>,
			cell: ({ row }) => (
				<span className='font-medium text-sm'>{row.original.task.project.name}</span>
			),
		},
		{
			id: 'task',
			accessorFn: (row) => row.task.title,
			header: ({ column }) => <SortableHeader column={column}>İş</SortableHeader>,
			cell: ({ row }) => (
				<div className='max-w-[250px]'>
					<span className='text-sm truncate block'>{row.original.task.title}</span>
				</div>
			),
		},
		{
			accessorKey: 'description',
			header: () => <span className='text-xs font-semibold'>Açıklama</span>,
			cell: ({ row }) => (
				<div className='max-w-[200px]'>
					<span className='text-xs text-muted-foreground truncate block'>
						{row.original.description || '-'}
					</span>
				</div>
			),
		},
		{
			accessorKey: 'daysWorked',
			header: ({ column }) => <SortableHeader column={column}>Efor</SortableHeader>,
			cell: ({ row }) => (
				<div className='text-right'>
					<span className='font-semibold text-sm tabular-nums'>
						{row.original.daysWorked}
					</span>
					<span className='text-xs text-muted-foreground ml-0.5'>gün</span>
				</div>
			),
			size: 80,
		},
		{
			id: 'actions',
			header: () => <span className='text-xs font-semibold'>İşlem</span>,
			cell: ({ row }) => (
				<EditWorkLogDialog
					log={row.original}
					onUpdate={onUpdate}
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
			),
			size: 60,
		},
	];
}

export function WorkLogDataTable({ logs, onUpdate }: WorkLogDataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState('');

	const columns = useMemo(() => buildColumns(onUpdate), [onUpdate]);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: logs,
		columns,
		state: { sorting, columnFilters, globalFilter },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		globalFilterFn: (row, _columnId, filterValue: string) => {
			const search = filterValue.toLowerCase();
			const log = row.original;
			return (
				log.task.project.name.toLowerCase().includes(search) ||
				log.task.title.toLowerCase().includes(search) ||
				(log.description?.toLowerCase().includes(search) ?? false)
			);
		},
		initialState: {
			pagination: { pageSize: 10 },
		},
	});

	const typeFilter = (table.getColumn('type')?.getFilterValue() as string) ?? 'all';

	const totalFiltered = table
		.getFilteredRowModel()
		.rows.reduce((sum, row) => sum + row.original.daysWorked, 0);

	return (
		<div className='space-y-3'>
			{/* Filters */}
			<div className='flex items-center gap-3 flex-wrap'>
				<InputGroup className='max-w-xs'>
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						placeholder='Ara... (proje, iş, açıklama)'
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
					/>
				</InputGroup>
				<Select
					value={typeFilter}
					onValueChange={(v) => table.getColumn('type')?.setFilterValue(v)}
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
				<p className='ml-auto text-xs text-muted-foreground'>
					<span className='font-medium text-foreground'>
						{table.getFilteredRowModel().rows.length}
					</span>{' '}
					kayıt · Toplam{' '}
					<span className='font-semibold text-foreground'>{totalFiltered} gün</span>
				</p>
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
													header.column.columnDef.header,
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
									className='h-24 text-center text-sm text-muted-foreground/60'
								>
									Efor kaydı bulunamadı
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
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<ChevronsRight className='h-3.5 w-3.5' />
					</Button>
				</div>
			</div>
		</div>
	);
}
