import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating = 0, size = 16, showValue = true, interactive = false, onChange }) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onChange?.(star)}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <FiStar
                        size={size}
                        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                </button>
            ))}
            {showValue && (
                <span className="ml-1 text-sm font-medium text-text-secondary">{rating.toFixed(1)}</span>
            )}
        </div>
    );
}
