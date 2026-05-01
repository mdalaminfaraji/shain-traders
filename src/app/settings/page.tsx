"use client";

import { useState, useEffect } from "react";
import { User, Lock, Mail, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setEmail(data.user.email);
      }
    }
    fetchUser();
  }, []);

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
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted mt-2">Manage your administrative credentials and security preferences.</p>
      </header>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold">Owner Profile</h3>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Administrative Access</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-8">
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

      <div className="mt-8 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
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
