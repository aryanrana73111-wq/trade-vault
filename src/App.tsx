import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ArenaPage from '@/pages/Arena';
import AddTrade from '@/pages/AddTrade';
import Journal from '@/pages/Journal';
import Analytics from '@/pages/Analytics';
import Strategies from '@/pages/Strategies';
import CreateStrategy from '@/pages/CreateStrategy';
import StrategyDetail from '@/pages/StrategyDetail';
import RiskCalculator from '@/pages/RiskCalculator';
import LearningRules from '@/pages/LearningRules';
import { NewsIntelligence } from '@/pages/NewsIntelligence';
import { CommandCenter } from '@/pages/CommandCenter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Settings from '@/pages/Settings';
import { AdminDashboard } from '@/pages/AdminDashboard';

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

export default function App() {
  return (
    <Routes>
      {/* Standalone Public & Authenticated Welcome Gateway */}
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login defaultSignUp={true} />} />

      {/* Authenticated Internal Workspace */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="command-center" element={<CommandCenter />} />
        <Route path="arena" element={<ArenaPage />} />
        <Route path="add" element={<AddTrade />} />
        <Route path="calculator" element={<RiskCalculator />} />
        <Route path="journal" element={<Journal />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="strategies" element={<Strategies />} />
        <Route path="strategies/create" element={<CreateStrategy />} />
        <Route path="strategies/:id" element={<StrategyDetail />} />
        <Route path="psychology" element={<Navigate to="/dashboard" replace />} />
        <Route path="academy" element={<Navigate to="/dashboard" replace />} />
        <Route path="education" element={<Navigate to="/dashboard" replace />} />
        <Route path="ai-labs" element={<Navigate to="/dashboard" replace />} />
        <Route path="labs" element={<Navigate to="/dashboard" replace />} />
        <Route path="learning-rules" element={<LearningRules />} />
        <Route path="learning" element={<Navigate to="/learning-rules?tab=learning" replace />} />
        <Route path="rules" element={<Navigate to="/learning-rules?tab=rules" replace />} />
        <Route path="news" element={<NewsIntelligence />} />
        <Route path="news-intelligence" element={<Navigate to="/news" replace />} />
        <Route path="economic-calendar" element={<Navigate to="/news?tab=calendar" replace />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Secure Admin User Management System */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminDashboard />} />
      <Route path="/admin/users/:uid" element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
