const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-obsidian-500 border-t-neon-blue ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-obsidian-950">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 font-body text-sm">Loading...</p>
    </div>
  </div>
);

export default Spinner;
