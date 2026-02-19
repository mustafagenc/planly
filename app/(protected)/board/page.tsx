import { getTasksByStatus } from '@/app/actions/task';
import { getProjects, getUnits, getPeople } from '@/app/actions/definitions';
import { KanbanBoard } from '@/components/kanban-board';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
    const [columns, projects, units, people] = await Promise.all([
        getTasksByStatus(),
        getProjects(),
        getUnits(),
        getPeople(),
    ]);

    return (
        <div className="animate-in">
            <KanbanBoard columns={columns} projects={projects} units={units} people={people} />
        </div>
    );
}
