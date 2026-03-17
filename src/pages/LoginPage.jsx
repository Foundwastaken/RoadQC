import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth, getRoleFromEmail, getRoleHome } from "../contexts/AuthContext";
import { EnvelopeIcon, LockClosedIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const HERO_IMG = "/hero-highway.png";
const GRSA_LOGO = "/grsa-logo.jpg";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "guidelines", label: "Guidelines" },
  { id: "login", label: "Login" },
  { id: "contact", label: "Contact" },
];

export default function LoginPage() {
  const { user, role, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const sectionRefs = {
    home: useRef(null),
    about: useRef(null),
    guidelines: useRef(null),
    login: useRef(null),
    contact: useRef(null),
  };

  if (user && role) return <Navigate to={getRoleHome(role)} replace />;

  function scrollTo(id) {
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNav(false);
  }

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
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top utility bar */}
      <div className="bg-[#0a1628] text-white/80">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-7 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-2 sm:gap-4 truncate">
            <span>Government of Gujarat</span>
            <span className="opacity-30">|</span>
            <span className="hidden xs:inline">Roads & Buildings Department</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 opacity-60">
            <span>Skip to Content</span>
            <span className="opacity-40">|</span>
            <span>A- A A+</span>
          </div>
        </div>
      </div>

      {/* Department header */}
      <div className="bg-[#0d47a1] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={GRSA_LOGO}
              alt="Gujarat Road Safety Authority"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover bg-white flex-shrink-0 border-2 border-white/30 shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-tight">
                Road Safety Audit System
              </h1>
              <p className="text-[11px] sm:text-sm text-blue-200 mt-0.5">
                Gujarat Road Safety Authority — Government of Gujarat
              </p>
              <p className="text-[10px] text-blue-300/60 hidden sm:block">Each Road, Safe Road</p>
            </div>
            <img
              src={GRSA_LOGO}
              alt="GRSA"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover bg-white flex-shrink-0 border-2 border-white/20 hidden md:block"
            />
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-[#1565c0] border-t border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-10 md:h-11">
            <div className="hidden md:flex items-center gap-0.5 text-[13px] font-medium text-white/90">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="px-4 py-1.5 hover:bg-white/15 rounded transition-colors cursor-pointer whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden p-1.5 rounded hover:bg-white/15 transition-colors cursor-pointer text-white"
            >
              {mobileNav ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
            <span className="md:hidden text-xs text-white/70 font-medium">Menu</span>
          </div>
        </div>
        {mobileNav && (
          <div className="md:hidden bg-[#0d47a1] border-t border-white/10 px-4 py-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 rounded transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <div ref={sectionRefs.home} className="relative h-52 sm:h-64 md:h-80 lg:h-[360px] overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Gujarat Highway"
          className="w-full h-full object-cover object-[center_40%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d47a1]/85 via-[#0d47a1]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-3">
                <img src={GRSA_LOGO} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white object-cover border-2 border-white/40 shadow-lg" />
                <div className="h-8 w-px bg-white/30 hidden sm:block" />
                <span className="text-white/70 text-[10px] sm:text-xs font-medium tracking-wider uppercase hidden sm:block">Gujarat Road Safety Authority</span>
              </div>
              <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg leading-tight">
                Road Safety<br />Audit System
              </h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base mt-2 sm:mt-3 drop-shadow leading-relaxed">
                A comprehensive digital platform for conducting, managing, and tracking
                road safety audits across the State of Gujarat under IRC SP 88 guidelines.
              </p>
              <div className="flex items-center gap-3 mt-3 sm:mt-4">
                <button
                  onClick={() => scrollTo("login")}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-[#0d47a1] font-semibold text-xs sm:text-sm rounded-lg hover:bg-blue-50 transition-colors cursor-pointer shadow-lg"
                >
                  Login to Portal
                </button>
                <button
                  onClick={() => scrollTo("about")}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/10 text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer border border-white/20 backdrop-blur-sm"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10">

          {/* Login + Stats row — mobile first */}
          <div ref={sectionRefs.login} className="scroll-mt-14">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Login form */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-[#0d47a1] px-4 sm:px-6 py-3">
                    <h3 className="text-sm sm:text-base font-semibold text-white">Login to Audit Portal</h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565c0] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                          <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565c0] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#0d47a1] hover:bg-[#1565c0] active:bg-[#0a3d91] text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-2.5 font-medium">Role is auto-detected by email:</p>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-red-50 border border-red-100 rounded px-2 py-2 text-center">
                          <span className="font-bold text-red-700 block mb-0.5">Admin</span>
                          <span className="text-slate-500">email has &quot;admin&quot;</span>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded px-2 py-2 text-center">
                          <span className="font-bold text-purple-700 block mb-0.5">Designer</span>
                          <span className="text-slate-500">email has &quot;designer&quot;</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded px-2 py-2 text-center">
                          <span className="font-bold text-blue-700 block mb-0.5">Auditor</span>
                          <span className="text-slate-500">all other emails</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: Stats + Roles */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
                  {[
                    { val: "10", label: "Stage Audit Workflow", sub: "IRC SP 88 compliant" },
                    { val: "3", label: "User Roles", sub: "Admin, Auditor, Designer" },
                    { val: "GPS", label: "Live Tracking", sub: "Real-time site inspection" },
                  ].map((s) => (
                    <div key={s.val} className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4 text-center md:text-left">
                      <div className="md:flex md:items-center md:gap-4">
                        <p className="text-xl sm:text-2xl font-bold text-[#0d47a1]">{s.val}</p>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1 md:mt-0">{s.label}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400 hidden md:block">{s.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-[#0d47a1] px-4 py-2.5">
                    <h3 className="text-sm font-semibold text-white">User Roles</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {[
                      { role: "Admin", color: "red", desc: "Creates audits, assigns teams, approves reports, manages workflow" },
                      { role: "Auditor", color: "blue", desc: "Conducts GPS-tracked inspections, captures images, identifies issues" },
                      { role: "Designer", color: "purple", desc: "Responds to safety issues, tracks implementation status" },
                    ].map((r) => (
                      <div key={r.role} className={`flex items-start gap-2.5 p-2.5 rounded bg-${r.color}-50 border border-${r.color}-100`}>
                        <span className={`text-[10px] sm:text-xs font-bold text-${r.color}-700 bg-${r.color}-100 px-2 py-0.5 rounded flex-shrink-0 mt-0.5`}>
                          {r.role}
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About section */}
          <div ref={sectionRefs.about} className="scroll-mt-14">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0d47a1] px-4 sm:px-6 py-3">
                <h3 className="text-sm sm:text-base font-semibold text-white">About the System</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                    <p>
                      The <strong className="text-slate-800">Road Safety Audit (RSA)</strong> is a formal, systematic assessment
                      of a road project by an independent, qualified team. It examines the safety performance of road designs,
                      construction, and operations to reduce the risk and severity of road crashes.
                    </p>
                    <p>
                      This digital platform implements the complete audit workflow as defined by
                      <strong className="text-slate-800"> IRC SP 88:2019</strong> — the Indian Roads Congress guidelines
                      for Road Safety Audit. It enables government departments, consultants, and audit teams to
                      collaborate digitally throughout the entire audit lifecycle.
                    </p>
                    <p>
                      The system supports audits at all stages — from planning and design to construction and operations —
                      ensuring road safety is considered at every phase of a road project.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">10-Stage Audit Workflow</h4>
                    <div className="space-y-1.5">
                      {[
                        "Team Selection & Qualification",
                        "Background Data Collection",
                        "Commencement Meeting",
                        "Desk Study & Drawing Review",
                        "Site Inspection (GPS Tracked)",
                        "Safety Issue Identification",
                        "Audit Report Generation (PDF)",
                        "Completion Meeting",
                        "Designer / Engineer Response",
                        "Implementation & Follow-up",
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#0d47a1] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "GPS Site Inspection", desc: "Track inspector movement in real-time with Haversine distance calculation. Validates 80% road coverage for audit validity.", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
              { title: "AI Image Validation", desc: "Uses Google Gemini Vision API to verify that uploaded images are actual road photos, rejecting selfies and non-road images.", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
              { title: "Interactive Maps", desc: "View road stretches and safety issues on interactive Leaflet maps with color-coded severity markers and route polylines.", icon: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" },
              { title: "PDF Report Generation", desc: "Generate comprehensive audit reports in PDF format including inspection images, issue details, and team information.", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
              { title: "Multi-Role Workflow", desc: "Three distinct portals — Admin creates/supervises, Auditor inspects/reports, Designer responds to safety issues.", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
              { title: "SMS Notifications", desc: "Automated SMS alerts via Twilio when audits are created, status changes, or actions are required from team members.", icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
                <div className="w-10 h-10 rounded-lg bg-[#e3f2fd] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#0d47a1]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1.5">{f.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Guidelines section */}
          <div ref={sectionRefs.guidelines} className="scroll-mt-14">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0d47a1] px-4 sm:px-6 py-3">
                <h3 className="text-sm sm:text-base font-semibold text-white">Guidelines & Standards</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { code: "IRC SP 88:2019", title: "Manual on Road Safety Audit", desc: "Primary guideline for conducting road safety audits in India. Covers all stages from feasibility to post-construction." },
                    { code: "IRC 35:2015", title: "Code of Practice for Road Markings", desc: "Standards for pavement markings including centre lines, edge lines, pedestrian crossings, and directional arrows." },
                    { code: "IRC 67:2012", title: "Code of Practice for Road Signs", desc: "Comprehensive guide for regulatory, warning, and informatory signs on national and state highways." },
                    { code: "MoRTH Specifications", title: "Road Construction Standards", desc: "Ministry of Road Transport & Highways specifications for design, construction, and maintenance of highways." },
                  ].map((g) => (
                    <div key={g.code} className="p-3 sm:p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                      <span className="text-[10px] font-bold text-[#0d47a1] bg-blue-100 px-2 py-0.5 rounded">{g.code}</span>
                      <h4 className="text-sm font-semibold text-slate-800 mt-2">{g.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact section */}
          <div ref={sectionRefs.contact} className="scroll-mt-14">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0d47a1] px-4 sm:px-6 py-3">
                <h3 className="text-sm sm:text-base font-semibold text-white">Contact Information</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Head Office</h4>
                    <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                      <p>Roads & Buildings Department</p>
                      <p>Block No. 14, New Sachivalaya</p>
                      <p>Gandhinagar, Gujarat — 382010</p>
                      <p className="mt-2">Phone: +91-79-2325-XXXX</p>
                      <p>Email: rnb-dept@gujarat.gov.in</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Road Safety Division</h4>
                    <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                      <p>Chief Engineer (Road Safety)</p>
                      <p>Roads & Buildings Department</p>
                      <p>Gandhinagar, Gujarat</p>
                      <p className="mt-2">Phone: +91-79-2325-XXXX</p>
                      <p>Email: ce-safety@gujarat.gov.in</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Technical Support</h4>
                    <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                      <p>For system access issues, password resets, or technical queries:</p>
                      <p className="mt-2">Email: support-rsa@gujarat.gov.in</p>
                      <p>Helpline: 1800-XXX-XXXX (Toll Free)</p>
                      <p>Hours: Mon–Sat, 10 AM – 6 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white/70">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <img src={GRSA_LOGO} alt="GRSA" className="w-10 h-10 rounded-full bg-white object-cover border border-white/20" />
                <h4 className="font-semibold text-white text-sm leading-tight">Road Safety<br />Audit System</h4>
              </div>
              <p className="leading-relaxed">
                A digital platform for road safety auditing under the Gujarat Road Safety Authority,
                Government of Gujarat.
              </p>
              <p className="mt-1.5 text-[10px] text-amber-400/70 italic">Each Road, Safe Road</p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-2">Quick Links</h4>
              <ul className="space-y-1.5">
                <li>IRC SP 88 Guidelines</li>
                <li>Road Safety Policy</li>
                <li>National Highway Standards</li>
                <li>MoRTH Circulars</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-2">Related Sites</h4>
              <ul className="space-y-1.5">
                <li>roads.gujarat.gov.in</li>
                <li>morth.nic.in</li>
                <li>nhai.gov.in</li>
                <li>irc.org.in</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-2">Address</h4>
              <ul className="space-y-1.5 leading-relaxed">
                <li>Block No. 14, New Sachivalaya</li>
                <li>Gandhinagar — 382010</li>
                <li>Gujarat, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs">
            <span>&copy; {new Date().getFullYear()} Road Safety Audit System. All rights reserved.</span>
            <span className="opacity-50">Designed & Developed for Government of Gujarat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
