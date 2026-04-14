import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import GmailCallback from "./pages/auth/GmailCallback";
import WhatsAppCallback from "./pages/auth/WhatsAppCallback";
import Dashboard from "./pages/dashboard/Dashboard";
import AgentsList from "./pages/agents/AgentsList";
import CreateAgent from "./pages/agents/CreateAgent";
import AgentKnowledge from "./pages/agents/AgentKnowledge";
import SavedKnowledge from "./pages/agents/SavedKnowledge";
import WorkflowEditor from "./pages/workflows/WorkflowEditor";
import ChatConsole from "./pages/chat/ChatConsole";
import Logs from "./pages/logs/Logs";
import AgentBehavior from "./pages/agents/AgentBehavior";
import ReviewAgent from "./pages/agents/ReviewAgent";
import AgentDetails from "./pages/agents/AgentDetails";
import TestAgent from "./pages/agents/TestAgent";
import ChannelsIntegration from "./pages/channels/ChannelsIntegration";
import Features from "./pages/Features";
import Documentation from "./pages/logs/Documentation";
import SettingsPage from "./pages/settings/SettingsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAgents from "./pages/admin/Agents";
import AdminAnalytics from "./pages/admin/Analytics";

// Layout & Core
import Layout from "./components/layout/layout";
import PrivateRoute from "./components/routes/PrivateRoute";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import { restoreAuth } from "./app/authSlice";
import { Spinner } from "./components/ui";
import { Bot } from "lucide-react";
import Pricing from "./pages/auth/Pricing";

export default function App() {
  const dispatch = useDispatch();
  const isBootstrapping = useSelector((state) => state.auth.isBootstrapping);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  // Premium Bootstrapping Screen
  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] transition-colors duration-500">
        <div className="relative flex flex-col items-center">
          {/* Branded Glow Effect */}
          <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse" />

          <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-card)] border border-white/5 shadow-2xl">
            <Bot className="h-8 w-8 text-primary animate-bounce" />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--color-text)] opacity-80">
              Agent Forge
            </h2>
            <div className="flex items-center gap-3">
              <Spinner size="sm" className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
                Synchronizing Neural Core...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const protectedLayout = (component) => (
    <PrivateRoute>
      <Layout>{component}</Layout>
    </PrivateRoute>
  );

  const adminProtectedLayout = (component) => (
    <AdminRoute>
      <Layout>
        <AdminLayout>{component}</AdminLayout>
      </Layout>
    </AdminRoute>
  );

  return (
    <Routes>
      {/* ===== Public Routes ===== */}
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* ===== Auth Routes ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/auth/gmail" element={<GmailCallback />} />
      <Route path="/auth/whatsapp" element={<WhatsAppCallback />} />

      {/* ===== Dashboard & Protected Core ===== */}
      <Route path="/dashboard" element={protectedLayout(<Dashboard />)} />
      <Route path="/settings" element={protectedLayout(<SettingsPage />)} />

      {/* ===== Agent Management ===== */}
      <Route path="/agents" element={protectedLayout(<AgentsList />)} />
      <Route path="/agents/create" element={protectedLayout(<CreateAgent />)} />
      <Route path="/agents/:id" element={protectedLayout(<AgentDetails />)} />
      <Route
        path="/agents/:id/edit"
        element={protectedLayout(<CreateAgent />)}
      />

      {/* Cognitive Configuration */}
      <Route
        path="/agents/behavior"
        element={protectedLayout(<AgentBehavior />)}
      />
      <Route
        path="/agents/:id/behavior"
        element={protectedLayout(<AgentBehavior />)}
      />
      <Route path="/agents/review" element={protectedLayout(<ReviewAgent />)} />

      {/* Knowledge Base */}
      <Route
        path="/agents/knowledge"
        element={protectedLayout(<SavedKnowledge />)}
      />
      <Route
        path="/agents/:id/knowledge"
        element={protectedLayout(<SavedKnowledge />)}
      />
      <Route
        path="/agents/knowledge/add"
        element={protectedLayout(<AgentKnowledge />)}
      />
      <Route
        path="/agents/:id/knowledge/add"
        element={protectedLayout(<AgentKnowledge />)}
      />

      {/* Operational Tools */}
      <Route path="/workflows" element={protectedLayout(<WorkflowEditor />)} />
      <Route
        path="/agents/:id/workflow"
        element={protectedLayout(<WorkflowEditor />)}
      />

      <Route path="/chat" element={protectedLayout(<ChatConsole />)} />
      <Route path="/test-agent" element={protectedLayout(<TestAgent />)} />
      <Route path="/agents/:id/test" element={protectedLayout(<TestAgent />)} />

      <Route path="/logs" element={protectedLayout(<Logs />)} />

      {/* Integrations */}
      <Route
        path="/channels"
        element={protectedLayout(<ChannelsIntegration />)}
      />
      <Route
        path="/channels/:id"
        element={protectedLayout(<ChannelsIntegration />)}
      />

      <Route path="/admin" element={adminProtectedLayout(<AdminDashboard />)} />
      <Route path="/admin/users" element={adminProtectedLayout(<AdminUsers />)} />
      <Route path="/admin/agents" element={adminProtectedLayout(<AdminAgents />)} />
      <Route path="/admin/analytics" element={adminProtectedLayout(<AdminAnalytics />)} />
    </Routes>
  );
}
