"use client";

import { useEffect, useState } from "react";
import { Plus, Package, MoreHorizontal, Search } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: "Rod",
    unit: "KG",
    price: 0,
    stock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else console.error("Data is not an array:", data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) {
      setShowAddModal(false);
      fetchProducts();
      setNewProduct({ name: "", brand: "", category: "Rod", unit: "KG", price: 0, stock: 0 });
    }
  }

  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    const res = await fetch(`/api/products/${selectedProduct._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedProduct),
    });
    if (res.ok) {
      setShowEditModal(false);
      fetchProducts();
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchProducts();
    }
  }

  const filteredProducts = products.filter((product: any) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted">Manage your stock and products.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-light-gray transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </header>

      {/* Filter & Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-white/5">
              <th className="p-4 font-medium text-muted">Brand</th>
              <th className="p-4 font-medium text-muted">Product Name</th>
              <th className="p-4 font-medium text-muted">Category</th>
              <th className="p-4 font-medium text-muted">Stock</th>
              <th className="p-4 font-medium text-muted">Unit Price</th>
              <th className="p-4 font-medium text-muted">Total Price</th>
              <th className="p-4 font-medium text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted">Loading inventory...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted">No products found.</td></tr>
            ) : (
              filteredProducts.map((product: any) => (
                <tr key={product._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{product.brand}</td>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs border border-border bg-white/5">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={product.stock < 10 ? "text-red-400 font-medium" : ""}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="p-4">৳ {product.price}</td>
                  {/* add comma for stock * price */}
                  <td className="p-4">৳ {product.stock * product.price.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSRM, Anwar"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Product Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10mm Rod, 50kg Cement"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, unit: e.target.value === "Rod" ? "KG" : "Bag" })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Rod">Rod</option>
                    <option value="Cement">Cement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Unit</label>
                  <input
                    type="text"
                    disabled
                    value={newProduct.unit}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Stock Amount</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Unit Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-light-gray transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Edit Product</h3>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={selectedProduct.brand}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, brand: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Product Description</label>
                <input
                  type="text"
                  required
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Category</label>
                  <select
                    value={selectedProduct.category}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value, unit: e.target.value === "Rod" ? "KG" : "Bag" })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Rod">Rod</option>
                    <option value="Cement">Cement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Unit</label>
                  <input
                    type="text"
                    disabled
                    value={selectedProduct.unit}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Stock Amount</label>
                  <input
                    type="number"
                    required
                    value={selectedProduct.stock}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Unit Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-light-gray transition-colors"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
