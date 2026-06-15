import React from 'react';
import { FiFilm } from 'react-icons/fi';
import { AppIcons, GenreIcons } from '../constants/iconMappings';

// Icon component wrapper for consistent styling
export const Icon = ({ 
  name, 
  size = 20, 
  className = "", 
  style = {},
  onClick,
  ...props 
}) => {
  const IconComponent = AppIcons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in AppIcons`);
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      className={`inline-block ${className}`}
      style={style}
      onClick={onClick}
      {...props}
    />
  );
};

// Genre icon component
export const GenreIcon = ({ 
  genre, 
  size = 20, 
  className = "", 
  style = {},
  ...props 
}) => {
  const IconComponent = GenreIcons[genre];
  
  if (!IconComponent) {
    // Fallback to film icon
    return <FiFilm size={size} className={className} style={style} {...props} />;
  }
  
  return (
    <IconComponent
      size={size}
      className={`inline-block ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Icon;