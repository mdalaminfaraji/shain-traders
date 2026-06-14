/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Users, Package, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalDues: 0,
    lowStock: 0,
  });

  const [salesReport, setSalesReport] = useState({
    daily: { total: 0, count: 0 },
    weekly: { total: 0, count: 0 },
    monthly: { total: 0, count: 0 },
    yearly: { total: 0, count: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [custRes, prodRes, salesRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/products"),
          fetch("/api/reports/sales"),
        ]);
        
        const customers = await custRes.json();
        const products = await prodRes.json();
        const salesData = await salesRes.json();

        setStats({
          totalCustomers: Array.isArray(customers) ? customers.length : 0,
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalDues: Array.isArray(customers) ? customers.reduce((acc: number, c: any) => acc + (c.balance || 0), 0) : 0,
          lowStock: Array.isArray(products) ? products.filter((p: any) => p.stock < 10).length : 0,
        });

        if (!salesData.error) {
          setSalesReport(salesData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted mt-2 text-sm uppercase tracking-widest font-medium opacity-70">
            Shahin Traders Performance Overview
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted uppercase tracking-tighter">Current Date</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={<Users className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Inventory Items" value={stats.totalProducts} icon={<Package className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Total Outstanding" value={`৳ ${stats.totalDues.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5 text-accent" />} />
        <StatCard 
          title="Low Stock Alert" 
          value={stats.lowStock} 
          icon={<AlertCircle className="w-5 h-5 text-red-400" />} 
          variant={stats.lowStock > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Performance Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border bg-white/5 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Sales Performance
              </h3>
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-1 rounded-full font-bold uppercase">Real-time</span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <ReportItem label="Today" amount={salesReport.daily.total} count={salesReport.daily.count} />
              <ReportItem label="This Week" amount={salesReport.weekly.total} count={salesReport.weekly.count} />
              <ReportItem label="This Month" amount={salesReport.monthly.total} count={salesReport.monthly.count} />
              <ReportItem label="This Year" amount={salesReport.yearly.total} count={salesReport.yearly.count} />
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickActionLink href="/sales/new" label="New Sale" />
              <QuickActionLink href="/payments/new" label="Record Payment" />
              <QuickActionLink href="/inventory" label="Manage Stock" />
              <QuickActionLink href="/customers" label="Add Customer" />
            </div>
          </div>
        </div>

        {/* Side Column: Notifications & Status */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="font-bold mb-4">System Status</h3>
            <div className="space-y-4">
              {stats.lowStock > 0 ? (
                <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-400">Stock Alert</p>
                    <p className="text-xs text-muted mt-1">{stats.lowStock} products are running low on stock. Please check inventory.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <Package className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-400">Inventory Healthy</p>
                    <p className="text-xs text-muted mt-1">All stock levels are currently above warning thresholds.</p>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-white/5 rounded-xl border border-border">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Database Connection</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium">Live and Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, variant = "default" }: { title: string; value: any; icon: any; variant?: string }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl hover:border-white/20 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${variant === "warning" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-muted"}`}>
          {variant === "warning" ? "Action Required" : "Updated"}
        </span>
      </div>
      <p className="text-xs font-bold text-muted uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-bold mt-2 tracking-tight">{value}</h3>
    </div>
  );
}

function ReportItem({ label, amount, count }: { label: string; amount: number; count: number }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-border/50">
      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold">৳ {amount.toLocaleString()}</p>
      <p className="text-[10px] text-muted mt-1 font-medium">{count} Transactions</p>
    </div>
  );
}

function QuickActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="p-4 border border-border rounded-xl text-center text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/20 transition-all active:scale-95">
      {label}
    </Link>
  );
}
