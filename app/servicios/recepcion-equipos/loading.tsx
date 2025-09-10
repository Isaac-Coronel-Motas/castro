export default function Loading() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-slate-800"></div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-border"></div>
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
