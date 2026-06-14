/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, PencilIcon } from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";
import CommonConformationModal from "./_components/CommonConformationModal";
import { toast } from "react-toastify";

const CATEGORIES = [
  { value: "Rod", label: "রড (Rod)" },
  { value: "Cement", label: "সিমেন্ট (Cement)" },
  { value: "Plumber", label: "প্লাম্বার (Plumber)" },
  { value: "Sanitary", label: "স্যানিটারি (Sanitary)" },
  { value: "Others", label: "অন্যান্য (Others)" },
];

const BRANDS_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  Rod: [
    { value: "BSRM", label: "BSRM" },
    { value: "KSRM", label: "KSRM" },
    { value: "GPH Ispat", label: "GPH Ispat" },
    { value: "Abul Khair Steel", label: "Abul Khair Steel" },
  ],
  Cement: [
    { value: "Shah Cement", label: "Shah Cement" },
    { value: "Seven Rings Cement", label: "Seven Rings Cement" },
    { value: "Crown Cement", label: "Crown Cement" },
    { value: "Premier Cement", label: "Premier Cement" },
  ],
  Plumber: [
    { value: "RFL", label: "RFL" },
    { value: "Lira", label: "Lira" },
    { value: "National", label: "National" },
  ],
  Sanitary: [
    { value: "Stella", label: "Stella" },
    { value: "Charu", label: "Charu" },
    { value: "RAK", label: "RAK" },
  ],
};

const ROD_SIZES = [
  { value: "8 mm", label: "8 mm" },
  { value: "10 mm", label: "10 mm" },
  { value: "12 mm", label: "12 mm" },
  { value: "16 mm", label: "16 mm" },
  { value: "20 mm", label: "20 mm" },
  { value: "22 mm", label: "22 mm" },
  { value: "25 mm", label: "25 mm" },
  { value: "28 mm", label: "28 mm" },
  { value: "32 mm", label: "32 mm" },
  { value: "40 mm", label: "40 mm" },
  { value: "50 mm", label: "50 mm" },
];

const COMMON_UNITS = [
  { value: "KG", label: "KG" },
  { value: "Bag", label: "Bag (বস্তা)" },
  { value: "Pcs", label: "Pcs (পিস)" },
  { value: "Feet", label: "Feet (ফিট)" },
  { value: "Set", label: "Set (সেট)" },
  { value: "Ltr", label: "Ltr (লিটার)" },
];

const extractRodSize = (name: string) => {
  const match = name.match(/(\d+\s*mm)/i);
  return match ? match[1].toLowerCase().replace("mm", " mm") : "";
};

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [role, setRole] = useState<"owner" | "manager" | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: "Rod",
    unit: "KG",
    price: 0,
    stock: 0,
  });

  const [newProductSize, setNewProductSize] = useState("");
  const [editProductSize, setEditProductSize] = useState("");

  const [tonInput, setTonInput] = useState("");
  const [kgInput, setKgInput] = useState("");

  const formatStock = (stock: number, category: string, unit: string) => {
    if (category === "Rod") {
      const tons = Math.floor(stock / 1000);
      const kgs = stock % 1000;
      let result = "";
      if (tons > 0) result += `${tons} ton `;
      if (kgs > 0 || tons === 0) result += `${kgs} kg`;
      return result.trim();
    }
    return `${stock} ${unit}`;
  };

  useEffect(() => {
    fetchProducts();
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user?.role) setRole(d.user.role); });
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
      setNewProductSize("");
      setTonInput("");
      setKgInput("");
      toast.success("Product added successfully");
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
      setEditProductSize("");
      setTonInput("");
      setKgInput("");
      toast.success("Product updated successfully");
    }
  }

  const handleOpenEditModal = (product: any) => {
    setSelectedProduct(product);
    if (product.category === "Rod") {
      setTonInput(Math.floor(product.stock / 1000).toString());
      setKgInput((product.stock % 1000).toString());
      setEditProductSize(extractRodSize(product.name));
    } else {
      setTonInput("");
      setKgInput("");
      setEditProductSize("");
    }
    setShowEditModal(true);
  };

  async function handleDeleteProduct(id: string) {

    

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchProducts();
      toast.success("Product deleted successfully");
    }
  }

  const filteredProducts = products.filter((product: any) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <header className="flex md:flex-row flex-col gap-3 md:justify-between justify-start md:items-center items-start mb-8">
        <div className="flex flex-col gap-1 items-start">
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted  ">Manage your stock and products.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-light-gray transition-colors w-full md:w-fit justify-center cursor-pointer"
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
                      {formatStock(product.stock, product.category, product.unit)}
                    </span>
                  </td>
                  <td className="p-4">৳ {product.price.toLocaleString()}</td>
                  <td className="p-4 font-bold text-accent">৳ {(product.stock * product.price).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {role === "owner" && (
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 rotate-45" />
                        </button>
                      )}
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
                <SearchableSelect
                  label="Category"
                  placeholder="Select category..."
                  options={CATEGORIES}
                  value={newProduct.category}
                  onChange={(val) => {
                    const isRod = val === "Rod";
                    const isCement = val === "Cement";
                    const defaultUnit = isRod ? "KG" : isCement ? "Bag" : "Pcs";
                    setNewProduct({
                      ...newProduct,
                      category: val,
                      brand: "",
                      unit: defaultUnit,
                      name: isRod ? "" : newProduct.name,
                    });
                    if (!isRod) {
                      setNewProductSize("");
                    }
                  }}
                  required
                />
              </div>

              <div>
                <SearchableSelect
                  label="Brand Name"
                  placeholder="Select or search brand..."
                  options={BRANDS_BY_CATEGORY[newProduct.category] || []}
                  value={newProduct.brand}
                  onChange={(val) => setNewProduct({ ...newProduct, brand: val })}
                  allowCustom={true}
                  required
                />
              </div>

              {newProduct.category === "Rod" && (
                <div>
                  <SearchableSelect
                    label="Size"
                    placeholder="Select size..."
                    options={ROD_SIZES}
                    value={newProductSize}
                    onChange={(val) => {
                      setNewProductSize(val);
                      setNewProduct((prev) => ({ ...prev, name: `${val} Rod` }));
                    }}
                    allowCustom={true}
                    required
                  />
                </div>
              )}

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
                <div className="col-span-2">
                  {newProduct.category === "Rod" || newProduct.category === "Cement" ? (
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Unit</label>
                      <input
                        type="text"
                        disabled
                        value={newProduct.unit}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
                      />
                    </div>
                  ) : (
                    <SearchableSelect
                      label="Unit"
                      placeholder="Select unit..."
                      options={COMMON_UNITS}
                      value={newProduct.unit}
                      onChange={(val) => setNewProduct({ ...newProduct, unit: val })}
                      allowCustom={true}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {newProduct.category === "Rod" ? (
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Stock (Tons)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1.5"
                        value={tonInput}
                        onChange={(e) => {
                          setTonInput(e.target.value);
                          const tons = parseFloat(e.target.value) || 0;
                          const kgs = parseFloat(kgInput) || 0;
                          setNewProduct({ ...newProduct, stock: Math.round(tons * 1000 + kgs) });
                        }}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Stock (KG)</label>
                      <input
                        type="number"
                        placeholder="e.g. 200"
                        value={kgInput}
                        onChange={(e) => {
                          setKgInput(e.target.value);
                          const tons = parseFloat(tonInput) || 0;
                          const kgs = parseFloat(e.target.value) || 0;
                          setNewProduct({ ...newProduct, stock: Math.round(tons * 1000 + kgs) });
                        }}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted italic">Total: {newProduct.stock} KG</p>
                    </div>
                  </div>
                ) : (
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
                )}
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
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-light-gray transition-colors cursor-pointer"
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
                <SearchableSelect
                  label="Category"
                  placeholder="Select category..."
                  options={CATEGORIES}
                  value={selectedProduct.category}
                  onChange={(val) => {
                    const isRod = val === "Rod";
                    const isCement = val === "Cement";
                    const defaultUnit = isRod ? "KG" : isCement ? "Bag" : "Pcs";
                    setSelectedProduct({
                      ...selectedProduct,
                      category: val,
                      brand: "",
                      unit: defaultUnit,
                      name: isRod ? "" : selectedProduct.name,
                    });
                    if (!isRod) {
                      setEditProductSize("");
                    }
                  }}
                  required
                />
              </div>

              <div>
                <SearchableSelect
                  label="Brand Name"
                  placeholder="Select or search brand..."
                  options={BRANDS_BY_CATEGORY[selectedProduct.category] || []}
                  value={selectedProduct.brand}
                  onChange={(val) => setSelectedProduct({ ...selectedProduct, brand: val })}
                  allowCustom={true}
                  required
                />
              </div>

              {selectedProduct.category === "Rod" && (
                <div>
                  <SearchableSelect
                    label="Size"
                    placeholder="Select size..."
                    options={ROD_SIZES}
                    value={editProductSize}
                    onChange={(val) => {
                      setEditProductSize(val);
                      setSelectedProduct((prev: any) => ({ ...prev, name: `${val} Rod` }));
                    }}
                    allowCustom={true}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Product Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10mm Rod, 50kg Cement"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  {selectedProduct.category === "Rod" || selectedProduct.category === "Cement" ? (
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Unit</label>
                      <input
                        type="text"
                        disabled
                        value={selectedProduct.unit}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
                      />
                    </div>
                  ) : (
                    <SearchableSelect
                      label="Unit"
                      placeholder="Select unit..."
                      options={COMMON_UNITS}
                      value={selectedProduct.unit}
                      onChange={(val) => setSelectedProduct({ ...selectedProduct, unit: val })}
                      allowCustom={true}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedProduct.category === "Rod" ? (
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Stock (Tons)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1.5"
                        value={tonInput}
                        onChange={(e) => {
                          setTonInput(e.target.value);
                          const tons = parseFloat(e.target.value) || 0;
                          const kgs = parseFloat(kgInput) || 0;
                          setSelectedProduct({ ...selectedProduct, stock: Math.round(tons * 1000 + kgs) });
                        }}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Stock (KG)</label>
                      <input
                        type="number"
                        placeholder="e.g. 200"
                        value={kgInput}
                        onChange={(e) => {
                          setKgInput(e.target.value);
                          const tons = parseFloat(tonInput) || 0;
                          const kgs = parseFloat(e.target.value) || 0;
                          setSelectedProduct({ ...selectedProduct, stock: Math.round(tons * 1000 + kgs) });
                        }}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted italic">Total: {selectedProduct.stock} KG</p>
                    </div>
                  </div>
                ) : (
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
                )}
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
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-light-gray transition-colors cursor-pointer"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommonConformationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        onConfirm={() => handleDeleteProduct(selectedProduct._id)}
      />
    </div>
  );
}

