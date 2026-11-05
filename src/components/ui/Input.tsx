import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-xl border border-slate-200/85 dark:border-white/[0.1] bg-white/80 dark:bg-slate-900/65 backdrop-blur-md px-3 py-2 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/35 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-xs',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-xl border border-slate-200/85 dark:border-white/[0.1] bg-white/80 dark:bg-slate-900/65 backdrop-blur-md px-3 py-2 text-sm text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/35 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-xs',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-200', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-slate-200/85 dark:border-white/[0.1] bg-white/80 dark:bg-slate-900/65 backdrop-blur-md px-3 py-2 text-sm text-[var(--input-text)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/35 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-xs resize-y',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'subtle';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-200 text-slate-900 dark:text-slate-100 overflow-hidden',
        variant === 'glass' && 'bg-white/80 dark:bg-black/80 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.55)] hover:border-slate-300/90 dark:hover:border-blue-500/30',
        variant === 'solid' && 'bg-white dark:bg-black border border-slate-200 dark:border-white/[0.08] shadow-sm',
        variant === 'subtle' && 'bg-slate-50/70 dark:bg-black/50 backdrop-blur-sm border border-slate-200/60 dark:border-white/[0.05]',
        interactive && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'success' | 'danger' | 'warning' | 'neutral' }>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        {
          'border-blue-200/70 dark:border-blue-500/30 bg-blue-50/85 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300': variant === 'default',
          'border-emerald-200/70 dark:border-emerald-500/30 bg-emerald-50/85 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300': variant === 'success',
          'border-rose-200/70 dark:border-rose-500/30 bg-rose-50/85 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300': variant === 'danger',
          'border-amber-200/70 dark:border-amber-500/30 bg-amber-50/85 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300': variant === 'warning',
          'border-slate-200/80 dark:border-white/[0.08] bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300': variant === 'neutral',
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';
