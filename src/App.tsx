import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Safe lazy loading of authenticated and heavy modules
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ArenaPage = lazy(() => import('@/pages/Arena'));
const AddTrade = lazy(() => import('@/pages/AddTrade'));
const Journal = lazy(() => import('@/pages/Journal'));
const Strategies = lazy(() => import('@/pages/Strategies'));
const CreateStrategy = lazy(() => import('@/pages/CreateStrategy'));
const StrategyDetail = lazy(() => import('@/pages/StrategyDetail'));
const RiskCalculator = lazy(() => import('@/pages/RiskCalculator'));
const LearningRules = lazy(() => import('@/pages/LearningRules'));
const CommandCenter = lazy(() => import('@/pages/CommandCenter'));
const Charts = lazy(() => import('@/pages/Charts'));
const Settings = lazy(() => import('@/pages/Settings'));

// Named export lazy loaders
const NewsIntelligence = lazy(async () => {
  const module = await import('@/pages/NewsIntelligence');
  return { default: module.NewsIntelligence };
});

const AdminDashboard = lazy(async () => {
  const module = await import('@/pages/AdminDashboard');
  return { default: module.AdminDashboard };
});

function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        color: '#f8fafc',
        padding: '24px'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: '1px solid rgba(59,130,246,.35)',
            background: 'rgba(37,99,235,.15)',
            margin: '0 auto 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: '2px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'tv-route-spin .75s linear infinite'
            }}
          />
        </div>

        <div style={{ fontWeight: 700, fontSize: 17 }}>
          TradeVault
        </div>

        <div
          style={{
            marginTop: 5,
            color: '#94a3b8',
            fontSize: 12
          }}
        >
          Loading workspace...
        </div>

        <style>
          {`
            @keyframes tv-route-spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium text-sm">Loading TradeVault workspace...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium text-sm">Loading TradeVault...</p>
      </div>
    );
  }
  if (!user) {
    return <Home />;
  }
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Root gateway: shows Public Website for visitors, navigates to Dashboard for authenticated traders */}
        <Route path="/" element={<RootRoute />} />

        {/* Standalone Public & Authenticated Welcome Gateway */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login defaultSignUp={true} />} />

        {/* Authenticated Internal Workspace */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/arena" element={<ArenaPage />} />
          <Route path="/add" element={<AddTrade />} />
          <Route path="/calculator" element={<RiskCalculator />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/strategies/create" element={<CreateStrategy />} />
          <Route path="/strategies/:id" element={<StrategyDetail />} />
          <Route path="/psychology" element={<Navigate to="/dashboard" replace />} />
          <Route path="/academy" element={<Navigate to="/dashboard" replace />} />
          <Route path="/education" element={<Navigate to="/dashboard" replace />} />
          <Route path="/ai-labs" element={<Navigate to="/dashboard" replace />} />
          <Route path="/labs" element={<Navigate to="/dashboard" replace />} />
          <Route path="/learning-rules" element={<LearningRules />} />
          <Route path="/learning" element={<Navigate to="/learning-rules?tab=learning" replace />} />
          <Route path="/rules" element={<Navigate to="/learning-rules?tab=rules" replace />} />
          <Route path="/news" element={<NewsIntelligence />} />
          <Route path="/news-intelligence" element={<Navigate to="/news" replace />} />
          <Route path="/economic-calendar" element={<Navigate to="/news?tab=calendar" replace />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Secure Admin User Management System */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/users/:uid" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
}
