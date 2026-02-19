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
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { WorkLogDialog } from './work-log-dialog';
import { CreateAnnualPlanDialog } from './create-annual-plan-dialog';
import { EditAnnualPlanDialog } from './edit-annual-plan-dialog';
import { Pencil } from 'lucide-react';

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

export function AnnualPlansList({ plans, projects, units, people }: AnnualPlansListProps) {
    const [filter, setFilter] = useState('');

    const filteredPlans = plans.filter((plan) =>
        plan.taskSummary.toLowerCase().includes(filter.toLowerCase()) ||
        plan.project.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Yıllık İş Planı</h2>
                    <p className="text-muted-foreground">
                        Planlanan işlerinizi takip edin ve yönetin.
                    </p>
                </div>
                <CreateAnnualPlanDialog projects={projects} units={units} people={people} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => (
                    <Card key={plan.id} className="group hover:shadow-md transition-shadow relative">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold">
                                    {plan.project.name}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {plan.unit?.name || 'Genel'}
                                </CardDescription>
                            </div>
                            <StatusBadge status={plan.status} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium leading-none mb-2">
                                {plan.taskSummary}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                                {plan.detail}
                            </p>

                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-foreground">{plan.responsible?.name || '-'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>{plan.progress}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                {/* Edit and other actions */}
                                <div className="flex gap-1">
                                    <EditAnnualPlanDialog
                                        plan={plan}
                                        people={people}
                                        trigger={
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        }
                                    />
                                </div>
                                <WorkLogDialog
                                    title={plan.taskSummary}
                                    annualPlanId={plan.id}
                                    trigger={
                                        <Button variant="ghost" size="sm" className="h-6 text-xs px-2 -ml-2">
                                            <Clock className="mr-1 h-3 w-3" /> Efor Gir
                                        </Button>
                                    }
                                />
                            </div>

                            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden absolute bottom-0 left-0 right-0 rounded-t-none">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${plan.progress}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredPlans.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Kayıt bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        'Beklemede': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Devam Ediyor': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Tamamlandı': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };

    const icons = {
        'Beklemede': Clock,
        'Devam Ediyor': AlertCircle,
        'Tamamlandı': CheckCircle2
    }

    const Icon = icons[status as keyof typeof icons] || Clock;
    const style = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';

    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", style)}>
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
}
