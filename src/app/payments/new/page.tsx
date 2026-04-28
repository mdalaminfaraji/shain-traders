"use client";

import { useEffect, useState } from "react";
import { CreditCard, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecordPaymentPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState({
    customerId: "",
    amount: 0,
    method: "Cash",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/customers").then(res => res.json()).then(data => setCustomers(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });

    if (res.ok) {
      router.push("/customers/" + payment.customerId);
    } else {
      setLoading(false);
    }
  }

  const selectedCustData = customers.find((c: any) => c._id === payment.customerId) as any;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/customers" className="flex items-center gap-2 text-muted hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <header className="mb-10 text-center">
        <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Record Payment</h2>
        <p className="text-muted mt-2">Log a payment received from a customer to update their balance.</p>
      </header>

      <div className="bg-card border border-border rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Select Customer</label>
            <select
              required
              value={payment.customerId}
              onChange={(e) => setPayment({ ...payment, customerId: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-accent appearance-none"
            >
              <option value="">Select a customer</option>
              {customers.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name} (৳ {c.balance.toLocaleString()})</option>
              ))}
            </select>
          </div>

          {selectedCustData && (
            <div className="p-4 bg-white/5 border border-border rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Current Balance Outstanding</span>
                <span className="text-xl font-bold text-red-400">৳ {selectedCustData.balance.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Payment Amount (৳)</label>
              <input
                type="number"
                required
                min="1"
                value={payment.amount}
                onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-2xl font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Method</label>
              <select
                value={payment.method}
                onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Reference / Check No. (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Check #12345"
              value={payment.reference}
              onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Internal Notes</label>
            <textarea
              placeholder="Add any additional details..."
              value={payment.notes}
              onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !payment.customerId || payment.amount <= 0}
            className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-light-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
