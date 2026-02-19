import { PlanlyLogo } from "@/components/planly-logo";
import { getAnnualPlans } from "./actions/annual-plan";
import { getAdHocTasks } from "./actions/adhoc-task";
import { getProjects, getUnits, getPeople } from "./actions/definitions";
import { AnnualPlansList } from "@/components/annual-plans-list";
import { AdHocTasksList } from "@/components/adhoc-tasks-list";
import { MonthlyEffortReport } from "@/components/monthly-effort-report";
import { DefinitionsManager } from "@/components/definitions-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Zap, BarChart3, Settings2 } from "lucide-react";

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
    <>
      {/* Header */}
      <header className="flex items-end justify-between pb-2">
        <PlanlyLogo size={160} showText={true} />
        <p className="text-sm text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="reports" className="w-full space-y-6">
        <TabsList className="inline-flex h-11 gap-1 rounded-xl bg-muted/60 p-1 backdrop-blur-sm">
          <TabsTrigger value="reports" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            Raporlar
          </TabsTrigger>
          <TabsTrigger value="annual" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-sm">
            <CalendarDays className="h-4 w-4" />
            Yıllık İş Planı
          </TabsTrigger>
          <TabsTrigger value="adhoc" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-sm">
            <Zap className="h-4 w-4" />
            Plan Harici İşler
          </TabsTrigger>
          <TabsTrigger value="definitions" className="gap-2 rounded-lg px-4 data-[state=active]:shadow-sm">
            <Settings2 className="h-4 w-4" />
            Tanımlamalar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="animate-in">
          <MonthlyEffortReport />
        </TabsContent>

        <TabsContent value="annual" className="animate-in">
          <AnnualPlansList
            plans={annualPlans}
            projects={projects}
            units={units}
            people={people}
          />
        </TabsContent>

        <TabsContent value="adhoc" className="animate-in">
          <AdHocTasksList
            tasks={adHocTasks}
            projects={projects}
            people={people}
          />
        </TabsContent>

        <TabsContent value="definitions" className="animate-in">
          <DefinitionsManager
            projects={projects}
            units={units}
            people={people}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
