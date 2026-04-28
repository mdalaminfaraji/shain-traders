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

  useEffect(() => {
    async function fetchStats() {
      try {
        const [custRes, prodRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/products"),
        ]);
        const customers = await custRes.json();
        const products = await prodRes.json();

        setStats({
          totalCustomers: Array.isArray(customers) ? customers.length : 0,
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalDues: Array.isArray(customers) ? customers.reduce((acc: number, c: any) => acc + (c.balance || 0), 0) : 0,
          lowStock: Array.isArray(products) ? products.filter((p: any) => p.stock < 10).length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted mt-2">Welcome back, Shahin Traders. Here is what is happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Stat Cards */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-muted" />
            <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-muted">Total</span>
          </div>
          <p className="text-sm font-medium text-muted">Customers</p>
          <h3 className="text-2xl font-bold mt-1">{stats.totalCustomers}</h3>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-6 h-6 text-muted" />
            <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-muted">Inventory</span>
          </div>
          <p className="text-sm font-medium text-muted">Products</p>
          <h3 className="text-2xl font-bold mt-1">{stats.totalProducts}</h3>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-muted" />
            <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded text-accent">Dues</span>
          </div>
          <p className="text-sm font-medium text-muted">Total Outstanding</p>
          <h3 className="text-2xl font-bold mt-1">৳ {stats.totalDues.toLocaleString()}</h3>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-6 h-6 text-muted" />
            <span className="text-xs font-medium px-2 py-1 bg-red-500/10 rounded text-red-400">Warning</span>
          </div>
          <p className="text-sm font-medium text-muted">Low Stock Items</p>
          <h3 className="text-2xl font-bold mt-1">{stats.lowStock}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/sales/new" className="p-4 border border-border rounded-lg hover:bg-white/5 transition-all text-center">
              Create New Sale
            </Link>
            <Link href="/payments/new" className="p-4 border border-border rounded-lg hover:bg-white/5 transition-all text-center">
              Record Payment
            </Link>
            <Link href="/inventory" className="p-4 border border-border rounded-lg hover:bg-white/5 transition-all text-center">
              Manage Stock
            </Link>
            <Link href="/customers" className="p-4 border border-border rounded-lg hover:bg-white/5 transition-all text-center">
              Customer List
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="font-bold mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            {stats.lowStock > 0 ? (
              <div className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Stock Alert</p>
                  <p className="text-xs text-muted">There are {stats.lowStock} items currently low in stock.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">All systems normal. Stock levels are healthy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
