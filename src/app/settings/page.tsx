/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { User, Lock, Mail, Save, Loader2, CheckCircle2, UserPlus, Trash2, Users, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"owner" | "manager" | null>(null);

  // Manager management state
  const [managers, setManagers] = useState<any[]>([]);
  const [showAddManager, setShowAddManager] = useState(false);
  const [newManager, setNewManager] = useState({ name: "", email: "", password: "" });
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerError, setManagerError] = useState("");
  const [managerSuccess, setManagerSuccess] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setEmail(data.user.email);
        setRole(data.user.role);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (role === "owner") fetchManagers();
  }, [role]);

  async function fetchManagers() {
    const res = await fetch("/api/users");
    if (res.ok) setManagers(await res.json());
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setPassword("");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Update failed.");
      }
    } catch {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setManagerLoading(true);
    setManagerError("");
    setManagerSuccess("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newManager),
      });
      const data = await res.json();
      if (res.ok) {
        setManagerSuccess(`Manager "${data.email}" added successfully!`);
        setNewManager({ name: "", email: "", password: "" });
        setShowAddManager(false);
        fetchManagers();
        setTimeout(() => setManagerSuccess(""), 4000);
      } else {
        setManagerError(data.error || "Failed to add manager.");
      }
    } catch {
      setManagerError("An error occurred.");
    } finally {
      setManagerLoading(false);
    }
  };

  const handleDeleteManager = async (id: string, managerEmail: string) => {
    if (!confirm(`Are you sure you want to remove the manager account "${managerEmail}"?`)) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchManagers();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted mt-2">Manage your administrative credentials and security preferences.</p>
      </header>

      {/* Owner Profile Settings */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-border bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold">{role === "owner" ? "Owner Profile" : "My Profile"}</h3>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">
                {role === "owner" ? "Administrative Access" : "Manager Account"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-4 md:p-8 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted ml-1 uppercase tracking-widest">
                Login Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="alaminice1617@gmail.com"
                  required
                />
              </div>
              <p className="text-[10px] text-muted ml-1">This email will be used for all system administrative tasks.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted ml-1 uppercase tracking-widest">
                New Security Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Enter new password to change"
                />
              </div>
              <p className="text-[10px] text-muted ml-1">Leave blank to keep current password.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Credentials updated successfully!
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Manager Management — Owner Only */}
      {role === "owner" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 md:p-6 border-b border-border bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold">Staff Accounts</h3>
                <p className="text-xs text-muted uppercase tracking-wider font-medium">
                  {managers.length} Manager{managers.length !== 1 ? "s" : ""} Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddManager(!showAddManager)}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Manager
            </button>
          </div>

          {/* Add Manager Form */}
          {showAddManager && (
            <div className="p-4 md:p-6 border-b border-border bg-blue-500/5">
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted">New Manager Account</h4>
              <form onSubmit={handleAddManager} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        placeholder="e.g. Rahim Uddin"
                        value={newManager.name}
                        onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Login Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="email"
                        required
                        placeholder="manager@example.com"
                        value={newManager.email}
                        onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="password"
                      required
                      placeholder="Set a password for this manager"
                      value={newManager.password}
                      onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                {managerError && (
                  <p className="text-red-400 text-sm">{managerError}</p>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddManager(false); setManagerError(""); }}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={managerLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {managerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Create Manager
                  </button>
                </div>
              </form>
            </div>
          )}

          {managerSuccess && (
            <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {managerSuccess}
            </div>
          )}

          {/* Manager List */}
          <div className="p-4 md:p-6">
            {managers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
                <p className="text-muted text-sm">No manager accounts yet.</p>
                <p className="text-xs text-muted mt-1">Add a manager to let them add products and process sales.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {managers.map((manager: any) => (
                  <div
                    key={manager._id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-border rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {(manager.name || manager.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{manager.name || "—"}</p>
                        <p className="text-xs text-muted">{manager.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                        Manager
                      </span>
                      <button
                        onClick={() => handleDeleteManager(manager._id, manager.email)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-400 transition-colors"
                        title="Remove manager"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Warning */}
      <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
        <h4 className="text-red-400 font-bold mb-2">Security Warning</h4>
        <p className="text-xs text-muted leading-relaxed">
          Changing your administrative email or password will require you to log in again on all devices. 
          Make sure you have recorded your new credentials in a safe place. 
          The default credentials will no longer work after this update.
        </p>
      </div>
    </div>
  );
}
