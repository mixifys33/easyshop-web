export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Image skeleton */}
            <div className="p-4 md:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Right: Details skeleton */}
            <div className="p-4 md:p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              
              <div className="p-4 bg-gray-100 rounded-xl">
                <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
