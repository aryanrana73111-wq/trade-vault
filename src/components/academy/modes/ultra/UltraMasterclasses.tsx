import React, { useState } from 'react';
import { BookOpen, Clock, Activity, Target } from 'lucide-react';
import { ULTRA_MASTERCLASSES } from '@/data/academy/ultraCurriculumData';

export const UltraMasterclasses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <span>Advanced Masterclasses</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
          Deep-dive institutional concepts bridging theory, quantitative validation, and practical execution. Each masterclass contains multiple sub-lessons, calculators, and a required practical assignment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ULTRA_MASTERCLASSES.map((mc) => (
          <div key={mc.id} className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors flex flex-col justify-between group cursor-pointer h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                  {mc.category}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {mc.id}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                  {mc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {mc.description}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{mc.lessonsCount} Modules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{mc.durationMinutes}m</span>
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Prerequisite:</span>
                {mc.prerequisite}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
