import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Mail, Lock, User } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success("Account created successfully!");
      }
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1637300417161-bff1e04ea9f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBzcG9ydHMlMjBjYXIlMjBkYXJrJTIwYmFja2dyb3VuZCUyMHN0dWRpbyUyMGxpZ2h0fGVufDB8fHx8MTc2NTQ0NTQ3OXww&ixlib=rb-4.1.0&q=85')"
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-transparent to-[#050505]" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <img 
              src="https://customer-assets.emergentagent.com/job_d-fence-wheelspa/artifacts/4frllqka_D-FENCE%20Logo_page-0001.jpg"
              alt="D-Fence Logo"
              className="w-48 h-48 mx-auto object-contain mb-4"
            />
            <p className="text-[#A1A1AA] mt-2 font-['Manrope'] text-sm tracking-widest uppercase">
              by Wheelspa Private Limited
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#0A0A0A] border border-[#27272A] p-8">
            <h2 className="font-['Chivo'] text-xl font-bold text-white mb-6 uppercase tracking-wider">
              {isLogin ? "Staff Login" : "Create Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                    <Input
                      id="name"
                      data-testid="register-name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                      placeholder="Enter your name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                  <Input
                    id="email"
                    data-testid="login-email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                    placeholder="staff@dfence.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                  <Input
                    id="password"
                    data-testid="login-password-input"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                data-testid="login-submit-btn"
                disabled={loading}
                className="w-full h-12 bg-[#E53935] text-white font-bold uppercase tracking-wider hover:bg-[#FF6F00] transition-all duration-300 rounded-none"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                data-testid="toggle-auth-mode"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#A1A1AA] hover:text-[#E53935] transition-colors text-sm"
              >
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[#52525B] text-xs mt-8">
            Warranty Management System
          </p>
        </div>
      </div>
    </div>
  );
}
