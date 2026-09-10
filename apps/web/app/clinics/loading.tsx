export default function ClinicsLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="h-64 bg-gray-200 animate-pulse rounded-lg mt-8"></div>
    </div>
  );
}
