import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Mail,
  User,
  Car,
  Shield,
  Calendar,
  Clock,
  Copy,
  CheckCircle,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WarrantyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWarranty();
  }, [id]);

  const fetchWarranty = async () => {
    try {
      const response = await axios.get(`${API}/warranties/${id}`);
      setWarranty(response.data);
    } catch (error) {
      toast.error("Failed to load warranty");
      navigate("/warranties");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.get(`${API}/warranties/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `warranty-${warranty.warranty_code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const sendEmail = async () => {
    setSendingEmail(true);
    try {
      const response = await axios.post(`${API}/warranties/${id}/send-email`);
      if (response.data.status === "skipped") {
        toast.info(response.data.message);
      } else {
        toast.success("Email sent to customer");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const copyVerificationLink = () => {
    const link = `${window.location.origin}/verify/${warranty.warranty_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Verification link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30",
      expiring_soon: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30",
      expired: "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30",
    };

    return (
      <Badge
        variant="outline"
        className={`${styles[status]} rounded-none uppercase text-sm tracking-wider px-4 py-1`}
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-pulse text-[#E53935]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!warranty) return null;

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <main className="p-6 md:p-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/warranties")}
            className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#E53935] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Warranties</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="font-['Chivo'] text-3xl font-black text-[#E53935] tracking-tight">
                  {warranty.warranty_code}
                </h1>
                {getStatusBadge(warranty.status)}
              </div>
              <p className="text-[#A1A1AA] font-['Manrope']">
                Created on {new Date(warranty.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                data-testid="copy-link-btn"
                variant="outline"
                onClick={copyVerificationLink}
                className="border-[#27272A] text-white hover:border-[#E53935] hover:text-[#E53935] bg-transparent rounded-none h-11"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy Link
              </Button>
              <Button
                data-testid="send-email-btn"
                variant="outline"
                onClick={sendEmail}
                disabled={sendingEmail}
                className="border-[#27272A] text-white hover:border-[#E53935] hover:text-[#E53935] bg-transparent rounded-none h-11"
              >
                <Mail className="w-4 h-4 mr-2" />
                {sendingEmail ? "Sending..." : "Send Email"}
              </Button>
              <Button
                data-testid="download-pdf-btn"
                onClick={downloadPDF}
                className="bg-[#E53935] text-white font-bold uppercase tracking-wider hover:bg-[#FF6F00] rounded-none h-11"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <Card className="bg-[#0A0A0A] border-[#27272A] rounded-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-[#E53935]" />
                  <h2 className="font-['Chivo'] text-lg font-bold text-white uppercase tracking-wider">
                    Customer Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Name" value={warranty.customer_name} />
                  <DetailItem label="Email" value={warranty.customer_email} />
                  <DetailItem label="Phone" value={warranty.customer_phone} />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card className="bg-[#0A0A0A] border-[#27272A] rounded-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Car className="w-5 h-5 text-[#B8860B]" />
                  <h2 className="font-['Chivo'] text-lg font-bold text-white uppercase tracking-wider">
                    Vehicle Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Vehicle Type" value={warranty.vehicle_type || "N/A"} />
                  <DetailItem label="Make" value={warranty.vehicle_make} />
                  <DetailItem label="Model" value={warranty.vehicle_model} />
                  <DetailItem label="Year" value={warranty.vehicle_year} />
                  <DetailItem label="Color" value={warranty.vehicle_color || "N/A"} />
                  <DetailItem label="VIN" value={warranty.vehicle_vin || "N/A"} />
                </div>
              </CardContent>
            </Card>

            {/* Protection Details */}
            <Card className="bg-[#0A0A0A] border-[#27272A] rounded-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-[#10B981]" />
                  <h2 className="font-['Chivo'] text-lg font-bold text-white uppercase tracking-wider">
                    Protection Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Service Type" value={warranty.service_type || "PPF"} />
                  <DetailItem label="Product Brand" value={warranty.ppf_product} />
                  <DetailItem label="Film Thickness" value={warranty.ppf_thickness || "N/A"} />
                  <DetailItem label="Coverage" value={warranty.ppf_coverage} />
                  <DetailItem 
                    label="Installation Date" 
                    value={warranty.installation_date?.slice(0, 10)} 
                    icon={<Calendar className="w-4 h-4 text-[#A1A1AA]" />}
                  />
                  <DetailItem 
                    label="Warranty Period" 
                    value={`${warranty.warranty_years} Years`}
                    icon={<Clock className="w-4 h-4 text-[#A1A1AA]" />}
                  />
                  <DetailItem 
                    label="Expiry Date" 
                    value={warranty.expiry_date?.slice(0, 10)}
                    highlight={warranty.status !== "active"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Sidebar */}
          <div className="space-y-6">
            <Card className="bg-[#0A0A0A] border-[#27272A] rounded-none">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="font-['Chivo'] text-sm font-bold text-[#A1A1AA] uppercase tracking-widest mb-4">
                  Verification QR Code
                </h3>
                <div className="bg-white p-4 rounded-none">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${warranty.warranty_code}`}
                    size={180}
                    level="H"
                  />
                </div>
                <p className="text-[#A1A1AA] text-xs mt-4 text-center font-['Manrope']">
                  Scan to verify warranty authenticity
                </p>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="bg-[#0A0A0A] border-[#27272A] rounded-none">
              <CardContent className="p-6">
                <h3 className="font-['Chivo'] text-sm font-bold text-[#A1A1AA] uppercase tracking-widest mb-4">
                  Warranty Status
                </h3>
                <div className="flex flex-col items-center">
                  {warranty.status === "active" ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-[#10B981] mb-3" />
                      <p className="text-[#10B981] font-bold uppercase">Valid & Active</p>
                    </>
                  ) : warranty.status === "expiring_soon" ? (
                    <>
                      <Clock className="w-16 h-16 text-[#F59E0B] mb-3" />
                      <p className="text-[#F59E0B] font-bold uppercase">Expiring Soon</p>
                    </>
                  ) : (
                    <>
                      <Shield className="w-16 h-16 text-[#EF4444] mb-3" />
                      <p className="text-[#EF4444] font-bold uppercase">Expired</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ label, value, icon, highlight, className = "" }) {
  return (
    <div className={className}>
      <p className="text-[#A1A1AA] text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className={`text-white font-['Manrope'] ${highlight ? "text-[#F59E0B]" : ""}`}>
        {value}
      </p>
    </div>
  );
}
