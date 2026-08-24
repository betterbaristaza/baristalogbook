import React from 'react';

interface BrewprintWordmarkProps {
  className?: string;
}

export const BrewprintWordmark: React.FC<BrewprintWordmarkProps> = ({
  className = '',
}) => {
  return (
    <img
      src="/brand/brewprint-wordmark.svg"
      alt="BREWPRINT"
      className={className}
    />
  );
};

interface BrewprintMarkProps {
  className?: string;
}

export const BrewprintMark: React.FC<BrewprintMarkProps> = ({
  className = '',
}) => {
  return (
    <img
      src="/brand/brewprint-mark.svg"
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
};

interface BrewprintIconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

export const BrewprintIcon: React.FC<BrewprintIconProps> = ({
  name,
  size = 24,
  className = '',
  alt = '',
}) => {
  return (
    <img
      src={`/brand/icons/${name}.svg`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  );
};