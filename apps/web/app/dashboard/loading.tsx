export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 animate-pulse rounded-lg mt-8"></div>
    </div>
  );
}
