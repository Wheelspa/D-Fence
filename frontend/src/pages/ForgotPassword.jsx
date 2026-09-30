import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSubmitted(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to process request");
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

          {/* Form Card */}
          <div className="bg-[#0A0A0A] border border-[#27272A] p-8">
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#E53935] text-xs uppercase tracking-widest transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            <h2 className="font-['Chivo'] text-xl font-bold text-white mb-2 uppercase tracking-wider">
              Forgot Password
            </h2>
            <p className="text-[#A1A1AA] text-sm mb-6 font-['Manrope']">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

            {submitted ? (
              <div className="bg-[#121212] border border-[#10B981]/30 p-6 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto" />
                <h3 className="font-['Chivo'] text-white font-bold uppercase text-sm tracking-wider">
                  Check Your Inbox
                </h3>
                <p className="text-[#A1A1AA] text-sm font-['Manrope']">
                  If an account exists for <span className="text-white font-medium">{email}</span>, a password reset link has been sent.
                </p>
                <Button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="w-full border-[#27272A] text-white hover:border-[#E53935] hover:text-[#E53935] bg-transparent rounded-none mt-2"
                >
                  Resend Link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
                    <Input
                      id="email"
                      data-testid="forgot-password-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                      placeholder="staff@dfence.com"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  data-testid="forgot-password-submit-btn"
                  disabled={loading}
                  className="w-full h-12 bg-[#E53935] text-white font-bold uppercase tracking-wider hover:bg-[#FF6F00] transition-all duration-300 rounded-none"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
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
