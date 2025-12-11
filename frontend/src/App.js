import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CreateWarranty from "@/pages/CreateWarranty";
import WarrantyList from "@/pages/WarrantyList";
import WarrantyDetail from "@/pages/WarrantyDetail";
import VerifyWarranty from "@/pages/VerifyWarranty";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-[#D4AF37]">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify/:code" element={<VerifyWarranty />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warranties"
        element={
          <ProtectedRoute>
            <WarrantyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warranties/new"
        element={
          <ProtectedRoute>
            <CreateWarranty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warranties/:id"
        element={
          <ProtectedRoute>
            <WarrantyDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
