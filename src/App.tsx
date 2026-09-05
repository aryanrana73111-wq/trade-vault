import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import AddTrade from '@/pages/AddTrade';
import Journal from '@/pages/Journal';
import Analytics from '@/pages/Analytics';
import Strategies from '@/pages/Strategies';
import CreateStrategy from '@/pages/CreateStrategy';
import StrategyDetail from '@/pages/StrategyDetail';
import Psychology from '@/pages/Psychology';
import RiskCalculator from '@/pages/RiskCalculator';
import LearningRules from '@/pages/LearningRules';
import AILabs from '@/pages/AILabs';
import { CommandCenter } from '@/pages/CommandCenter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Settings from '@/pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading your journal...</p>
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
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="command-center" element={<CommandCenter />} />
        <Route path="add" element={<AddTrade />} />
        <Route path="calculator" element={<RiskCalculator />} />
        <Route path="journal" element={<Journal />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="strategies" element={<Strategies />} />
        <Route path="strategies/create" element={<CreateStrategy />} />
        <Route path="strategies/:id" element={<StrategyDetail />} />
        <Route path="psychology" element={<Psychology />} />
        <Route path="ai-labs" element={<AILabs />} />
        <Route path="labs" element={<Navigate to="/ai-labs" replace />} />
        <Route path="learning-rules" element={<LearningRules />} />
        <Route path="learning" element={<Navigate to="/learning-rules?tab=learning" replace />} />
        <Route path="rules" element={<Navigate to="/learning-rules?tab=rules" replace />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
