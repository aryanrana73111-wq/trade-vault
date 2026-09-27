import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowDown, ArrowRight } from 'lucide-react';

interface CinematicThirdSectionProps {
  onExplore: () => void;
}

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4";

export function CinematicThirdSection({ onExplore }: CinematicThirdSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Pre-load slightly before it comes into view
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden w-full h-[65vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] flex items-center justify-start text-left"
    >
      {/* 1. Video Background */}
      {isVisible && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={VIDEO_URL}
        />
      )}

      {/* Fallback before load */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 bg-slate-950 z-[-1]" />
      )}

      {/* 2. Ambient Glow (Premium, non-neon, subtle bloom) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen opacity-60">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* 3. Cinematic Overlay */}
      {/* Gradient fade from top and bottom for smooth section transitions, vignette for text readability */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent sm:from-slate-950/90 sm:via-slate-950/30 sm:to-transparent" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/90" />

      {/* 4. Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col items-center sm:items-start text-center sm:text-left mt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[600px] w-full"
        >
          <span className="inline-block text-xs uppercase font-bold tracking-[0.2em] text-cyan-400 mb-4 drop-shadow-md">
            TRADEVAULT
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
            Turn Every Trade<br className="hidden sm:block" /> Into Knowledge.
          </h2>
          <p className="text-base sm:text-lg text-slate-200 mb-10 leading-relaxed drop-shadow-md font-medium">
            Capture your decisions, study your behavior, measure your performance and continuously improve your trading process.
          </p>

          {/* 5. CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-white border border-slate-600/50 hover:border-cyan-400/50 font-semibold text-sm sm:text-base shadow-xl shadow-black/40 backdrop-blur-md transition-all cursor-pointer ring-1 ring-white/10 text-center"
            >
              Explore TradeVault
            </button>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              <span className="relative z-10">Enter TradeVault</span>
              <ArrowRight className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Optional Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        onClick={onExplore}
      >
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-300">Discover the workflow</span>
        <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />
      </motion.div>
    </section>
  );
}
