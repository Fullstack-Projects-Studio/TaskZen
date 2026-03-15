import { Skeleton } from "@/components/ui/skeleton";

export default function MonthlyLoading() {
  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}
