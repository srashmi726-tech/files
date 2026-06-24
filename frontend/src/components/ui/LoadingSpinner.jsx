const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export default function LoadingSpinner({ size = 'md' }) {
  return (
    <div
      className={`${sizes[size]} rounded-full border-2 border-white/20 border-t-brand-pink animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
