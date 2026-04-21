import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ClientsPage from "./pages/dashboard/ClientsPage";
import ServicesPage from "./pages/dashboard/ServicesPage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import CreatorsPage from "./pages/dashboard/CreatorsPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import MarketingPage from "./pages/dashboard/MarketingPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import TeamPage from "./pages/dashboard/TeamPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import MyWorkPage from "./pages/dashboard/MyWorkPage";
import AuditLogPage from "./pages/dashboard/AuditLogPage";
import ClientPortal from "./pages/ClientPortal";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                <Route index element={<DashboardHome />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="creators" element={<CreatorsPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="marketing" element={<MarketingPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="my-work" element={<MyWorkPage />} />
                <Route path="audit-log" element={<AuditLogPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="/client-portal" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
