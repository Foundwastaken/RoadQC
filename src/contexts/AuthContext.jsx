import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function getRoleFromEmail(email) {
  if (!email) return "auditor";
  const lower = email.toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("designer")) return "designer";
  return "auditor";
}

export function getRoleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "designer") return "/designer";
  return "/dashboard";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const detectedRole = getRoleFromEmail(firebaseUser.email);
        setRole(detectedRole);
        localStorage.setItem("userRole", detectedRole);
      } else {
        setRole(null);
        localStorage.removeItem("userRole");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    localStorage.removeItem("userRole");
    return signOut(auth);
  }

  const value = { user, role, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
