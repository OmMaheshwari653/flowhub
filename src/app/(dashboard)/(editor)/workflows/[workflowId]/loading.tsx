import { Skeleton } from "@/components/ui/skeleton";

/*
 * Editor route ka skeleton: upar header bar, neeche canvas area.
 * Canvas ka shape pehle se dikh jaye to workflow kholna instant lagta hai.
 */
const Loading = () => {
  return (
    <>
      <div className="flex items-center justify-between border-b px-4 h-14 shrink-0">
        <div className="flex items-center gap-x-3">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
      <main className="flex-1 bg-muted/30 relative">
        <Skeleton className="absolute left-1/2 top-1/3 h-24 w-56 -translate-x-1/2 rounded-xl" />
        <Skeleton className="absolute bottom-6 left-6 h-24 w-10 rounded-md" />
        <Skeleton className="absolute bottom-6 right-6 h-24 w-40 rounded-md" />
      </main>
    </>
  );
};

export default Loading;
