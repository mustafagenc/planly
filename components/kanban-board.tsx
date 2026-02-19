'use client';

import { useState, type DragEvent } from 'react';
import { type Task, type Project, type Unit, type Person, type TaskStatus } from '@/prisma/generated/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pencil, Clock, CalendarDays, Zap, CheckCircle2, AlertCircle, CircleDashed, LayoutList } from 'lucide-react';
import { WorkLogDialog } from './work-log-dialog';
import { EditTaskDialog } from './edit-task-dialog';
import { CreateTaskDialog } from './create-task-dialog';
import { updateTaskStatus } from '@/app/actions/task';

type TaskWithRelations = Task & { project: Project; unit: Unit | null; responsible: Person | null };

interface KanbanBoardProps {
    columns: Record<TaskStatus, TaskWithRelations[]>;
    projects: Project[];
    units: Unit[];
    people: Person[];
}

const COLUMN_CONFIG: { status: TaskStatus; label: string; icon: typeof Clock; color: string }[] = [
    { status: 'BACKLOG', label: 'Beklemede', icon: CircleDashed, color: 'border-t-muted-foreground/30' },
    { status: 'TODO', label: 'Yapılacak', icon: LayoutList, color: 'border-t-amber-500' },
    { status: 'IN_PROGRESS', label: 'Devam Ediyor', icon: AlertCircle, color: 'border-t-blue-500' },
    { status: 'DONE', label: 'Tamamlandı', icon: CheckCircle2, color: 'border-t-emerald-500' },
];

export function KanbanBoard({ columns, projects, units, people }: KanbanBoardProps) {
    const [boardData, setBoardData] = useState(columns);
    const [draggedTask, setDraggedTask] = useState<TaskWithRelations | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

    const [prevColumns, setPrevColumns] = useState(columns);
    if (columns !== prevColumns) {
        setPrevColumns(columns);
        setBoardData(columns);
    }

    const handleDragStart = (task: TaskWithRelations) => {
        setDraggedTask(task);
    };

    const handleColumnDragOver = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleColumnDrop = async (targetStatus: TaskStatus) => {
        if (!draggedTask || draggedTask.status === targetStatus) {
            setDraggedTask(null);
            setDragOverColumn(null);
            return;
        }

        const sourceStatus = draggedTask.status;

        // Optimistic update
        setBoardData(prev => {
            const newData = { ...prev };
            newData[sourceStatus] = prev[sourceStatus].filter(t => t.id !== draggedTask.id);
            const movedTask = { ...draggedTask, status: targetStatus };
            newData[targetStatus] = [...prev[targetStatus], movedTask];
            return newData;
        });

        setDraggedTask(null);
        setDragOverColumn(null);

        try {
            await updateTaskStatus(draggedTask.id, targetStatus);
        } catch {
            setBoardData(columns);
        }
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Kanban</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">İşleri sürükleyerek durumlarını değiştirin</p>
                </div>
                <CreateTaskDialog projects={projects} units={units} people={people} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLUMN_CONFIG.map(({ status, label, icon: Icon, color }) => (
                    <div
                        key={status}
                        onDragOver={(e) => handleColumnDragOver(e, status)}
                        onDrop={() => handleColumnDrop(status)}
                        onDragLeave={() => setDragOverColumn(null)}
                        className={cn(
                            'flex flex-col rounded-xl border-t-4 bg-muted/30 p-3 min-h-[300px] transition-all duration-200',
                            color,
                            dragOverColumn === status && 'ring-2 ring-primary/30 bg-primary/5',
                        )}
                    >
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-semibold">{label}</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground bg-background rounded-full px-2 py-0.5">
                                {boardData[status].length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-2">
                            {boardData[status].map(task => (
                                <KanbanCard
                                    key={task.id}
                                    task={task}
                                    projects={projects}
                                    units={units}
                                    people={people}
                                    onDragStart={() => handleDragStart(task)}
                                    onDragEnd={handleDragEnd}
                                    isDragging={draggedTask?.id === task.id}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function KanbanCard({ task, projects, units, people, onDragStart, onDragEnd, isDragging }: {
    task: TaskWithRelations;
    projects: Project[];
    units: Unit[];
    people: Person[];
    onDragStart: () => void;
    onDragEnd: () => void;
    isDragging: boolean;
}) {
    return (
        <Card
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={cn(
                'cursor-grab active:cursor-grabbing p-3 transition-all duration-150 border-border/60 hover:shadow-md group',
                isDragging && 'opacity-40 scale-95',
            )}
        >
            <div className="space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full px-1.5 py-0.5',
                        task.type === 'ANNUAL_PLAN' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    )}>
                        {task.type === 'ANNUAL_PLAN' ? <CalendarDays className="h-2.5 w-2.5" /> : <Zap className="h-2.5 w-2.5" />}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{task.project.name}</span>
                    {task.ticketNo && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-mono">{task.ticketNo}</span>
                    )}
                </div>

                <p className="text-sm font-medium leading-snug">{task.title}</p>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                        {task.responsible && (
                            <span className="text-xs text-muted-foreground">{task.responsible.name}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditTaskDialog task={task} projects={projects} units={units} people={people} trigger={
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                                <Pencil className="h-3 w-3" />
                            </Button>
                        } />
                        <WorkLogDialog taskId={task.id} title={task.title} trigger={
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                                <Clock className="h-3 w-3" />
                            </Button>
                        } />
                    </div>
                </div>

                {task.daysSpent > 0 && (
                    <div className="text-[11px] text-muted-foreground font-medium">{task.daysSpent} gün harcandı</div>
                )}
            </div>

            {task.progress > 0 && (
                <div className="mt-2 h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all',
                            task.status === 'DONE' ? 'bg-emerald-500' : 'bg-primary/70'
                        )}
                        style={{ width: `${task.progress}%` }}
                    />
                </div>
            )}
        </Card>
    );
}
