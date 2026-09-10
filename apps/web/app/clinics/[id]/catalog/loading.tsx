export default function CatalogLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="h-10 w-full md:w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
      <div className="h-64 bg-gray-200 animate-pulse rounded-lg mt-8"></div>
    </div>
  );
}
