import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/reset-password`, {
        token: token,
        new_password: formData.password,
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to reset password. Link may be invalid or expired.");
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
            <Link to="/login">
              <img 
                src="/logo.jpg"
                alt="D-Fence Logo"
                className="w-48 h-48 mx-auto object-contain mb-4 cursor-pointer"
              />
            </Link>
            <p className="text-[#A1A1AA] mt-2 font-['Manrope'] text-sm tracking-widest uppercase">
              by Wheelspa Private Limited
            </p>
          </div>

          {/* Reset Password Card */}
          <div className="bg-[#0A0A0A] border border-[#27272A] p-8">
            <h2 className="font-['Chivo'] text-xl font-bold text-white mb-2 uppercase tracking-wider">
              Reset Password
            </h2>
            <p className="text-[#A1A1AA] text-sm mb-6 font-['Manrope']">
              Create a new secure password for your D-Fence account.
            </p>

            {success ? (
              <div className="bg-[#121212] border border-[#10B981]/30 p-6 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto" />
                <h3 className="font-['Chivo'] text-white font-bold uppercase text-sm tracking-wider">
                  Password Reset Complete
                </h3>
                <p className="text-[#A1A1AA] text-sm font-['Manrope']">
                  Your password has been updated. Redirecting you to login...
                </p>
                <Button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full bg-[#E53935] text-white font-bold uppercase tracking-wider hover:bg-[#FF6F00] transition-all duration-300 rounded-none mt-2"
                >
                  Sign In Now
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                    <Input
                      id="new-password"
                      data-testid="reset-password-input"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                    <Input
                      id="confirm-password"
                      data-testid="reset-confirm-password-input"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  data-testid="reset-password-submit-btn"
                  disabled={loading}
                  className="w-full h-12 bg-[#E53935] text-white font-bold uppercase tracking-wider hover:bg-[#FF6F00] transition-all duration-300 rounded-none"
                >
                  {loading ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            )}
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
