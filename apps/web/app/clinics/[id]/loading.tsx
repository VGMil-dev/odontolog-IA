export default function ClinicWorkspaceLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="space-x-2 flex">
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border rounded-lg p-4 h-24 bg-gray-200 animate-pulse"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 animate-pulse rounded-lg mt-8"></div>
    </div>
  );
}
