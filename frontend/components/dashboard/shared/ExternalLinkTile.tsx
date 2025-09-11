import React from 'react';
import { Icon, IconName } from '../../shared/Icon';

interface ExternalLinkTileProps {
  title: string;
  href: string;
  icon: IconName;
}

export const ExternalLinkTile: React.FC<ExternalLinkTileProps> = ({ title, href, icon }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
    >
      <div className="p-3 bg-brand-light dark:bg-brand-primary/20 rounded-full mb-3">
          <Icon name={icon} className="h-6 w-6 text-brand-primary dark:text-brand-tertiary" />
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-tertiary transition-colors">
        {title}
      </h3>
    </a>
  );
};
