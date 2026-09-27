import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  BarChart2, 
  Calculator, 
  Target, 
  BookOpenCheck, 
  Sparkles, 
  Compass, 
  Swords, 
  Newspaper, 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Shield, 
  Lock, 
  Activity, 
  Zap, 
  ChevronRight, 
  Menu, 
  X, 
  User, 
  PlusCircle, 
  Layers, 
  LineChart, 
  Check, 
  Smartphone,
  TrendingUp,
  Sliders,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAvatar } from '@/components/UserAvatar';
import { CinematicThirdSection } from '@/components/home/CinematicThirdSection';

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'dashboard' | 'journal' | 'analytics' | 'calculator' | 'strategies'>('dashboard');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Extract first name for personalized greeting
  const firstName = profile?.fullName
    ? profile.fullName.trim().split(' ')[0]
    : user?.displayName
    ? user.displayName.trim().split(' ')[0]
    : '';

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isProfileIncomplete = user && (!profile?.tradingStyle || !profile?.fullName);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col overflow-x-hidden">
      {/* 1. Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-white/10 backdrop-blur-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/home" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform shrink-0 border border-white/30">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans drop-shadow-md">TradeVault</span>
              <span className="text-[10px] text-cyan-200/80 font-medium tracking-wide hidden sm:block drop-shadow-sm">OPERATING SYSTEM</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-200">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="hover:text-white transition-colors cursor-pointer drop-shadow-sm"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('philosophy')} 
              className="hover:text-white transition-colors cursor-pointer drop-shadow-sm"
            >
              Philosophy
            </button>
            <button 
              onClick={() => scrollToSection('experience')} 
              className="hover:text-cyan-300 transition-colors cursor-pointer drop-shadow-sm flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Experience</span>
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-white transition-colors cursor-pointer drop-shadow-sm"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-white transition-colors cursor-pointer drop-shadow-sm"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('preview')} 
              className="hover:text-white transition-colors cursor-pointer drop-shadow-sm"
            >
              Preview
            </button>
            <Link 
              to="/news" 
              className="hover:text-cyan-300 text-slate-200 flex items-center gap-1 transition-colors drop-shadow-sm"
            >
              News
            </Link>
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 border border-white/20 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/settings?tab=profile')}
                  className="p-1 rounded-full hover:ring-2 hover:ring-cyan-400 transition-all"
                  title="Profile Settings"
                >
                  <UserAvatar avatarUrl={profile?.avatarUrl} size="sm" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors drop-shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/30 border border-white/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-5 space-y-3"
            >
              <button 
                onClick={() => scrollToSection('hero')} 
                className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-blue-400"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('philosophy')} 
                className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-blue-400"
              >
                Philosophy
              </button>
              <button 
                onClick={() => scrollToSection('experience')} 
                className="block w-full text-left py-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>The Experience</span>
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-blue-400"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-blue-400"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('preview')} 
                className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-blue-400"
              >
                Inside TradeVault
              </button>
              <Link 
                to="/news" 
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-blue-400"
              >
                Market News
              </Link>

              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                {user ? (
                  <>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center"
                    >
                      Enter TradeVault Dashboard
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/settings?tab=profile'); }}
                      className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold text-center"
                    >
                      My Profile & Settings
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section with Video Background & Cinematic Glow Treatment */}
      <section id="hero" className="relative pt-24 sm:pt-32 pb-20 sm:pb-32 min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* === LAYER 0: Edge Glow & Perimeter Bloom (Soft radiant ambient light around the hero) === */}
        <div className="video-glow-layer pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Top Edge Specular Hairline Flare */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_24px_rgba(56,189,248,0.9)]" />
          
          {/* Subtle Top Edge Glow Softly Radiating Into Header */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cyan-500/10 via-sky-500/5 to-transparent blur-xl" />

          {/* Deep Ambient Bloom Center Pool (behind video) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-5xl h-[560px] bg-gradient-to-r from-blue-600/20 via-cyan-500/25 to-sky-500/20 blur-[90px] sm:blur-[140px] rounded-full mix-blend-screen opacity-50 sm:opacity-60 animate-edge-glow" />

          {/* Soft Bottom Edge Blend into Next Section */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        </div>

        {/* === LAYER 1: Existing Video with Smooth Fade-in & Non-Destructive Fallback === */}
        {!videoError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none filter brightness-110 contrast-105 saturate-110 transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
              type="video/mp4"
            />
          </video>
        ) : null}

        {/* Fallback & Pre-Load Dark Fintech Canvas (Prevents white flash / broken appearance) */}
        {(!isVideoLoaded || videoError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 z-0 pointer-events-none transition-opacity duration-700">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* === LAYER 2A: Cinematic Overlay & Vignette (top transparent, center subtle, bottom darker) === */}
        <div className="cinematic-overlay absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/20 to-slate-950/85 z-[1] pointer-events-none" />

        {/* Subtle Vignette: center clear, outer boundary softly shaded */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,6,23,0.55)_100%)] z-[1] pointer-events-none" />

        {/* === LAYER 2B: Ambient Light Layer with Moving Light Sweep === */}
        <div className="ambient-light-layer absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {/* Extremely Subtle Animated Ambient Light Sweep (slow, continuous 16s cycle, GPU-friendly, respects prefers-reduced-motion) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-6xl h-[520px] bg-gradient-to-tr from-cyan-500/15 via-sky-400/10 to-blue-600/15 blur-[75px] sm:blur-[120px] rounded-full mix-blend-screen opacity-35 sm:opacity-50 animate-ambient-sweep" />

          {/* Top Specular Horizon Light Bloom */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-28 bg-gradient-to-b from-cyan-400/15 to-transparent blur-[60px] rounded-full mix-blend-screen animate-edge-glow" />

          {/* Micro Specular Accent (Desktop/Tablet) */}
          <div className="absolute top-1/4 left-1/3 w-72 h-44 bg-sky-400/10 blur-[80px] rounded-full mix-blend-screen hidden sm:block" />
        </div>

        {/* === LAYER 3: Hero Content (Dimensional Text, Integrated Glass Cards & Primary CTA Glow) === */}
        <div className="hero-content relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Personalized Luminous Welcome Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-cyan-400/40 text-cyan-200 text-xs sm:text-sm font-semibold mb-6 shadow-xl shadow-cyan-500/15 ring-1 ring-white/20"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
            <span className="drop-shadow-sm">{firstName ? `Welcome back, ${firstName}` : 'Evidence-First Trading OS'}</span>
          </motion.div>

          {/* Main Headline with Shiny Radiant Gradient and Subtle Ambient Shadow */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 leading-[1.1] drop-shadow-[0_4px_32px_rgba(0,0,0,0.95)]"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-blue-400 drop-shadow-[0_0_35px_rgba(56,189,248,0.5)]">TradeVault</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl font-semibold text-white mb-4 max-w-3xl mx-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]"
          >
            Your evidence-first trading operating system.
          </motion.p>

          {/* Supporting Text */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm sm:text-base text-slate-100 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
          >
            Journal every trade. Understand your behavior. Measure your performance. Build better trading processes.
          </motion.p>

          {/* CTA Buttons with Subtle Premium Glow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto"
          >
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-400/50 border border-white/40 transition-all flex items-center justify-center gap-2 cursor-pointer group relative overflow-hidden ring-1 ring-cyan-300/30"
            >
              {/* Subtle light reflection sweep on hover */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              <span className="relative z-10 drop-shadow-sm">Enter TradeVault</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform drop-shadow-sm" />
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 text-white border border-slate-700/80 hover:border-cyan-400/50 font-semibold text-sm sm:text-base shadow-lg shadow-black/40 backdrop-blur-md transition-all cursor-pointer ring-1 ring-white/10"
            >
              Explore Features
            </button>
          </motion.div>

          {/* Small Trust Line */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 text-xs text-cyan-200/90 flex items-center justify-center gap-2 drop-shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
            <span>Built for traders who value process over prediction.</span>
          </motion.p>
        </div>
      </section>

      {/* 3. Welcome Back & Quick Start Station (Interactive Shortcuts) */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <span>{firstName ? `Continue Trading, ${firstName}` : 'Quick Start Station'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Immediate navigation to key tools across your trading operating system.
              </p>
            </div>

            {isProfileIncomplete && (
              <button
                onClick={() => navigate('/settings?tab=profile')}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-semibold hover:bg-amber-900/80 transition-colors flex items-center gap-1.5"
              >
                <span>Complete Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            <QuickActionCard 
              title="Add Trade" 
              desc="Log execution" 
              icon={<PlusCircle className="w-4 h-4 text-blue-400" />} 
              onClick={() => navigate('/add')} 
              highlight 
            />
            <QuickActionCard 
              title="Dashboard" 
              desc="Full overview" 
              icon={<Activity className="w-4 h-4 text-sky-400" />} 
              onClick={() => navigate('/dashboard')} 
            />
            <QuickActionCard 
              title="Calculator" 
              desc="Position sizing" 
              icon={<Calculator className="w-4 h-4 text-indigo-400" />} 
              onClick={() => navigate('/calculator')} 
            />
            <QuickActionCard 
              title="Journal" 
              desc="Trade reviews" 
              icon={<BookOpen className="w-4 h-4 text-emerald-400" />} 
              onClick={() => navigate('/journal')} 
            />
            <QuickActionCard 
              title="Analytics" 
              desc="Quant equity" 
              icon={<BarChart2 className="w-4 h-4 text-amber-400" />} 
              onClick={() => navigate('/analytics')} 
            />
            <QuickActionCard 
              title="Strategies" 
              desc="Playbook lab" 
              icon={<Target className="w-4 h-4 text-purple-400" />} 
              onClick={() => navigate('/strategies')} 
            />
            <QuickActionCard 
              title="Market News" 
              desc="Catalyst radar" 
              icon={<Newspaper className="w-4 h-4 text-teal-400" />} 
              onClick={() => navigate('/news')} 
            />
          </div>
        </div>
      </section>

      {/* 4. The TradeVault Philosophy (Value & Core Principles) */}
      <section id="philosophy" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/80">
              Core Principles
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4 tracking-tight">
              Built Around Evidence, Not Hype.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
              Trading success is not a secret trick sold in chatrooms. It is an iterative engineering process of managing risk, recording decisions, identifying psychological pitfalls, and optimizing personal execution over time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Process over prediction</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Evidence over assumptions</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Risk management over profit chasing</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Consistency over excitement</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 sm:col-span-2">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Self-review over guru claims</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 3: Cinematic Video */}
      <CinematicThirdSection onExplore={() => scrollToSection('how-it-works')} />

      {/* 6. How TradeVault Works (Process Flow) */}
      <section id="how-it-works" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/60">
            Systematic Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
            How TradeVault Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Professional trading is not about predicting price candles. It is a continuous feedback loop connecting every decision to structured evidence.
          </p>
        </div>

        {/* Interactive Step Workflow */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 relative">
          <WorkflowStep 
            number="1"
            title="PLAN"
            desc="Risk Calculator, Strategy Playbook & Rules"
            route="/calculator"
            badge="Pre-Trade"
          />
          <WorkflowStep 
            number="2"
            title="EXECUTE"
            desc="Structured Entry, Exact Risk & Position Sizing"
            route="/add"
            badge="Live Market"
          />
          <WorkflowStep 
            number="3"
            title="JOURNAL"
            desc="Screenshots, Emotional State & Execution Context"
            route="/journal"
            badge="Recording"
          />
          <WorkflowStep 
            number="4"
            title="REVIEW"
            desc="Trade History, Outcome Attribution & Mistakes"
            route="/journal"
            badge="Post-Trade"
          />
          <WorkflowStep 
            number="5"
            title="ANALYZE"
            desc="Equity Curves, R-Multiples & Session Heatmaps"
            route="/analytics"
            badge="Statistics"
          />
          <WorkflowStep 
            number="6"
            title="RULES"
            desc="Discipline Rules Matrix & Execution Checklists"
            route="/learning-rules"
            badge="Discipline"
          />
          <WorkflowStep 
            number="7"
            title="COMPETE"
            desc="Live Competition Arena & Verified Performance"
            route="/arena"
            badge="Performance"
          />
        </div>
      </section>

      {/* 5. Complete Feature Showcase */}
      <section id="features" className="py-20 sm:py-28 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/60">
              Integrated Suite
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-4 tracking-tight">
              Everything you need to understand your trading.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
              TradeVault connects your execution, risk management, strategies, rules, learning and analytics into one trading workflow.
            </p>
          </div>

          {/* 12 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {/* 1. Trading Journal */}
            <FeatureCard 
              icon={<BookOpen className="w-6 h-6 text-blue-400" />}
              title="Trading Journal"
              desc="Capture every trade with structured execution, risk, screenshots and post-trade learning."
              bullets={['Rich Execution Metrics', 'Chart Screenshots', 'Post-Trade Mistake Tagging', 'Trade Notes & Review']}
              buttonText="Explore Journal"
              route="/journal"
            />

            {/* 2. Advanced Analytics */}
            <FeatureCard 
              icon={<BarChart2 className="w-6 h-6 text-sky-400" />}
              title="Advanced Analytics"
              desc="Turn your trading history into measurable evidence."
              bullets={['Advance Equity Curve', 'R-Multiple Buckets', 'Drawdown Underwater Analysis', 'Session & Heatmap Matrices']}
              buttonText="Explore Analytics"
              route="/analytics"
            />

            {/* 3. Risk Calculator */}
            <FeatureCard 
              icon={<Calculator className="w-6 h-6 text-indigo-400" />}
              title="Risk Calculator"
              desc="Calculate position size before you put capital at risk."
              bullets={['Forex, Gold & Crypto Presets', 'Account Risk Percentage', 'Exact Stop Loss Units', 'Real-Time R:R Sizing']}
              buttonText="Calculate Risk"
              route="/calculator"
            />

            {/* 4. Strategy Lab */}
            <FeatureCard 
              icon={<Target className="w-6 h-6 text-purple-400" />}
              title="Strategy Lab"
              desc="Build, document and evaluate your trading strategies using your own historical data."
              bullets={['Setup Definition & Checklist', 'Win-Rate by Strategy', 'Profit-Factor Attribution', 'Playbook Management']}
              buttonText="Explore Strategies"
              route="/strategies"
            />

            {/* 5. Competition Arena */}
            <FeatureCard 
              icon={<Swords className="w-6 h-6 text-rose-400" />}
              title="Competition Arena"
              desc="Measure your trading discipline and verified track record against traders worldwide."
              bullets={['Leaderboard Rankings', 'Custom Trading Contests', 'Live Performance Feeds', 'Fair Metric Normalization']}
              buttonText="Enter Arena"
              route="/arena"
            />

            {/* 6. Learning & Rules */}
            <FeatureCard 
              icon={<BookOpenCheck className="w-6 h-6 text-amber-400" />}
              title="Learning & Rules"
              desc="Turn trading experience into structured knowledge and repeatable rules."
              bullets={['Daily Learning Journal', 'Pinned Discipline Rules', 'Rule Adherence Checks', 'Continuous Feedback Loops']}
              buttonText="Start Learning"
              route="/learning-rules"
            />

            {/* 7. Macro Market Intelligence */}
            <FeatureCard 
              icon={<Newspaper className="w-6 h-6 text-emerald-400" />}
              title="News Intelligence"
              desc="High-impact macroeconomic catalysts and central bank releases synced to your journal."
              bullets={['Live Economic Calendar', 'Central Bank Policy Trackers', 'Catalyst Volatility Impact', 'Trade-Linked News Tags']}
              buttonText="Explore Market News"
              route="/news"
            />

            {/* 8. Command Center */}
            <FeatureCard 
              icon={<Compass className="w-6 h-6 text-cyan-400" />}
              title="Command Center"
              desc="See what matters across your trading workflow from one centralized place."
              bullets={['Current Market Status', 'High-Priority Attention Items', 'Pinned Active Playbooks', 'Immediate Action Station']}
              buttonText="Open Command Center"
              route="/command-center"
            />

            {/* 9. Competition Arena */}
            <FeatureCard 
              icon={<Swords className="w-6 h-6 text-orange-400" />}
              title="Competition Arena"
              desc="Compete using structured rules, risk limits and competition-scoped trading data."
              bullets={['Live Leaderboards', 'Discipline Point Scoring', 'Scoped Risk Guardrails', 'Fair Rule Verification']}
              buttonText="Enter Arena"
              route="/arena"
            />

            {/* 10. Market News */}
            <FeatureCard 
              icon={<Newspaper className="w-6 h-6 text-blue-400" />}
              title="Market News Intelligence"
              desc="Follow market-moving information and connect macroeconomic news with your trading research."
              bullets={['High-Impact News Radar', 'Economic Event Calendar', 'Historical Volatility Impact', 'Trade-to-News Correlation']}
              buttonText="View News"
              route="/news"
            />

            {/* 12. PWA / Cross-Device */}
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6 text-indigo-400" />}
              title="PWA & Cross-Device Access"
              desc="Use TradeVault across supported devices with one synchronized account."
              bullets={['Installable on iOS & Android', 'Desktop & Tablet Responsive', 'Fast Offline Cache Support', 'Real-Time Cloud Sync']}
              buttonText="Open Dashboard"
              route="/dashboard"
            />
          </div>
        </div>
      </section>

      {/* 6. Product Experience Section (Continuous Workflow Model) */}
      <section className="py-16 sm:py-24 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            The Continuous Operating Loop
          </h3>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-10">
            Every trade flows naturally through your system, turning individual executions into long-term strategic compounding.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold max-w-4xl mx-auto">
            <span className="px-3.5 py-2 rounded-xl bg-blue-950 border border-blue-700 text-blue-300">TRADE</span>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <span className="px-3.5 py-2 rounded-xl bg-purple-950 border border-purple-700 text-purple-300">PSYCHOLOGY</span>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <span className="px-3.5 py-2 rounded-xl bg-amber-950 border border-amber-700 text-amber-300">LEARNING</span>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <span className="px-3.5 py-2 rounded-xl bg-rose-950 border border-rose-700 text-rose-300">RULE</span>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <span className="px-3.5 py-2 rounded-xl bg-sky-950 border border-sky-700 text-sky-300">STRATEGY</span>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <span className="px-3.5 py-2 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-300">ANALYTICS</span>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <span className="px-3.5 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300">AI INSIGHT</span>
          </div>
        </div>
      </section>

      {/* 8. Inside TradeVault Visual Product Preview */}
      <section id="preview" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/60">
            Inside TradeVault
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
            Designed for Clarity, Built for Performance
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Switch between modules to inspect the real interface components powering your trading workspace.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'journal', label: 'Journal', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'calculator', label: 'Risk Calculator', icon: Calculator },
            { id: 'strategies', label: 'Strategies', icon: Target },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activePreviewTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Preview Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activePreviewTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">Institutional Dashboard Overview</h4>
                    <p className="text-xs text-slate-400">Consolidated real-time KPIs, global market session status, and advance equity curve.</p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <span>Open Dashboard</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Net Profit/Loss</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">+$4,850.00</div>
                    <span className="text-[10px] text-slate-500">Live account closed</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Win Rate</span>
                    <div className="text-xl font-bold text-white mt-1">68.4%</div>
                    <span className="text-[10px] text-slate-500">38 of 55 trades</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Profit Factor</span>
                    <div className="text-xl font-bold text-blue-400 mt-1">2.45</div>
                    <span className="text-[10px] text-slate-500">Gross wins / losses</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Sharpe Ratio</span>
                    <div className="text-xl font-bold text-indigo-400 mt-1">2.18</div>
                    <span className="text-[10px] text-slate-500">Risk-adjusted return</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activePreviewTab === 'journal' && (
              <motion.div 
                key="journal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">Execution Journal & Trade Review</h4>
                    <p className="text-xs text-slate-400">Detailed recording of entry, stop loss, take profit, charts, and psychological discipline.</p>
                  </div>
                  <button
                    onClick={() => navigate('/journal')}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <span>Open Journal</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">BUY</span>
                      <span className="font-semibold text-white">XAU/USD (Gold)</span>
                      <span className="text-slate-400 hidden sm:inline">• London Open Expansion</span>
                    </div>
                    <span className="font-bold text-emerald-400">+$420.00 (+2.8R)</span>
                  </div>
                  <p className="text-xs text-slate-300">Clean expansion out of London consolidation. Entry executed strictly on 5m order block retest. No emotional interference.</p>
                </div>
              </motion.div>
            )}

            {activePreviewTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">Quantitative Analytics & Consistency</h4>
                    <p className="text-xs text-slate-400">Advanced statistical breakdown including MAE/MFE, session performance matrices, and Monte Carlo.</p>
                  </div>
                  <button
                    onClick={() => navigate('/analytics')}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <span>Open Analytics</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Average R Yield</span>
                    <div className="text-xl font-bold text-blue-400 mt-1">+1.85 R</div>
                    <span className="text-[10px] text-slate-500">Across 55 closed executions</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Maximum Drawdown</span>
                    <div className="text-xl font-bold text-rose-400 mt-1">-3.4%</div>
                    <span className="text-[10px] text-slate-500">Controlled risk limits</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Peak Session</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">London/NY Overlap</div>
                    <span className="text-[10px] text-slate-500">74% win rate</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activePreviewTab === 'calculator' && (
              <motion.div 
                key="calculator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">Precision Risk & Position Sizing Calculator</h4>
                    <p className="text-xs text-slate-400">Instantaneous sizing calculation for Forex, Gold, and Crypto before placing any live order.</p>
                  </div>
                  <button
                    onClick={() => navigate('/calculator')}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <span>Open Calculator</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Capital at Risk</span>
                    <div className="text-lg font-bold text-white mt-0.5">$150.00 (1.5%)</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Recommended Lot Size</span>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">1.25 Standard Lots</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Reward-to-Risk Potential</span>
                    <div className="text-lg font-bold text-blue-400 mt-0.5">3.2 : 1 Ratio</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePreviewTab === 'strategies' && (
              <motion.div 
                key="strategies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">Strategy & Playbook Repository</h4>
                    <p className="text-xs text-slate-400">Track edge by setup, verify rules compliance, and calculate profit factor by strategy.</p>
                  </div>
                  <button
                    onClick={() => navigate('/strategies')}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <span>Open Strategies</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-blue-400 font-semibold">PLAYBOOK EDGE</span>
                    <h5 className="font-bold text-white text-sm mt-0.5">Setup Verification</h5>
                    <p className="text-xs text-slate-400 mt-1">Tag setups to your entry checklist and calculate real-world expectancy per system.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-purple-400 font-semibold">ATTRIBUTION</span>
                    <h5 className="font-bold text-white text-sm mt-0.5">Profit Factor & Win-Rate</h5>
                    <p className="text-xs text-slate-400 mt-1">Identify which strategies yield consistent R-multiples and filter out underperforming setups.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>TradeVault Unified Operating System</span>
            <span className="font-mono text-blue-400">Real Interactive Workspace</span>
          </div>
        </div>
      </section>

      {/* 9. Final Call to Action */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-slate-950 to-blue-950/40 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Ready to build a real trading process?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Stop relying on guess-work and emotional reactions. Start journaling every execution, analyzing your true quantitative edge, and executing like a professional.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{user ? 'Enter TradeVault Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-colors"
            >
              Explore Analytics
            </button>
          </div>
        </div>
      </section>

      {/* 10. Comprehensive Professional Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-14 sm:py-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Column 1: Brand Info */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">TradeVault</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                The evidence-first trading operating system. Connecting execution, risk management, quantitative analytics, and disciplined execution rules into one workflow.
              </p>
              <p className="text-[11px] text-slate-500">
                Secure • Private • Evidence-First Trading
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Product</h5>
              <ul className="space-y-2">
                <li><Link to="/journal" className="hover:text-white transition-colors">Trading Journal</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link to="/calculator" className="hover:text-white transition-colors">Risk Calculator</Link></li>
                <li><Link to="/strategies" className="hover:text-white transition-colors">Strategies Lab</Link></li>
                <li><Link to="/arena" className="hover:text-white transition-colors">Competition Arena</Link></li>
                <li><Link to="/news" className="hover:text-white transition-colors">Market Intelligence</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Resources</h5>
              <ul className="space-y-2">
                <li><Link to="/learning-rules" className="hover:text-white transition-colors">Learning Journal</Link></li>
                <li><Link to="/learning-rules?tab=rules" className="hover:text-white transition-colors">Trading Rules</Link></li>
                <li><Link to="/command-center" className="hover:text-white transition-colors">Command Center</Link></li>
                <li><Link to="/arena" className="hover:text-white transition-colors">Competition Arena</Link></li>
                <li><Link to="/news" className="hover:text-white transition-colors">Market News</Link></li>
              </ul>
            </div>

            {/* Column 4: Account & Workspace */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Account</h5>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Trading Dashboard</Link></li>
                <li><Link to="/settings?tab=profile" className="hover:text-white transition-colors">Profile Settings</Link></li>
                <li><Link to="/settings" className="hover:text-white transition-colors">App Preferences</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Authentication</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} TradeVault Operating System. All rights reserved.</p>
            <p>Built for traders who value process over prediction. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components

function QuickActionCard({ 
  title, 
  desc, 
  icon, 
  onClick, 
  highlight 
}: { 
  title: string; 
  desc: string; 
  icon: React.ReactNode; 
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${
        highlight 
          ? 'bg-blue-900/40 border-blue-600/60 hover:bg-blue-900/60' 
          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
      }`}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
          {icon}
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <div className="font-bold text-white text-xs sm:text-sm truncate">{title}</div>
        <div className="text-[10px] text-slate-400 truncate mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

function WorkflowStep({ 
  number, 
  title, 
  desc, 
  route, 
  badge 
}: { 
  number: string; 
  title: string; 
  desc: string; 
  route: string; 
  badge: string; 
}) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(route)}
      className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-extrabold text-blue-400">0{number}</span>
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/60 text-blue-300">
            {badge}
          </span>
        </div>
        <h4 className="font-extrabold text-white text-sm group-hover:text-blue-400 transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-slate-300">
        <span>Explore tool</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  desc, 
  bullets, 
  buttonText, 
  route 
}: { 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  bullets: string[]; 
  buttonText: string; 
  route: string; 
}) {
  const navigate = useNavigate();

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg shadow-black/40 group">
      <div>
        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5">
          {desc}
        </p>

        <ul className="space-y-2 mb-6 text-xs text-slate-300">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate(route)}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-blue-600 border border-slate-800 hover:border-blue-500 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:bg-blue-600 group-hover:text-white"
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
