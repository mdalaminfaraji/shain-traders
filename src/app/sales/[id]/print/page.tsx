"use client";

import { useEffect, useState, use } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SalePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sales/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSale(data);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) return <div className="p-8 text-center">Loading invoice...</div>;
  if (!sale || sale.error) return <div className="p-8 text-center text-red-400">Invoice not found.</div>;

  const { customerId: customer, items, totalAmount, paidAmount, balanceDue, date, _id } = sale;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-black min-h-screen">
      <div className="no-print flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl">
        <Link href={`/customers/${customer._id}`} className="flex items-center gap-2 text-gray-600 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> Back to Ledger
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      <div className="border-2 border-black p-8 rounded-sm">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">SHAHIN TRADERS</h1>
            <p className="text-sm font-bold">Modern Inventory & Trading Solutions</p>
            <p className="text-xs mt-4 opacity-70">
              Lokhipasha, Narail, Bangladesh<br />
              Phone: +8801828152897<br />
              Email: shahin@gmail.com
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase mb-4">Invoice</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-bold">Invoice #:</span> {_id.slice(-8).toUpperCase()}</p>
              <p><span className="font-bold">Date:</span> {new Date(date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <p className="text-xs font-bold uppercase text-gray-500 mb-2">Bill To:</p>
          <h3 className="text-xl font-bold">{customer.name}</h3>
          <p className="text-sm">{customer.address || "No Address Provided"}</p>
          <p className="text-sm">Phone: {customer.phone}</p>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-black text-left text-xs uppercase font-bold">
              <th className="py-2">Item Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item: any, index: number) => (
              <tr key={index} className="text-sm">
                <td className="py-4">
                  <p className="font-medium">{item.productId?.name || "Unknown Product"}</p>
                  {item.laborCost > 0 && (
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Incl. Labor Cost (0.2/kg)</p>
                  )}
                </td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">৳ {item.rate.toLocaleString()}</td>
                <td className="py-4 text-right font-bold">৳ {item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>৳ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-emerald-600 font-medium">
              <span>Amount Paid:</span>
              <span>৳ {paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-black border-t-2 border-black pt-3">
              <span>Total Due:</span>
              <span>৳ {balanceDue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-24 flex justify-between items-end">
          <div className="text-[10px] text-gray-400">
            <p>Thank you for your business!</p>
            <p>This is a computer generated invoice.</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-t border-black mb-1"></div>
            <p className="text-xs font-bold uppercase">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
