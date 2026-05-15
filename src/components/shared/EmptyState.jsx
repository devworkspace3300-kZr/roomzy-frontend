import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ icon: Icon = FiInbox, title = 'No results found', description = 'Try adjusting your filters or search terms.', action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                <Icon size={28} className="text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-sm text-text-muted max-w-md mb-6">{description}</p>
            {action && action}
        </div>
    );
}
