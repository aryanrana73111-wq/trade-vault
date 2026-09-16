import React from 'react';
import { ExternalLink, Video, BookOpen, AlertCircle } from 'lucide-react';
import { TrustedResource } from '@/data/academy/trustedResources';

interface ResourceCardProps {
  resource: TrustedResource;
  className?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, className = '' }) => {
  const isVideo = resource.type === 'video';
  const hasValidUrl = Boolean(resource.url && resource.url.trim().length > 0);

  return (
    <div
      id={`resource-card-${resource.id}`}
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700/60 transition-all flex flex-col justify-between ${className}`}
    >
      <div className="space-y-2">
        {/* Header tag */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isVideo ? (
              <>
                <Video className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>📺 Recommended Video</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>🌐 Recommended Reading</span>
              </>
            )}
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {resource.tierLabel}
          </span>
        </div>

        {/* Title and Source */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {resource.title}
          </h4>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
            {resource.source} • <span className="text-slate-500">{resource.durationOrReadTime}</span>
          </p>
        </div>

        {/* Relevance note */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
          {resource.whyRelevant}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Recommended educational source
        </span>

        {hasValidUrl ? (
          <a
            id={`resource-link-${resource.id}`}
            href={resource.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors"
          >
            <span>{isVideo ? 'Watch on YouTube' : 'Open Source'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Resource unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
};
