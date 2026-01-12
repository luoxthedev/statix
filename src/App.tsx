import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "@/components/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import SiteDashboard from "./pages/SiteDashboard";
import AddNewSite from "./pages/AddNewSite";
import SiteManagement from "./pages/SiteManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/site-dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/site-dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/site-dashboard" replace /> : <ForgotPassword />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/site-dashboard" 
        element={
          <PrivateRoute>
            <SiteDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/add-new-site" 
        element={
          <PrivateRoute>
            <AddNewSite />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/sites/:id" 
        element={
          <PrivateRoute>
            <SiteManagement />
          </PrivateRoute>
        } 
      />
      
      {/* Redirects */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/site-dashboard" : "/login"} replace />} 
      />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
