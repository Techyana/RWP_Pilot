import React from 'react';
import { Icon, IconName } from '../../shared/Icon';

interface DashboardCardProps {
    title: string;
    icon: IconName;
    children: React.ReactNode;
    className?: string;
    headerContent?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, children, className, headerContent }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col ${className}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3">
                    <Icon name={icon} className="h-6 w-6 text-brand-primary dark:text-brand-tertiary" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                </div>
                {headerContent && <div>{headerContent}</div>}
            </div>
            <div className="p-4 flex-grow">
                {children}
            </div>
        </div>
    );
};