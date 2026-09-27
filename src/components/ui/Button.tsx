import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 select-none shrink-0 cursor-pointer active:scale-[0.985]',
          {
            'bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-500/20 active:bg-blue-700': variant === 'primary',
            'bg-slate-100/85 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 hover:bg-slate-200/85 dark:hover:bg-slate-800/90 shadow-xs': variant === 'secondary',
            'border border-slate-200/80 dark:border-white/[0.12] bg-white/70 dark:bg-slate-900/50 backdrop-blur-md hover:bg-slate-100/80 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 shadow-xs': variant === 'outline',
            'hover:bg-slate-100/80 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 backdrop-blur-xs': variant === 'ghost',
            'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-500/20 active:bg-rose-700': variant === 'danger',
            'h-9 px-3 text-xs': size === 'sm',
            'h-10 px-4 py-2 text-sm': size === 'md',
            'h-11 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
