export default function Card({
  children,
  className = '',
  gradient = false,
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-cyan-500',
  hover = true,
  onClick,
}) {
  const baseClasses =
    'rounded-xl p-6 border border-gray-200 dark:border-dark-700 transition-all duration-300';

  const hoverClasses = hover
    ? 'hover:shadow-card-hover dark:hover:shadow-lg hover:-translate-y-1 cursor-pointer'
    : '';

  const gradientClasses = gradient
    ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg`
    : 'bg-white dark:bg-dark-800 shadow-card dark:shadow-md';

  return (
    <div
      className={`${baseClasses} ${gradientClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
