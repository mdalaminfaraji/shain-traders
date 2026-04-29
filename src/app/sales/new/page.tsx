"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [cart, setCart] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        else console.error("Customers data is not an array:", data);
      })
      .catch(err => console.error("Failed to fetch customers:", err));

    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else console.error("Products data is not an array:", data);
      })
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  const addToCart = (product: any) => {
    const isRod = product.category === "Rod";
    const laborCostPerUnit = isRod ? 0.2 : 0; // 0.2 Taka per KG (20% of weight)
    const finalRate = product.price + laborCostPerUnit;

    const existing = cart.find((item: any) => item.productId === product._id);
    if (existing) {
      setCart(cart.map((item: any) =>
        item.productId === product._id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * finalRate } 
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        quantity: 1,
        rate: product.price,
        laborCost: laborCostPerUnit,
        total: finalRate
      }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item: any) => item.productId !== id));
  };

  const totalAmount = cart.reduce((acc, item: any) => acc + item.total, 0);
  const balanceDue = totalAmount - paidAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomer || cart.length === 0) return;

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: selectedCustomer,
        items: cart,
        totalAmount,
        paidAmount,
        balanceDue,
        date: new Date()
      }),
    });

    if (res.ok) {
      router.push("/customers/" + selectedCustomer);
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">New Sale</h2>
        <p className="text-muted">Create a new invoice for a customer.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Select Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products?.map((product: any) => (
                <button
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="flex flex-col text-left p-4 border border-border rounded-lg hover:border-accent transition-all group"
                >
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">{product.brand}</span>
                  <span className="font-bold text-lg">{product.name}</span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-accent font-bold">৳ {product.price}</span>
                    <span className={`text-xs ${product.stock < 10 ? "text-red-400" : "text-muted"}`}>Stock: {product.stock} {product.unit}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Cart Items
            </h3>
            {cart.length === 0 ? (
              <p className="text-center py-8 text-muted italic">Cart is empty. Select products from above.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pb-4 font-medium text-muted">Item</th>
                    <th className="pb-4 font-medium text-muted">Rate</th>
                    <th className="pb-4 font-medium text-muted">Qty</th>
                    <th className="pb-4 font-medium text-muted">Total</th>
                    <th className="pb-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.map((item: any) => (
                    <tr key={item.productId}>
                      <td className="py-4">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-muted">{item.brand}</p>
                      </td>
                      <td className="py-4">৳ {item.rate}</td>
                      <td className="py-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCart(cart.map((i: any) =>
                              i.productId === item.productId 
                                ? { ...i, quantity: val, total: val * (i.rate + (i.laborCost || 0)) } 
                                : i
                            ));
                          }}
                          className="w-16 bg-background border border-border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="py-4 font-bold">
                        <p>৳ {item.total}</p>
                        {item.laborCost > 0 && (
                          <p className="text-[10px] text-emerald-400 font-medium">Incl. ৳ {item.laborCost * item.quantity} labor</p>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-400 p-2 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Checkout */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-8">
            <h3 className="font-bold mb-6">Order Summary</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Customer</label>
                <select
                  required
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">Select a customer</option>
                  {customers?.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 py-4 border-t border-b border-border">
                <div className="flex justify-between text-muted">
                  <span>Product Subtotal</span>
                  <span>৳ {cart.reduce((acc, i: any) => acc + (i.rate * i.quantity), 0)}</span>
                </div>
                {cart.some((i: any) => i.laborCost > 0) && (
                  <div className="flex justify-between text-emerald-400 text-sm">
                    <span>Labor Cost (0.2/kg)</span>
                    <span>৳ {cart.reduce((acc, i: any) => acc + ((i.laborCost || 0) * i.quantity), 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2">
                  <span>Total Amount</span>
                  <span>৳ {totalAmount}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Paid Amount (৳)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-lg font-bold text-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-border">
                <p className="text-sm text-muted mb-1">Remaining Balance Due</p>
                <p className="text-2xl font-bold text-red-400">৳ {balanceDue}</p>
              </div>

              <button
                type="submit"
                disabled={!selectedCustomer || cart.length === 0}
                className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-light-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Transaction
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
