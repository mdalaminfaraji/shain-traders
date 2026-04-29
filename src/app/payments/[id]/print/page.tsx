"use client";

import { useEffect, useState, use } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/payments/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPayment(data);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) return <div className="p-8 text-center">Loading receipt...</div>;
  if (!payment || payment.error) return <div className="p-8 text-center text-red-400">Payment record not found.</div>;

  const { customerId: customer, amount, method, reference, date, notes, _id } = payment;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white text-black min-h-screen">
      <div className="no-print flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl">
        <Link href={`/customers/${customer._id}`} className="flex items-center gap-2 text-gray-600 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> Back to Ledger
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      <div className="border-4 border-double border-black p-12 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-100 rotate-45 flex items-center justify-center pt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] -rotate-45">Official</p>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black uppercase tracking-widest mb-1">SHAHIN TRADERS</h1>
          <p className="text-sm font-bold border-y border-black py-1 inline-block px-4">PAYMENT RECEIPT</p>
        </div>

        <div className="flex justify-between mb-12 text-sm">
          <div>
            <p><span className="font-bold">Receipt #:</span> {_id.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <p><span className="font-bold">Date:</span> {new Date(date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-6 text-lg">
          <div className="flex border-b border-dotted border-black pb-1">
            <span className="font-medium whitespace-nowrap mr-4">Received From:</span>
            <span className="font-black italic flex-1">{customer.name}</span>
          </div>
          
          <div className="flex border-b border-dotted border-black pb-1">
            <span className="font-medium whitespace-nowrap mr-4">The Sum of:</span>
            <span className="font-black italic flex-1">৳ {amount.toLocaleString()} Only</span>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex border-b border-dotted border-black pb-1">
              <span className="font-medium whitespace-nowrap mr-4">Payment Method:</span>
              <span className="font-black italic flex-1">{method}</span>
            </div>
            <div className="flex border-b border-dotted border-black pb-1">
              <span className="font-medium whitespace-nowrap mr-4">Reference:</span>
              <span className="font-black italic flex-1">{reference || "N/A"}</span>
            </div>
          </div>

          {notes && (
            <div className="flex border-b border-dotted border-black pb-1">
              <span className="font-medium whitespace-nowrap mr-4">Notes:</span>
              <span className="italic flex-1 text-base">{notes}</span>
            </div>
          )}
        </div>

        <div className="mt-16 flex justify-between items-center">
          <div className="bg-gray-100 border-2 border-black p-4 inline-block">
            <p className="text-xs font-bold uppercase mb-1">Total Amount</p>
            <p className="text-3xl font-black">৳ {amount.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-t border-black mb-1"></div>
            <p className="text-xs font-bold uppercase">Authorized Receiver</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-400">
        <p>This is a computer generated payment receipt. No signature is required unless requested.</p>
        <p>Shahin Traders | Modern Inventory Management</p>
      </div>
    </div>
  );
}
