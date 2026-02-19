'use client';

import { AdHocTask, Project, Person } from '@/prisma/generated/client';
import {
    Card
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { WorkLogDialog } from './work-log-dialog';
import { CreateAdHocTaskDialog } from './create-adhoc-task-dialog';
import { EditAdHocTaskDialog } from './edit-adhoc-task-dialog';
import { Pencil } from 'lucide-react';

interface AdHocTasksListProps {
    tasks: (AdHocTask & {
        project: Project;
        responsible: Person | null;
    })[];
    projects: Project[];
    people: Person[];
}

export function AdHocTasksList({ tasks, projects, people }: AdHocTasksListProps) {
    const [filter, setFilter] = useState('');

    const filteredTasks = tasks.filter((task) =>
        task.description.toLowerCase().includes(filter.toLowerCase()) ||
        task.project.name.toLowerCase().includes(filter.toLowerCase()) ||
        (task.ticketNo && task.ticketNo.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Plan Harici İşler</h2>
                    <p className="text-muted-foreground">
                        Plansız ancak yapılan ek işlerin takibi.
                    </p>
                </div>
                <CreateAdHocTaskDialog projects={projects} people={people} />
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {filteredTasks.map((task) => (
                    <Card key={task.id} className="group hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center p-6 gap-4">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">{task.project.name}</span>
                                    {task.ticketNo && (
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                                            {task.ticketNo}
                                        </span>
                                    )}
                                    <StatusBadge progress={task.progress} />
                                </div>
                                <p className="text-sm">
                                    {task.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    {task.remarks && (
                                        <p className="text-xs text-muted-foreground">
                                            Not: {task.remarks}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <EditAdHocTaskDialog
                                            task={task}
                                            people={people}
                                            trigger={
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            }
                                        />
                                        <WorkLogDialog
                                            title={task.description}
                                            adHocTaskId={task.id}
                                            trigger={
                                                <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                                                    <Clock className="mr-1 h-3 w-3" /> Efor Gir
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground min-w-[200px] justify-end">
                                {task.coResponsible && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-semibold">Ortak Çalışma</span>
                                        <span className="text-foreground">{task.coResponsible}</span>
                                    </div>
                                )}

                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase font-semibold">Sorumlu</span>
                                    <span className="text-foreground">{task.responsible?.name || '-'}</span>
                                </div>

                                <div className="flex flex-col items-end min-w-[60px]">
                                    <span className="text-[10px] uppercase font-semibold">Efor</span>
                                    <span className="text-foreground">{task.daysSpent || 0} gün</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Line at Bottom */}
                        <div className="h-1 w-full bg-secondary overflow-hidden rounded-b-xl">
                            <div
                                className={cn("h-full transition-all duration-500",
                                    task.progress === 100 ? "bg-green-500" : "bg-blue-500"
                                )}
                                style={{ width: `${task.progress}%` }}
                            />
                        </div>
                    </Card>
                ))}

                {filteredTasks.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground border rounded-xl border-dashed">
                        Kayıt bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ progress }: { progress: number }) {
    let status = 'Devam Ediyor';
    let style = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    let Icon = AlertCircle;

    if (progress === 0) {
        status = 'Başlamadı';
        style = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        Icon = Clock;
    } else if (progress === 100) {
        status = 'Tamamlandı';
        style = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        Icon = CheckCircle2;
    }

    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ml-2", style)}>
            <Icon className="h-3 w-3" />
            {status} ({progress}%)
        </span>
    );
}
