import { Link, useLocation } from "react-router-dom";
import { useAuth, getRoleHome } from "../contexts/AuthContext";
import {
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const NAV_BY_ROLE = {
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/audits", label: "All Audits" },
  ],
  designer: [
    { to: "/designer", label: "Dashboard" },
  ],
  auditor: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/history", label: "History" },
  ],
};

const ROLE_LABELS = {
  admin: "Admin",
  designer: "Designer",
  auditor: "Auditor",
};

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700",
  designer: "bg-purple-100 text-purple-700",
  auditor: "bg-indigo-100 text-indigo-700",
};

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE.auditor;
  const homeLink = getRoleHome(role);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      /* handled by auth state listener */
    }
  }

  function isActive(path) {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path === "/designer" && location.pathname === "/designer") return true;
    if (path !== "/admin" && path !== "/dashboard" && path !== "/designer") {
      return location.pathname.startsWith(path);
    }
    return false;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={homeLink} className="flex items-center gap-2 font-bold text-lg text-indigo-600">
            <ShieldCheckIcon className="w-7 h-7" />
            <span className="hidden sm:inline">RoadAudit</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {role && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            )}
            <span className="text-sm text-slate-500 truncate max-w-[200px]">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="px-4 flex items-center gap-2">
                {role && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                )}
                <span className="text-sm text-slate-500 truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 w-full px-4 py-2.5 mt-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
