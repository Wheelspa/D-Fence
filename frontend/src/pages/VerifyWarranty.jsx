import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Car,
  Calendar,
  Clock,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VerifyWarranty() {
  const { code } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyWarranty();
  }, [code]);

  const verifyWarranty = async () => {
    try {
      const response = await axios.get(`${API}/verify/${code}`);
      setResult(response.data);
    } catch (error) {
      setResult({
        is_valid: false,
        warranty: null,
        message: "Failed to verify warranty. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Shield className="w-16 h-16 text-[#E53935] mx-auto animate-pulse" />
          <p className="text-[#A1A1AA] mt-4">Verifying warranty...</p>
        </motion.div>
      </div>
    );
  }

  const warranty = result?.warranty;

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1637300417161-bff1e04ea9f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBzcG9ydHMlMjBjYXIlMjBkYXJrJTIwYmFja2dyb3VuZCUyMHN0dWRpbyUyMGxpZ2h0fGVufDB8fHx8MTc2NTQ0NTQ3OXww&ixlib=rb-4.1.0&q=85')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />

      <div className="relative z-10 min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link to="/">
              <img 
                src="https://customer-assets.emergentagent.com/job_d-fence-wheelspa/artifacts/4frllqka_D-FENCE%20Logo_page-0001.jpg"
                alt="D-Fence Logo"
                className="w-32 h-32 mx-auto object-contain mb-2"
              />
              <p className="text-[#A1A1AA] mt-1 font-['Manrope'] text-sm tracking-widest uppercase">
                Warranty Verification
              </p>
            </Link>
          </motion.div>

          {/* Result Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-none overflow-hidden">
              {/* Status Header */}
              <div
                className={`p-8 text-center ${
                  result.is_valid
                    ? "bg-[#10B981]/10 border-b border-[#10B981]/20"
                    : warranty?.status === "expired"
                    ? "bg-[#EF4444]/10 border-b border-[#EF4444]/20"
                    : "bg-[#EF4444]/10 border-b border-[#EF4444]/20"
                }`}
              >
                {result.is_valid ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                  >
                    <CheckCircle className="w-20 h-20 text-[#10B981] mx-auto mb-4" />
                    <h2 className="font-['Chivo'] text-2xl font-black text-white uppercase tracking-wider">
                      Warranty Verified
                    </h2>
                    <p className="text-[#10B981] mt-2">{result.message}</p>
                  </motion.div>
                ) : warranty?.status === "expired" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                  >
                    <AlertTriangle className="w-20 h-20 text-[#F59E0B] mx-auto mb-4" />
                    <h2 className="font-['Chivo'] text-2xl font-black text-white uppercase tracking-wider">
                      Warranty Expired
                    </h2>
                    <p className="text-[#F59E0B] mt-2">{result.message}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                  >
                    <XCircle className="w-20 h-20 text-[#EF4444] mx-auto mb-4" />
                    <h2 className="font-['Chivo'] text-2xl font-black text-white uppercase tracking-wider">
                      Verification Failed
                    </h2>
                    <p className="text-[#EF4444] mt-2">{result.message}</p>
                  </motion.div>
                )}
              </div>

              {warranty && (
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Warranty Details */}
                    <div className="md:col-span-8 space-y-8">
                      {/* Warranty Code */}
                      <div className="text-center md:text-left">
                        <p className="text-[#A1A1AA] text-xs uppercase tracking-widest mb-1">
                          Certificate Number
                        </p>
                        <p className="font-['Chivo'] text-2xl font-black text-[#E53935]">
                          {warranty.warranty_code}
                        </p>
                      </div>

                      {/* Customer */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <User className="w-4 h-4 text-[#E53935]" />
                          <h3 className="text-[#E53935] text-xs uppercase tracking-widest font-bold">
                            Customer
                          </h3>
                        </div>
                        <p className="text-white text-lg">{warranty.customer_name}</p>
                      </div>

                      {/* Vehicle */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Car className="w-4 h-4 text-[#B8860B]" />
                          <h3 className="text-[#B8860B] text-xs uppercase tracking-widest font-bold">
                            Vehicle
                          </h3>
                        </div>
                        <p className="text-white text-lg">
                          {warranty.vehicle_year} {warranty.vehicle_make} {warranty.vehicle_model}
                        </p>
                        {warranty.vehicle_color && (
                          <p className="text-[#A1A1AA]">{warranty.vehicle_color}</p>
                        )}
                      </div>

                      {/* Protection */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-[#10B981]" />
                            <h3 className="text-[#10B981] text-xs uppercase tracking-widest font-bold">
                              Service Type
                            </h3>
                          </div>
                          <p className="text-white">{warranty.service_type || "PPF"}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-[#B8860B]" />
                            <h3 className="text-[#B8860B] text-xs uppercase tracking-widest font-bold">
                              Product Brand
                            </h3>
                          </div>
                          <p className="text-white">{warranty.ppf_product}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-[#A1A1AA]" />
                            <h3 className="text-[#A1A1AA] text-xs uppercase tracking-widest font-bold">
                              Film Thickness
                            </h3>
                          </div>
                          <p className="text-white">{warranty.ppf_thickness || "N/A"}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-[#A1A1AA]" />
                            <h3 className="text-[#A1A1AA] text-xs uppercase tracking-widest font-bold">
                              Coverage & Warranty
                            </h3>
                          </div>
                          <p className="text-white">{warranty.ppf_coverage}</p>
                          <p className="text-[#A1A1AA] text-sm">{warranty.warranty_years} Years</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-[#A1A1AA]" />
                            <h3 className="text-[#A1A1AA] text-xs uppercase tracking-widest">
                              Installed On
                            </h3>
                          </div>
                          <p className="text-white">{warranty.installation_date?.slice(0, 10)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-[#A1A1AA]" />
                            <h3 className="text-[#A1A1AA] text-xs uppercase tracking-widest">
                              Valid Until
                            </h3>
                          </div>
                          <p
                            className={
                              warranty.status === "expired"
                                ? "text-[#EF4444]"
                                : warranty.status === "expiring_soon"
                                ? "text-[#F59E0B]"
                                : "text-white"
                            }
                          >
                            {warranty.expiry_date?.slice(0, 10)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                      <div className="bg-white p-4">
                        <QRCodeSVG
                          value={`${window.location.origin}/verify/${warranty.warranty_code}`}
                          size={150}
                          level="H"
                        />
                      </div>
                      <p className="text-[#A1A1AA] text-xs mt-3 text-center">
                        Verification QR Code
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-[#52525B] text-sm">
              This certificate is issued by{" "}
              <span className="text-[#E53935]">D-Fence</span>, a division of Wheelspa Private Limited
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
