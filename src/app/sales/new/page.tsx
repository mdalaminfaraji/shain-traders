/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  // New Search & Filter States
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [customerSearch, setCustomerSearch] = useState("");

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

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.phone.includes(customerSearch)
  );

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
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-[500px]">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 whitespace-nowrap">
                <Search className="w-4 h-4 text-accent" /> Select Products
              </h3>
              
              <div className="flex flex-1 gap-2 w-full max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search by name or brand..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted italic">
                    No products found matching your search.
                  </div>
                ) : (
                  filteredProducts.map((product: any) => (
                    <button
                      key={product._id}
                      onClick={() => addToCart(product)}
                      className="flex flex-col text-left p-4 border border-border rounded-xl hover:border-accent hover:bg-white/5 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{product.brand}</span>
                      <span className="font-bold text-sm line-clamp-1">{product.name}</span>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                        <span className="text-accent font-bold text-sm">৳ {product.price.toLocaleString()}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${product.stock < 10 ? "bg-red-500/10 text-red-400" : "bg-white/5 text-muted"}`}>
                          {product.stock} {product.unit}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-[400px]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-accent" /> Cart Items
              <span className="ml-auto text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted space-y-2">
                  <ShoppingCart className="w-8 h-8 opacity-20" />
                  <p className="text-sm italic">Your cart is empty.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="text-left border-b border-border">
                      <th className="pb-3 font-bold text-[10px] text-muted uppercase tracking-widest">Item Detail</th>
                      <th className="pb-3 font-bold text-[10px] text-muted uppercase tracking-widest">Rate</th>
                      <th className="pb-3 font-bold text-[10px] text-muted uppercase tracking-widest">Quantity</th>
                      <th className="pb-3 font-bold text-[10px] text-muted uppercase tracking-widest text-right">Total</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {cart.map((item: any) => (
                      <tr key={item.productId} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-foreground leading-none mb-1">{item.name}</p>
                          <p className="text-[10px] text-muted uppercase tracking-tighter">{item.brand} • {item.category}</p>
                        </td>
                        <td className="py-4">
                          <p className="font-medium text-sm">৳ {item.rate.toLocaleString()}</p>
                          {item.laborCost > 0 && <p className="text-[9px] text-emerald-400">+৳ {item.laborCost}/kg labor</p>}
                        </td>
                        <td className="py-4">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setCart(cart.map((i: any) =>
                                i.productId === item.productId 
                                  ? { ...i, quantity: val, total: val * (i.rate + (i.laborCost || 0)) } 
                                  : i
                              ));
                            }}
                            className="w-20 bg-background border border-border rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="py-4 text-right">
                          <p className="font-bold text-accent">৳ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => removeFromCart(item.productId)} 
                            className="text-muted hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
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
        </div>

        {/* Right: Checkout */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-8">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-accent" /> Order Summary
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Name or Phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Select Customer</label>
                  <select
                    required
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Choose a customer...</option>
                    {filteredCustomers.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
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
