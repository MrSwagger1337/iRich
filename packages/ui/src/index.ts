/**
 * @irich/ui
 * Headless and styled UI primitives for iRich editor interface.
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  style,
  ...props
}) => {
  return React.createElement(
    'button',
    {
      'data-variant': variant,
      style: {
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: '6px',
        ...style,
      },
      ...props,
    },
    children,
  );
};

export interface ToolbarProps {
  children?: React.ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className }) => {
  return React.createElement(
    'div',
    {
      role: 'toolbar',
      className,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      },
    },
    children,
  );
};
