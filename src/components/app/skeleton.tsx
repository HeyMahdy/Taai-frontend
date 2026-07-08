import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md bg-muted animate-pulse", className)} />
  );
}

/** Dashboard skeleton — stats + list + sidebar card */
export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-lg border border-border bg-card space-y-3">
            <Bone className="h-3 w-24" />
            <Bone className="h-8 w-16" />
            <Bone className="h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Actions */}
      <div className="flex gap-3">
        <Bone className="h-10 w-40 rounded-md" />
        <Bone className="h-10 w-36 rounded-md" />
      </div>
      {/* Content */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-4 border-b border-border flex justify-between">
            <Bone className="h-4 w-28" />
            <Bone className="h-4 w-16" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Bone className="size-9 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-4 w-48" />
                  <Bone className="h-3 w-32" />
                </div>
                <Bone className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <Bone className="h-4 w-20" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Bone className="h-3 w-16" />
                <Bone className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Table/list skeleton — header + rows */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Bone className="h-10 w-72 rounded-md" />
        <Bone className="h-10 w-36 rounded-md" />
      </div>
      {/* Header */}
      <div className="px-4 py-2 flex gap-4">
        <Bone className="h-3 w-20" />
        <Bone className="h-3 w-32 flex-1" />
        <Bone className="h-3 w-20" />
      </div>
      {/* Rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-md border border-border bg-card">
            <Bone className="h-4 w-24" />
            <Bone className="h-4 w-48 flex-1" />
            <div className="flex gap-1">
              <Bone className="size-8 rounded-md" />
              <Bone className="size-8 rounded-md" />
              <Bone className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Card grid skeleton — for assignments */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Bone className="h-10 w-80 rounded-md" />
        <Bone className="h-10 w-40 rounded-md" />
      </div>
      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 rounded-lg border border-border bg-card space-y-4">
            <div className="flex items-start justify-between">
              <Bone className="size-11 rounded-md" />
              <div className="flex gap-1">
                <Bone className="size-8 rounded-md" />
                <Bone className="size-8 rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              <Bone className="h-5 w-3/4" />
              <Bone className="h-3 w-1/2" />
            </div>
            <div className="space-y-2">
              <Bone className="h-3 w-32" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-px w-full" />
            <Bone className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Detail page skeleton — back button + card + two columns */
export function DetailSkeleton() {
  return (
    <div className="w-full space-y-6">
      <Bone className="h-9 w-36 rounded-md" />
      {/* Info card */}
      <div className="p-5 rounded-lg border border-border bg-card flex items-center gap-6">
        <Bone className="size-12 rounded-md" />
        <div className="flex-1 space-y-2">
          <Bone className="h-5 w-48" />
          <Bone className="h-3 w-32" />
        </div>
        <div className="flex gap-6">
          <div className="space-y-1 text-center">
            <Bone className="h-7 w-10 mx-auto" />
            <Bone className="h-3 w-14" />
          </div>
          <div className="space-y-1 text-center">
            <Bone className="h-7 w-10 mx-auto" />
            <Bone className="h-3 w-14" />
          </div>
          <div className="space-y-1 text-center">
            <Bone className="h-7 w-10 mx-auto" />
            <Bone className="h-3 w-14" />
          </div>
        </div>
      </div>
      {/* Tabs */}
      <Bone className="h-10 w-64 rounded-md" />
      {/* Two columns */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-4">
          <Bone className="h-5 w-40" />
          <Bone className="h-3 w-64" />
          <div className="rounded-lg border-2 border-dashed border-border p-8 flex flex-col items-center gap-3">
            <Bone className="size-14 rounded-lg" />
            <Bone className="h-5 w-48" />
            <Bone className="h-3 w-56" />
            <Bone className="h-10 w-28 rounded-md" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <Bone className="h-5 w-36" />
            <Bone className="h-4 w-16" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-md border border-border bg-card space-y-2">
              <div className="flex justify-between">
                <Bone className="h-5 w-12 rounded" />
                <Bone className="size-7 rounded-md" />
              </div>
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Settings skeleton */
export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="p-6 rounded-lg border border-border bg-card space-y-6">
        <div className="flex items-center gap-3">
          <Bone className="size-5 rounded" />
          <Bone className="h-5 w-16" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Bone className="h-3 w-12" />
            <Bone className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-10 w-full rounded-md" />
          </div>
        </div>
        <Bone className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
