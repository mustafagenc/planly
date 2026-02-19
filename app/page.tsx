import { PlanlyLogo } from "@/components/planly-logo";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-12 p-8">
        <PlanlyLogo size={180} showText={true} />
      </div>
    </div>
  );
}
