import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WarrantyList() {
  const [searchParams] = useSearchParams();
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    fetchWarranties();
  }, [statusFilter]);

  const fetchWarranties = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter && statusFilter !== "all") params.append("status_filter", statusFilter);

      const response = await axios.get(`${API}/warranties?${params.toString()}`);
      setWarranties(response.data);
    } catch (error) {
      toast.error("Failed to load warranties");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchWarranties();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/warranties/${id}`);
      toast.success("Warranty deleted");
      fetchWarranties();
    } catch (error) {
      toast.error("Failed to delete warranty");
    }
  };

  const downloadPDF = async (id, code) => {
    try {
      const response = await axios.get(`${API}/warranties/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `warranty-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
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
        className={`${styles[status]} rounded-none uppercase text-xs tracking-wider`}
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-['Chivo'] text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Warranties
            </h1>
            <p className="text-[#A1A1AA] mt-2 font-['Manrope']">
              Manage all warranty certificates
            </p>
          </div>
          <Link to="/warranties/new" className="mt-4 md:mt-0">
            <Button
              data-testid="new-warranty-btn"
              className="bg-[#D4AF37] text-black font-bold uppercase tracking-wider hover:bg-[#F3E5AB] transition-all duration-300 rounded-none h-12 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Warranty
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#0A0A0A] border border-[#27272A] p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525B]" />
              <Input
                data-testid="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, vehicle..."
                className="pl-10 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-testid="status-filter-select"
                className="w-full md:w-48 bg-[#121212] border-[#27272A] text-white h-12 rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-[#27272A]">
                <SelectItem value="all" className="text-white hover:bg-[#121212]">All Status</SelectItem>
                <SelectItem value="active" className="text-white hover:bg-[#121212]">Active</SelectItem>
                <SelectItem value="expiring_soon" className="text-white hover:bg-[#121212]">Expiring Soon</SelectItem>
                <SelectItem value="expired" className="text-white hover:bg-[#121212]">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              data-testid="search-btn"
              className="h-12 px-6 bg-[#D4AF37] text-black font-bold uppercase tracking-wider hover:bg-[#F3E5AB] transition-all duration-300 rounded-none"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-[#0A0A0A] border border-[#27272A] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#A1A1AA]">Loading...</div>
          ) : warranties.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#A1A1AA]">No warranties found</p>
              <Link to="/warranties/new">
                <Button className="mt-4 bg-[#D4AF37] text-black font-bold uppercase tracking-wider hover:bg-[#F3E5AB] rounded-none">
                  Create First Warranty
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#27272A] hover:bg-transparent">
                    <TableHead className="text-[#A1A1AA] uppercase text-xs tracking-widest font-['Manrope']">
                      Code
                    </TableHead>
                    <TableHead className="text-[#A1A1AA] uppercase text-xs tracking-widest font-['Manrope']">
                      Customer
                    </TableHead>
                    <TableHead className="text-[#A1A1AA] uppercase text-xs tracking-widest font-['Manrope']">
                      Vehicle
                    </TableHead>
                    <TableHead className="text-[#A1A1AA] uppercase text-xs tracking-widest font-['Manrope']">
                      Product
                    </TableHead>
                    <TableHead className="text-[#A1A1AA] uppercase text-xs tracking-widest font-['Manrope']">
                      Expiry
                    </TableHead>
                    <TableHead className="text-[#A1A1AA] uppercase text-xs tracking-widest font-['Manrope']">
                      Status
                    </TableHead>
                    <TableHead className="text-[#A1A1AA] uppercase text-xs tracking-widest font-['Manrope'] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warranties.map((warranty) => (
                    <TableRow
                      key={warranty.id}
                      data-testid={`warranty-row-${warranty.id}`}
                      className="border-b border-[#27272A] hover:bg-[#121212] transition-colors"
                    >
                      <TableCell className="font-mono text-[#00F0FF]">
                        {warranty.warranty_code}
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{warranty.customer_name}</p>
                          <p className="text-[#A1A1AA] text-sm">{warranty.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {warranty.vehicle_year} {warranty.vehicle_make} {warranty.vehicle_model}
                      </TableCell>
                      <TableCell className="text-[#A1A1AA]">
                        {warranty.ppf_product}
                      </TableCell>
                      <TableCell className="text-white">
                        {warranty.expiry_date?.slice(0, 10)}
                      </TableCell>
                      <TableCell>{getStatusBadge(warranty.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/warranties/${warranty.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`view-warranty-${warranty.id}`}
                              className="text-[#A1A1AA] hover:text-[#00F0FF] hover:bg-[#121212]"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`download-pdf-${warranty.id}`}
                            onClick={() => downloadPDF(warranty.id, warranty.warranty_code)}
                            className="text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-[#121212]"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`delete-warranty-${warranty.id}`}
                                className="text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#121212]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#0A0A0A] border-[#27272A]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white font-['Chivo'] uppercase">
                                  Delete Warranty
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#A1A1AA]">
                                  Are you sure you want to delete warranty {warranty.warranty_code}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-[#27272A] text-white hover:bg-[#121212] rounded-none">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(warranty.id)}
                                  className="bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-none"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
