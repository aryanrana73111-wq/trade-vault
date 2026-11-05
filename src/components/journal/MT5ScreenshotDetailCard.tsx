import React, { useState } from 'react';
import { Trade } from '@/types';
import { MT5ScreenshotMetadata } from '@/types/mt5Screenshot';
import { compressImageToDataUrl } from '@/lib/avatarStorage';
import { saveMT5ScreenshotAttachment } from '@/lib/mt5ScreenshotStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { 
  Camera, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  UploadCloud, 
  Trash2, 
  X, 
  ExternalLink,
  Info,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MT5ScreenshotDetailCardProps {
  trade: Trade;
  onTradeUpdated?: (updated: Trade) => void;
  className?: string;
  isCompact?: boolean;
}

export function MT5ScreenshotDetailCard({
  trade,
  onTradeUpdated,
  className,
  isCompact = false
}: MT5ScreenshotDetailCardProps) {
  const { user } = useAuth();
  const { updateTrade } = useData();

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const screenshotUrl = trade.mt5ScreenshotUrl || trade.screenshot;
  const metadata: MT5ScreenshotMetadata | undefined = trade.mt5ScreenshotMetadata;

  if (!screenshotUrl) {
    return null;
  }

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    if (!screenshotUrl) return;
    const a = document.createElement('a');
    a.href = screenshotUrl;
    a.download = metadata?.fileName || `mt5_trade_${trade.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReplaceFile = async (file: File) => {
    if (!file || !user) return;
    setIsReplacing(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 1600, 1600, 0.90);
      const saved = await saveMT5ScreenshotAttachment({
        uid: user.uid,
        tradeId: trade.id,
        dataUrl: compressedDataUrl,
        fileName: file.name || 'mt5_screenshot.png',
        mimeType: file.type || 'image/jpeg',
        rawSymbol: trade.rawSymbol,
        ticketId: trade.mt5TicketId || trade.externalTradeId
      });

      const updates = {
        mt5ScreenshotUrl: saved.url,
        mt5ScreenshotMetadata: saved.metadata,
        screenshot: saved.url,
        entryScreenshot: saved.url
      };

      await updateTrade(trade.id, updates);
      if (onTradeUpdated) {
        onTradeUpdated({ ...trade, ...updates });
      }
    } catch (err) {
      console.error('Failed to replace MT5 screenshot:', err);
      alert('Could not update screenshot image.');
    } finally {
      setIsReplacing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the MT5 screenshot associated with this trade?')) {
      return;
    }
    setIsDeleting(true);
    try {
      const updates = {
        mt5ScreenshotUrl: undefined,
        mt5ScreenshotMetadata: undefined
      };
      await updateTrade(trade.id, updates);
      if (onTradeUpdated) {
        onTradeUpdated({ ...trade, ...updates });
      }
    } catch (err) {
      console.error('Failed to delete screenshot:', err);
      alert('Failed to remove screenshot.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={cn("border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-4 bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-xs relative overflow-hidden", className)}>
      {/* Decorative accent top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 flex items-center justify-center font-bold">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <span>MT5 Screenshot</span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified
              </span>
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom / Full View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Download screenshot"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <label className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Replace screenshot">
            <UploadCloud className="w-3.5 h-3.5" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={isReplacing}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleReplaceFile(f);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete screenshot"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Preview Container */}
      <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-950/10 dark:bg-slate-950 group">
        <img
          src={screenshotUrl}
          alt={`MT5 Screenshot for ${trade.market}`}
          className="w-full h-auto object-contain max-h-[320px] mx-auto cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
          onClick={() => setIsZoomOpen(true)}
          referrerPolicy="no-referrer"
        />

        {/* Hover Click to Zoom overlay */}
        <div 
          onClick={() => setIsZoomOpen(true)}
          className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <div className="px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Click to Zoom</span>
          </div>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Broker Symbol</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
            {trade.rawSymbol || metadata?.rawSymbol || trade.market}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">MT5 Ticket / ID</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
            {trade.mt5TicketId || metadata?.ticketId || trade.externalTradeId || 'N/A'}
          </span>
        </div>

        {metadata?.uploadedAt && (
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Imported</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">
              {format(new Date(metadata.uploadedAt), 'MMM dd, HH:mm')}
            </span>
          </div>
        )}

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Source</span>
          <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>MT5 Vision OCR</span>
          </span>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md animate-in fade-in duration-150 p-4"
          onClick={() => {
            setIsZoomOpen(false);
            setZoomLevel(1);
          }}
        >
          {/* Top toolbar */}
          <div 
            className="flex items-center justify-between text-white pb-3 border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm">
                MT5 Screenshot: {trade.rawSymbol || trade.market} {trade.direction}
              </span>
              {trade.mt5TicketId && (
                <span className="text-xs text-slate-400 font-mono">
                  (Ticket #{trade.mt5TicketId})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1 px-2"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-xs flex items-center gap-1 px-3 ml-2"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsZoomOpen(false);
                  setZoomLevel(1);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable Viewport */}
          <div 
            className="flex-1 overflow-auto flex items-center justify-center p-4 cursor-grab"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={screenshotUrl}
              alt="Zoomed MT5 Screenshot"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.15s ease-out'
              }}
              className="max-w-full max-h-[85vh] object-contain origin-center shadow-2xl rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
