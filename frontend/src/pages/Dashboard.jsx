import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  FileText,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-pulse text-[#D4AF37]">Loading...</div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Warranties",
      value: stats?.total_warranties || 0,
      icon: Shield,
      color: "#D4AF37",
    },
    {
      title: "Active",
      value: stats?.active_warranties || 0,
      icon: CheckCircle,
      color: "#10B981",
    },
    {
      title: "Expiring Soon",
      value: stats?.expiring_soon || 0,
      icon: AlertTriangle,
      color: "#F59E0B",
    },
    {
      title: "Expired",
      value: stats?.expired_warranties || 0,
      icon: XCircle,
      color: "#EF4444",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      
      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="font-['Chivo'] text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Dashboard
            </h1>
            <p className="text-[#A1A1AA] mt-2 font-['Manrope']">
              Warranty management overview
            </p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <Link to="/warranties/new">
              <Button
                data-testid="create-warranty-btn"
                className="bg-[#D4AF37] text-black font-bold uppercase tracking-wider hover:bg-[#F3E5AB] transition-all duration-300 rounded-none h-12 px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Warranty
              </Button>
            </Link>
            <Link to="/warranties">
              <Button
                data-testid="view-warranties-btn"
                variant="outline"
                className="border-[#27272A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37] bg-transparent rounded-none h-12 px-6"
              >
                <FileText className="w-5 h-5 mr-2" />
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s/g, '-')}`}
              className="bg-[#0A0A0A] border-[#27272A] hover:border-[#00F0FF] transition-colors duration-300 rounded-none"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#A1A1AA] text-xs uppercase tracking-widest font-['Manrope']">
                      {stat.title}
                    </p>
                    <p
                      className="text-4xl font-black font-['Chivo'] mt-2"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon
                    className="w-12 h-12 opacity-20"
                    style={{ color: stat.color }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Section */}
        <Card className="bg-[#0A0A0A] border-[#27272A] rounded-none">
          <CardHeader>
            <CardTitle className="font-['Chivo'] text-white uppercase tracking-wider text-lg">
              Warranties Created (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthly_data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis
                    dataKey="month"
                    stroke="#A1A1AA"
                    tick={{ fill: "#A1A1AA", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#A1A1AA"
                    tick={{ fill: "#A1A1AA", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      border: "1px solid #27272A",
                      borderRadius: 0,
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#00F0FF" }}
                  />
                  <Bar dataKey="count" fill="#00F0FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-[#0A0A0A] border-[#27272A] hover:border-[#D4AF37] transition-colors duration-300 rounded-none group cursor-pointer">
            <Link to="/warranties/new" className="block">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#121212] flex items-center justify-center border border-[#27272A] group-hover:border-[#D4AF37] transition-colors">
                  <Plus className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-['Chivo'] text-white font-bold uppercase text-sm tracking-wider">
                    Create Warranty
                  </h3>
                  <p className="text-[#A1A1AA] text-sm font-['Manrope']">
                    Register new PPF warranty
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="bg-[#0A0A0A] border-[#27272A] hover:border-[#D4AF37] transition-colors duration-300 rounded-none group cursor-pointer">
            <Link to="/warranties" className="block">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#121212] flex items-center justify-center border border-[#27272A] group-hover:border-[#D4AF37] transition-colors">
                  <FileText className="w-6 h-6 text-[#00F0FF]" />
                </div>
                <div>
                  <h3 className="font-['Chivo'] text-white font-bold uppercase text-sm tracking-wider">
                    View Warranties
                  </h3>
                  <p className="text-[#A1A1AA] text-sm font-['Manrope']">
                    Manage existing records
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="bg-[#0A0A0A] border-[#27272A] hover:border-[#D4AF37] transition-colors duration-300 rounded-none group cursor-pointer">
            <Link to="/warranties?status=expiring_soon" className="block">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#121212] flex items-center justify-center border border-[#27272A] group-hover:border-[#D4AF37] transition-colors">
                  <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-['Chivo'] text-white font-bold uppercase text-sm tracking-wider">
                    Expiring Soon
                  </h3>
                  <p className="text-[#A1A1AA] text-sm font-['Manrope']">
                    {stats?.expiring_soon || 0} warranties need attention
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
