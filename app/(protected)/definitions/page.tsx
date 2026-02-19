import { getProjects, getUnits, getPeople } from '@/app/actions/definitions';
import { getSettings } from '@/app/actions/settings';
import { DefinitionsManager } from '@/components/definitions-manager';

export const dynamic = 'force-dynamic';

export default async function DefinitionsPage() {
	const [projects, units, people, settings] = await Promise.all([
		getProjects(),
		getUnits(),
		getPeople(),
		getSettings(),
	]);

	return (
		<div className='animate-in'>
			<DefinitionsManager
				projects={projects}
				units={units}
				people={people}
				settings={settings}
			/>
		</div>
	);
}
