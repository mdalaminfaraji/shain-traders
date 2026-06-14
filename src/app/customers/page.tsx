/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Search, Phone, MapPin, PencilIcon, Trash2, X } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [role, setRole] = useState<"owner" | "manager" | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    // creditLimit: 0,
  });

  useEffect(() => {
    fetchCustomers();
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user?.role) setRole(d.user.role); });
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
      else console.error("Data is not an array:", data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });
    if (res.ok) {
      setShowAddModal(false);
      fetchCustomers();
      setNewCustomer({ name: "", phone: "", address: ""});
    }
  }

  async function handleEditCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomer) return;

    const res = await fetch(`/api/customers/${selectedCustomer._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedCustomer),
    });
    if (res.ok) {
      setShowEditModal(false);
      fetchCustomers();
    }
  }

  async function handleDeleteCustomer(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this customer? All their transaction history will be lost.")) return;

    const res = await fetch(`/api/customers/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchCustomers();
    }
  }

  const filteredCustomers = customers.filter((customer: any) => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row gap-3 md:justify-between justify-start md:items-center items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted">Manage your customer relationships and balances.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-light-gray transition-colors w-full md:w-fit justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </header>

      {/* Filter & Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted col-span-full text-center py-12">Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-muted col-span-full text-center py-12">No customers found.</p>
        ) : (
          filteredCustomers.map((customer: any) => (
            <Link
              key={customer._id}
              href={`/customers/${customer._id}`}
              className="group bg-card border border-border rounded-xl p-6 hover:border-accent transition-all cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Users className="w-5 h-5 text-muted group-hover:text-foreground" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                        setShowEditModal(true);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-md text-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    {role === "owner" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 hover:bg-red-500/10 rounded-md text-muted hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Current Balance</p>
                    <p className={`text-lg font-bold ${customer.balance > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      ৳ {customer.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">{customer.name}</h3>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{customer.address || "No address"}</span>
                </div>
              </div>
              {/* <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted">Credit Limit: ৳ {customer.creditLimit.toLocaleString()}</span>
                <ChevronRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
              </div> */}
            </Link>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Register New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahim Uddin"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01700000000"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Address</label>
                <textarea
                  placeholder="Customer address..."
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent h-24 resize-none"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-muted mb-1">Credit Limit (৳)</label>
                <input
                  type="number"
                  required
                  value={newCustomer.creditLimit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div> */}
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Edit Customer</h3>
            <form onSubmit={handleEditCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={selectedCustomer.name}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={selectedCustomer.phone}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Address</label>
                <textarea
                  value={selectedCustomer.address}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent h-24 resize-none"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-muted mb-1">Credit Limit (৳)</label>
                <input
                  type="number"
                  required
                  value={selectedCustomer.creditLimit}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, creditLimit: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div> */}
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
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 ">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete <span className="font-bold text-foreground">{selectedCustomer.name}</span>? 
              This action cannot be undone and all their transaction history will be permanently removed.
            </p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteCustomer(e, selectedCustomer._id);
                  setShowDeleteModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors cursor-pointer"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
