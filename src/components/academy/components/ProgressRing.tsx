import React from 'react';

interface ProgressRingProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  color?: string; // tailwind stroke color or hex
  trackColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 80,
  strokeWidth = 7,
  label,
  showValue = true,
  color = 'stroke-blue-600 dark:stroke-blue-500',
  trackColor = 'stroke-slate-200 dark:stroke-slate-750',
  className = ''
}) => {
  const clampedValue = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="rotate-[-90deg] transition-all duration-500 ease-out"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={`${trackColor} transition-colors`}
        />
        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-700 ease-out`}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-none">
            {clampedValue}%
          </span>
          {label && (
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-tight mt-0.5">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
