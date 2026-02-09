export function ConversationSkeleton() {
  return (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors animate-pulse">
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            {/* Name skeleton */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            {/* Time skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
          </div>
          {/* Message preview skeleton */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
