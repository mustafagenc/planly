import { getTasks } from '@/app/actions/task';
import { getProjects, getUnits, getPeople } from '@/app/actions/definitions';
import { TaskDataTable } from '@/components/task-data-table';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
    const [tasks, projects, units, people] = await Promise.all([
        getTasks(),
        getProjects(),
        getUnits(),
        getPeople(),
    ]);

    return (
        <div className="animate-in">
            <TaskDataTable tasks={tasks} projects={projects} units={units} people={people} />
        </div>
    );
}
