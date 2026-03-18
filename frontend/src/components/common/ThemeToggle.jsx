import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`theme-toggle-pv ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
};

export default ThemeToggle;
