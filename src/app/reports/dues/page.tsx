"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Printer, Phone } from "lucide-react";
import Link from "next/link";

export default function DuesReportPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter((c: any) => c.balance > 0).sort((a: any, b: any) => b.balance - a.balance);
          setCustomers(filtered);
        } else {
          console.error("Data is not an array:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch failed:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8 no-print">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-light-gray transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Report
        </button>
      </header>

      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Outstanding Dues Report</h2>
        <p className="text-muted mt-2">Comprehensive list of all customers with pending balances.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-white/5">
              <th className="p-4 pl-6 font-medium text-muted">Customer Name</th>
              <th className="p-4 font-medium text-muted">Phone Number</th>
              <th className="p-4 font-medium text-muted">Address</th>
              <th className="p-4 pr-6 font-medium text-muted text-right">Outstanding Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted">Analyzing balances...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted">Great! No outstanding dues at the moment.</td></tr>
            ) : (
              customers.map((customer: any) => (
                <tr key={customer._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-6 font-bold">{customer.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-muted" /> {customer.phone}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted">{customer.address || "N/A"}</td>
                  <td className="p-4 pr-6 text-right">
                    <span className="text-lg font-black text-red-400">৳ {customer.balance.toLocaleString()}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {customers.length > 0 && (
            <tfoot>
              <tr className="bg-white/5 font-black">
                <td colSpan={3} className="p-6 text-right text-muted uppercase tracking-widest text-xs">Total Outstanding Amount</td>
                <td className="p-6 text-right text-2xl text-red-400">
                  ৳ {customers.reduce((acc, c: any) => acc + c.balance, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>

      <div className="mt-8 p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-4 no-print">
        <AlertCircle className="w-5 h-5 text-red-400 mt-1" />
        <p className="text-sm text-muted">
          This report is generated based on real-time data. Please ensure all recent sales and payments are recorded before printing.
        </p>
      </div>
    </div>
  );
}
