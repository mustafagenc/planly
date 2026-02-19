import { PlanlyLogo } from "@/components/planly-logo";
import { getAnnualPlans } from "./actions/annual-plan";
import { getAdHocTasks } from "./actions/adhoc-task";
import { getProjects, getUnits, getPeople } from "./actions/definitions";
import { AnnualPlansList } from "@/components/annual-plans-list";
import { AdHocTasksList } from "@/components/adhoc-tasks-list";
import { MonthlyEffortReport } from "@/components/monthly-effort-report";
import { DefinitionsManager } from "@/components/definitions-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Zap, BarChart3, Database } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [annualPlans, adHocTasks, projects, units, people] = await Promise.all([
    getAnnualPlans(),
    getAdHocTasks(),
    getProjects(),
    getUnits(),
    getPeople(),
  ]);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <PlanlyLogo size={180} showText={true} />
        </div>

        <Tabs defaultValue="reports" className="w-full space-y-6">

          <TabsList className="grid w-full grid-cols-4 max-w-[800px]">
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Raporlar
            </TabsTrigger>
            <TabsTrigger value="annual" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Yıllık İş Planı
            </TabsTrigger>
            <TabsTrigger value="adhoc" className="gap-2">
              <Zap className="h-4 w-4" />
              Plan Harici İşler
            </TabsTrigger>
            <TabsTrigger value="definitions" className="gap-2">
              <Database className="h-4 w-4" />
              Tanımlamalar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <MonthlyEffortReport />
          </TabsContent>

          <TabsContent value="annual">
            <AnnualPlansList
              plans={annualPlans}
              projects={projects}
              units={units}
              people={people}
            />
          </TabsContent>

          <TabsContent value="adhoc">
            <AdHocTasksList
              tasks={adHocTasks}
              projects={projects}
              people={people}
            />
          </TabsContent>

          <TabsContent value="definitions">
            <DefinitionsManager
              projects={projects}
              units={units}
              people={people}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
