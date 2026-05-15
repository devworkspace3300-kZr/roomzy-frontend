export default function SkeletonLoader({ className = '', count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`animate-shimmer rounded-2xl ${className}`} />
            ))}
        </>
    );
}

export function HostelCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-border-light">
            <div className="aspect-[4/3] animate-shimmer" />
            <div className="p-4 space-y-3">
                <div className="h-5 animate-shimmer rounded-lg w-3/4" />
                <div className="h-4 animate-shimmer rounded-lg w-1/2" />
                <div className="flex gap-2">
                    <div className="h-6 w-16 animate-shimmer rounded-lg" />
                    <div className="h-6 w-20 animate-shimmer rounded-lg" />
                </div>
            </div>
        </div>
    );
}
