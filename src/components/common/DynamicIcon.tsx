import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  iconType?: 'lucide' | 'url';
  customUrl?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  iconType = 'lucide',
  customUrl,
}) => {
  if (iconType === 'url' || customUrl) {
    const src = customUrl || name;
    return (
      <img
        src={src}
        alt=""
        className={`${className} object-cover rounded`}
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLImageElement).src =
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="2"%3E%3Crect width="20" height="20" x="2" y="2" rx="4"/%3E%3Cpath d="m10 15 5-3-5-3v6Z"/%3E%3C/svg%3E';
        }}
      />
    );
  }

  // Look up Lucide icon component
  const LucideIcon = (Icons as any)[name] || Icons.AppWindow;
  return <LucideIcon className={className} size={size} />;
};
