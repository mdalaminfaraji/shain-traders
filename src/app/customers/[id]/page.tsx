/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { Printer, ArrowLeft, Calendar, FileText, CreditCard } from "lucide-react";
import Link from "next/link";

export default function CustomerLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ledger/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) return <div className="p-8 text-center text-muted">Loading statement...</div>;
  if (!data) return <div className="p-8 text-center text-red-400">Customer not found.</div>;

  const { customer, ledger } = data;

  const totalDebit = ledger ? ledger.reduce((acc: number, entry: any) => entry.type === "Sale" ? acc + entry.amount : acc, 0) : 0;
  const totalCredit = ledger ? ledger.reduce((acc: number, entry: any) => {
    if (entry.type === "Payment") return acc + entry.amount;
    return acc + (entry.paid || 0);
  }, 0) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
        <Link href="/customers" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4 md:mb-0">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-light-gray transition-colors cursor-pointer w-full md:w-auto"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:flex justify-between items-start mb-8 pb-6 border-b-2 border-black">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">SHAHIN TRADERS</h1>
          <p className="text-xs font-bold text-gray-600">Modern Inventory & Trading Solutions</p>
          <p className="text-[10px] mt-2 text-gray-500">
            Lokhipasha, Narail, Bangladesh<br />
            Phone: +8801828152897 | Email: shahin@gmail.com
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase mb-2">Account Statement</h2>
          <div className="space-y-0.5 text-xs text-gray-700">
            <p><span className="font-bold text-black">Customer:</span> {customer.name}</p>
            <p><span className="font-bold text-black">Phone:</span> {customer.phone}</p>
            {customer.address && <p><span className="font-bold text-black">Address:</span> {customer.address}</p>}
            <p><span className="font-bold text-black">Date Generated:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-8 mb-8 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileText className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{customer.name}</h1>
            <p className="text-muted flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" /> Member since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
            <p className="text-muted flex items-center gap-2">
              Address: {customer.address || "N/A"} | Phone: {customer.phone}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl min-w-[240px]">
            <p className="text-sm text-muted font-medium mb-1 uppercase tracking-wider">Net Outstanding Balance</p>
            <p className={`text-3xl font-black ${customer.balance > 0 ? "text-red-400" : "text-emerald-400"}`}>
              ৳ {customer.balance.toLocaleString()}
            </p>
            {/* <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-muted">
              <span>Credit Limit</span>
              <span>৳ {customer.creditLimit.toLocaleString()}</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border bg-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg">Transaction History (Ledger)</h3>
          <span className="text-xs text-muted">Showing all sales and payments</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-widest text-muted">
              <th className="p-4 pl-6 font-medium">Date</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium text-right">Debit (Purchases)</th>
              <th className="p-4 font-medium text-right">Credit (Payments)</th>
              <th className="p-4 font-medium text-right">Running Balance</th>
              <th className="p-4 pr-6 font-medium text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!data || !Array.isArray(ledger) || ledger.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted italic">No transactions recorded yet.</td></tr>
            ) : (() => {
              let runningBalance = 0;
              return ledger.map((entry: any) => {
                if (entry.type === "Sale") runningBalance += entry.due;
                if (entry.type === "Payment") runningBalance -= entry.amount;

                return (
                  <tr key={entry._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {entry.type === "Sale" ? (
                        <div className="flex items-center gap-2">
                          <ShoppingCartIcon />
                          <span>Invoice #{entry._id.slice(-6).toUpperCase()}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CreditCard className="w-4 h-4" />
                          <span>Payment ({entry.method})</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {entry.type === "Sale" ? `৳ ${entry.amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-4 text-right font-medium text-emerald-400">
                      {entry.type === "Payment" ? `৳ ${entry.amount.toLocaleString()}` : (entry.paid > 0 ? `৳ ${entry.paid.toLocaleString()}` : "-")}
                    </td>
                    <td className="p-4 text-right font-bold">
                      ৳ {runningBalance.toLocaleString()}
                    </td>
                    <td className="p-4 pr-6 text-right no-print">
                      <Link 
                        href={entry.type === "Sale" ? `/sales/${entry._id}/print` : `/payments/${entry._id}/print`}
                        className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </Link>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>

    {/* Statement Summary (Print Only) */}
    <div className="hidden print:flex justify-end mt-6">
      <div className="w-80 space-y-2 border-t-2 border-black pt-4">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-gray-600">Total Purchases (Debit):</span>
          <span className="font-bold">৳ {totalDebit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-medium text-gray-600">Total Paid (Credit):</span>
          <span className="font-bold print-text-emerald">৳ {totalCredit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-black border-t border-black pt-2">
          <span>Net Balance Due:</span>
          <span className={customer.balance > 0 ? "print-text-red" : "print-text-emerald"}>
            ৳ {customer.balance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-dashed border-gray-300">
        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-500">
            <p>Shahin Traders | Modern Inventory Management System</p>
            <p>Generated on {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="w-48 border-t border-black mb-1"></div>
            <p className="text-xs font-bold uppercase">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingCartIcon() {
  return (
    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
