import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth, getRoleFromEmail, getRoleHome } from "../contexts/AuthContext";
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Button from "../components/Button";

export default function LoginPage() {
  const { user, role, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && role) return <Navigate to={getRoleHome(role)} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      const detectedRole = getRoleFromEmail(email);
      navigate(getRoleHome(detectedRole));
    } catch (err) {
      const messages = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/invalid-email": "Please enter a valid email.",
      };
      setError(messages[err.code] || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">RoadAudit</h1>
          <p className="text-slate-500 mt-1">Road Safety Audit System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 bg-white/80 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Role Detection (by email):</p>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500">
            <div className="bg-red-50 rounded-lg px-2 py-1.5 text-center">
              <span className="font-bold text-red-700 block">Admin</span>
              email has "admin"
            </div>
            <div className="bg-purple-50 rounded-lg px-2 py-1.5 text-center">
              <span className="font-bold text-purple-700 block">Designer</span>
              email has "designer"
            </div>
            <div className="bg-indigo-50 rounded-lg px-2 py-1.5 text-center">
              <span className="font-bold text-indigo-700 block">Auditor</span>
              all others
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
