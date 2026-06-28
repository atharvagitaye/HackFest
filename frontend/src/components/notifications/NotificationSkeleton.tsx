const NotificationSkeleton = () => (
  <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-muted shrink-0 mt-0.5" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-1/3" />
    </div>
  </div>
);

export const NotificationSkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="divide-y divide-border">
    {Array.from({ length: count }).map((_, i) => (
      <NotificationSkeleton key={i} />
    ))}
  </div>
);

export default NotificationSkeleton;
