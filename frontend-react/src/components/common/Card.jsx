/**
 * Card Component
 * 
 * Reusable card container with optional header and footer.
 * 
 * @param {ReactNode} children - Card content
 * @param {string} title - Optional card title
 * @param {ReactNode} header - Optional custom header content
 * @param {ReactNode} footer - Optional footer content
 * @param {string} className - Additional CSS classes
 * @param {boolean} hoverable - Add hover effect
 * @param {function} onClick - Optional click handler (makes card clickable)
 */

export default function Card({
    children,
    title,
    header,
    footer,
    className = '',
    hoverable = false,
    onClick,
}) {
    const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
    const hoverClasses = hoverable || onClick ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
    const classes = `${baseClasses} ${hoverClasses} ${className}`;

    return (
        <div className={classes} onClick={onClick}>
            {(title || header) && (
                <div className="px-6 py-4 border-b border-gray-200">
                    {header || (
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    )}
                </div>
            )}

            <div className="px-6 py-4">
                {children}
            </div>

            {footer && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {footer}
                </div>
            )}
        </div>
    );
}
