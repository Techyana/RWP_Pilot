import React from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface ThemeToggleProps {
  theme: string;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <Button
      onClick={toggleTheme}
      variant="secondary"
      size="base"
      className="!p-2"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Icon name="sun" className="h-5 w-5" /> : <Icon name="moon" className="h-5 w-5" />}
    </Button>
  );
};
