import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { AuthProviderLess } from "./contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Unauthorized } from "./pages/Unauthorized";

// Officer Pages
import OfficerLoading from "./pages/officer/OfficerDash";
import { OfficerMessages } from "./pages/officer/OfficerMessage";
import { OfficerReports } from "./pages/officer/OfficerReport";
import { OfficerDonations } from "./pages/officer/OfficerDonations";
import { OfficerReportSub } from "./pages/officer/OfficerReportsSub";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminReports } from "./pages/admin/AdminReport";
import { AdminShare } from "./pages/admin/AminShare";
import { AdminRequests } from "./pages/admin/AdminRequests";
import { AdminUsers } from "./pages/admin/AdminUsers";

// Manager Pages
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { ManagerRequest } from "./pages/manager/ManagerRequest";
import { ManagerApproved } from "./pages/manager/ManagerApproved";
import { ManagerDistribute } from "./pages/manager/ManagerDistribute";
import { ManagerReports } from "./pages/manager/ManagerReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AuthProviderLess>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Finance Officer routes */}
            <Route 
              path="/Dashboard/officer" 
              element={
                <ProtectedRoute allowedRoles={['Finance Officer']}>
                  <OfficerLoading />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/officer/messages" 
              element={
                <ProtectedRoute allowedRoles={['Finance Officer']}>
                  <OfficerMessages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/officer/donations" 
              element={
                <ProtectedRoute allowedRoles={['Finance Officer']}>
                  <OfficerDonations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/officer/reports" 
              element={
                <ProtectedRoute allowedRoles={['Finance Officer']}>
                  <OfficerReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/officer/reportsSub" 
              element={
                <ProtectedRoute allowedRoles={['Finance Officer']}>
                  <OfficerReportSub />
                </ProtectedRoute>
              } 
            />

            {/* Finance Administrator routes */}
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute allowedRoles={['Finance Administrator']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['Finance Administrator']}>
                  <AdminReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/share" 
              element={
                <ProtectedRoute allowedRoles={['Finance Administrator']}>
                  <AdminShare />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/requests" 
              element={
                <ProtectedRoute allowedRoles={['Finance Administrator']}>
                  <AdminRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['Finance Administrator']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />

            {/* Program Manager routes */}
            <Route 
              path="/dashboard/manager" 
              element={
                <ProtectedRoute allowedRoles={['Program Manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/manager/request" 
              element={
                <ProtectedRoute allowedRoles={['Program Manager']}>
                  <ManagerRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/manager/approved" 
              element={
                <ProtectedRoute allowedRoles={['Program Manager']}>
                  <ManagerApproved />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/manager/distribute" 
              element={
                <ProtectedRoute allowedRoles={['Program Manager']}>
                  <ManagerDistribute />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/manager/reports" 
              element={
                <ProtectedRoute allowedRoles={['Program Manager']}>
                  <ManagerReports />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProviderLess>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
