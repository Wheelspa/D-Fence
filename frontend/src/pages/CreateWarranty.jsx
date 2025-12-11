import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, User, Car, Shield, ArrowLeft } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PPF_PRODUCTS = [
  "XPEL Ultimate Plus",
  "XPEL Stealth",
  "3M Pro Series",
  "3M Scotchgard Pro",
  "SunTek Ultra",
  "SunTek PPF",
  "Llumar Valor",
  "Llumar PPF",
  "PremiumShield Elite",
  "Other",
];

const PPF_COVERAGE = [
  "Full Body",
  "Full Front",
  "Partial Front",
  "Hood & Fenders",
  "Door Edges & Cups",
  "Rocker Panels",
  "Custom",
];

const WARRANTY_YEARS = [3, 5, 7, 10];

export default function CreateWarranty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [installDate, setInstallDate] = useState(new Date());
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_vin: "",
    vehicle_color: "",
    ppf_product: "",
    ppf_coverage: "",
    warranty_years: 5,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required select fields
    if (!formData.ppf_product) {
      toast.error("Please select a PPF product");
      setLoading(false);
      return;
    }
    if (!formData.ppf_coverage) {
      toast.error("Please select coverage type");
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(`${API}/warranties`, {
        ...formData,
        installation_date: installDate.toISOString(),
      });
      toast.success("Warranty created successfully!");
      navigate(`/warranties/${response.data.id}`);
    } catch (error) {
      console.error("Error creating warranty:", error);
      toast.error(error.response?.data?.detail || "Failed to create warranty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <main className="p-6 md:p-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#E53935] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="font-['Chivo'] text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Create Warranty
          </h1>
          <p className="text-[#A1A1AA] mt-2 font-['Manrope']">
            Register a new PPF warranty certificate
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Details */}
          <div className="bg-[#0A0A0A] border border-[#27272A] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#E53935]" />
              <h2 className="font-['Chivo'] text-lg font-bold text-white uppercase tracking-wider">
                Customer Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Full Name *
                </Label>
                <Input
                  data-testid="customer-name-input"
                  value={formData.customer_name}
                  onChange={(e) => handleChange("customer_name", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Email Address *
                </Label>
                <Input
                  data-testid="customer-email-input"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleChange("customer_email", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Phone Number *
                </Label>
                <Input
                  data-testid="customer-phone-input"
                  value={formData.customer_phone}
                  onChange={(e) => handleChange("customer_phone", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-[#0A0A0A] border border-[#27272A] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Car className="w-5 h-5 text-[#B8860B]" />
              <h2 className="font-['Chivo'] text-lg font-bold text-white uppercase tracking-wider">
                Vehicle Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Make *
                </Label>
                <Input
                  data-testid="vehicle-make-input"
                  value={formData.vehicle_make}
                  onChange={(e) => handleChange("vehicle_make", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="BMW"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Model *
                </Label>
                <Input
                  data-testid="vehicle-model-input"
                  value={formData.vehicle_model}
                  onChange={(e) => handleChange("vehicle_model", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="M3"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Year *
                </Label>
                <Input
                  data-testid="vehicle-year-input"
                  value={formData.vehicle_year}
                  onChange={(e) => handleChange("vehicle_year", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Color
                </Label>
                <Input
                  data-testid="vehicle-color-input"
                  value={formData.vehicle_color}
                  onChange={(e) => handleChange("vehicle_color", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="Alpine White"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  VIN (Optional)
                </Label>
                <Input
                  data-testid="vehicle-vin-input"
                  value={formData.vehicle_vin}
                  onChange={(e) => handleChange("vehicle_vin", e.target.value)}
                  className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  placeholder="WBS8M9C51N5K12345"
                />
              </div>
            </div>
          </div>

          {/* PPF & Warranty Details */}
          <div className="bg-[#0A0A0A] border border-[#27272A] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-[#10B981]" />
              <h2 className="font-['Chivo'] text-lg font-bold text-white uppercase tracking-wider">
                Protection Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  PPF Product *
                </Label>
                <Select
                  value={formData.ppf_product}
                  onValueChange={(value) => handleChange("ppf_product", value)}
                >
                  <SelectTrigger 
                    data-testid="ppf-product-select"
                    className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  >
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-[#27272A]">
                    {PPF_PRODUCTS.map((product) => (
                      <SelectItem
                        key={product}
                        value={product}
                        className="text-white hover:bg-[#121212] focus:bg-[#121212]"
                      >
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Coverage *
                </Label>
                <Select
                  value={formData.ppf_coverage}
                  onValueChange={(value) => handleChange("ppf_coverage", value)}
                >
                  <SelectTrigger 
                    data-testid="ppf-coverage-select"
                    className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  >
                    <SelectValue placeholder="Select coverage" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-[#27272A]">
                    {PPF_COVERAGE.map((coverage) => (
                      <SelectItem
                        key={coverage}
                        value={coverage}
                        className="text-white hover:bg-[#121212] focus:bg-[#121212]"
                      >
                        {coverage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Installation Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      data-testid="installation-date-btn"
                      variant="outline"
                      className="w-full h-12 bg-[#121212] border-[#27272A] text-white rounded-none justify-start text-left font-normal hover:bg-[#121212] hover:border-[#E53935]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#A1A1AA]" />
                      {installDate ? format(installDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-[#27272A]" align="start">
                    <Calendar
                      mode="single"
                      selected={installDate}
                      onSelect={setInstallDate}
                      initialFocus
                      className="bg-[#0A0A0A] text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-[#A1A1AA] uppercase text-xs tracking-widest">
                  Warranty Period *
                </Label>
                <Select
                  value={String(formData.warranty_years)}
                  onValueChange={(value) => handleChange("warranty_years", parseInt(value))}
                >
                  <SelectTrigger 
                    data-testid="warranty-years-select"
                    className="bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                  >
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-[#27272A]">
                    {WARRANTY_YEARS.map((year) => (
                      <SelectItem
                        key={year}
                        value={String(year)}
                        className="text-white hover:bg-[#121212] focus:bg-[#121212]"
                      >
                        {year} Years
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-12 px-8 border-[#27272A] text-white hover:border-[#E53935] hover:text-[#E53935] bg-transparent rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="create-warranty-submit-btn"
              disabled={loading}
              className="h-12 px-8 bg-[#E53935] text-white font-bold uppercase tracking-wider hover:bg-[#FF6F00] transition-all duration-300 rounded-none"
            >
              {loading ? "Creating..." : "Create Warranty"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
