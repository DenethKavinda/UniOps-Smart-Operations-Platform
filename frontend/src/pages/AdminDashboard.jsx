import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

/* ─── shared keyframes (injected once) ─── */
const ADMIN_STYLES = `
@keyframes pulseRing {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(1.8); opacity: 0;   }
  100% { transform: scale(1.8); opacity: 0;   }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

/* ─── design tokens (inline-style based) ─── */
const T = {
  glass:      { background: "rgba(15,23,42,0.65)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 },
  glassDeep:  { background: "rgba(8,15,30,0.6)",   border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14 },
  inputBase: {
    width: "100%", boxSizing: "border-box",
    background: "rgba(8,15,30,0.7)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "9px 12px",
    color: "#f1f5f9", fontSize: 13, outline: "none",
  },
  inputErr: { border: "1px solid rgba(248,113,113,0.5)" },
  label:  { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, display: "block", letterSpacing: "0.04em" },
  errMsg: { fontSize: 12, color: "#f87171", marginTop: 4 },
};

const sections = [
  { id: "users",       label: "Users"       },
  { id: "bookings",    label: "Booking"     },
  { id: "maintenance", label: "Maintenance" },
  { id: "assets",      label: "Assets"      },
];

/* ─── reusable atoms ─── */
function StatusBadge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      background: active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)",
      color: active ? "#10b981" : "#f87171",
      border: `1px solid ${active ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
    }}>
      <span style={{ position: "relative", display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: active ? "#10b981" : "#f87171" }}>
        {active && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10b981", animation: "pulseRing 1.8s ease-out infinite" }} />}
      </span>
      {status}
    </span>
  );
}

function AvailBadge({ now }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      background: now ? "rgba(6,182,212,0.12)" : "rgba(100,116,139,0.12)",
      color: now ? "#22d3ee" : "#94a3b8",
      border: `1px solid ${now ? "rgba(6,182,212,0.22)" : "rgba(100,116,139,0.2)"}`,
    }}>
      {now ? "● Available" : "○ Not now"}
    </span>
  );
}

function SkeletonRow({ cols = 7 }) {
  const shimmer = {
    background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 1.4s infinite linear",
    borderRadius: 6, height: 12,
  };
  return (
    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{ ...shimmer, width: [130,80,55,90,85,75,90][i] || 80 }} />
        </td>
      ))}
    </tr>
  );
}

function GlassInput({ value, onChange, onBlur, placeholder, type = "text", error, children, style = {} }) {
  return children ? (
    <select value={value} onChange={onChange} style={{ ...T.inputBase, ...(error ? T.inputErr : {}), ...style }}>
      {children}
    </select>
  ) : (
    <input type={type} min={type === "number" ? 0 : undefined}
      value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
      style={{ ...T.inputBase, ...(error ? T.inputErr : {}), ...style }} />
  );
}

function Btn({ children, onClick, type = "button", disabled, variant = "ghost", style = {} }) {
  const base = { padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, transition: "opacity 0.2s, transform 0.1s", border: "none", ...style };
  const variants = {
    primary: { background: "linear-gradient(135deg,#0891b2,#06b6d4)", color: "#fff", boxShadow: "0 4px 14px rgba(6,182,212,0.28)" },
    ghost:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" },
    danger:  { background: "rgba(239,68,68,0.12)",   border: "1px solid rgba(239,68,68,0.25)",  color: "#f87171" },
    edit:    { background: "rgba(34,211,238,0.08)",  border: "1px solid rgba(34,211,238,0.22)", color: "#22d3ee" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.82"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? "0.55" : "1"; }}
      onMouseDown={e  => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={e    => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

/* ─── main component ─── */
function AdminDashboard({ user }) {
  const [dashboard, setDashboard]       = useState(null);
  const [activeSection, setActiveSection] = useState("users");
  const [loading, setLoading]           = useState(true);
  const [savingId, setSavingId]         = useState(null);
  const [error, setError]               = useState("");

  /* assets state */
  const [assetItems,        setAssetItems]        = useState([]);
  const [assetLoading,      setAssetLoading]      = useState(false);
  const [assetError,        setAssetError]        = useState("");
  const [assetFilters,      setAssetFilters]      = useState({ q:"", type:"", minCapacity:"", location:"", status:"" });
  const [assetFilterErrors, setAssetFilterErrors] = useState({});
  const [assetForm,         setAssetForm]         = useState({ id:null, name:"", type:"", capacity:"", location:"", status:"ACTIVE", availabilityWindows:[] });
  const [assetFormErrors,   setAssetFormErrors]   = useState({});
  const [assetSaving,       setAssetSaving]       = useState(false);

  /* ── helpers ── */
  const toBackendDateTime  = v => (!v ? null : v.length === 16 ? `${v}:00` : v);
  const toDatetimeLocal    = v => (!v ? "" : v.length >= 16 ? v.slice(0,16) : v);
  const sanitizeText       = (v, max) => { const t = String(v??"").replace(/[\r\n]+/g," ").trim(); return t.length>max?t.slice(0,max):t; };
  const allowedStatuses    = new Set(["ACTIVE","OUT_OF_SERVICE"]);

  const normDatetime = v => {
    const t = String(v??"").trim();
    if (!t) return "";
    if (t.length===16) return `${t}:00`;
    if (t.length>=19)  return t.slice(0,19);
    return t;
  };

  const validateFilters = next => {
    const errors = {};
    const s = { ...next, q: sanitizeText(next.q,80), type: sanitizeText(next.type,40), location: sanitizeText(next.location,60), status: next.status??"", minCapacity: next.minCapacity??"" };
    if (s.minCapacity !== "") { const n=Number(s.minCapacity); if (!Number.isFinite(n)||!Number.isInteger(n)||n<0) errors.minCapacity="Must be a non-negative whole number."; }
    if (s.status && !allowedStatuses.has(s.status)) errors.status = "Invalid status.";
    return { sanitized:s, errors, isValid:!Object.keys(errors).length };
  };

  const validateForm = next => {
    const errors = {};
    const s = {
      ...next,
      name: sanitizeText(next.name,80), type: sanitizeText(next.type,40),
      location: sanitizeText(next.location,60), status: next.status??"ACTIVE",
      capacity: String(next.capacity??"").trim(),
      availabilityWindows: (next.availabilityWindows||[]).map(w=>({ startAt:String(w?.startAt??"").trim(), endAt:String(w?.endAt??"").trim() })),
    };
    if (!s.name) errors.name="Name is required.";
    if (!s.type) errors.type="Type is required.";
    if (!s.location) errors.location="Location is required.";
    if (!allowedStatuses.has(s.status)) errors.status="Invalid status.";
    if (s.capacity==="") { errors.capacity="Capacity is required."; }
    else { const n=Number(s.capacity); if (!Number.isFinite(n)||!Number.isInteger(n)||n<0) errors.capacity="Must be a non-negative whole number."; }
    if (s.availabilityWindows.length>20) errors.availabilityWindows="Maximum 20 windows allowed.";
    const filled=[];
    s.availabilityWindows.forEach((w,idx)=>{
      const {startAt,endAt}=w;
      if (!startAt&&!endAt) return;
      if (!startAt) { errors[`aw.${idx}.startAt`]="Start time required."; return; }
      if (!endAt)   { errors[`aw.${idx}.endAt`]="End time required."; return; }
      if (startAt.length<16) { errors[`aw.${idx}.startAt`]="Invalid start time."; return; }
      if (endAt.length<16)   { errors[`aw.${idx}.endAt`]="Invalid end time."; return; }
      const sk=normDatetime(startAt), ek=normDatetime(endAt);
      if (sk>=ek) { errors[`aw.${idx}.range`]="Start must be before end."; return; }
      filled.push({idx,sk,ek});
    });
    const sorted=[...filled].sort((a,b)=>a.sk.localeCompare(b.sk));
    for (let i=1;i<sorted.length;i++) { const p=sorted[i-1],c=sorted[i]; if (c.sk<p.ek) errors[`aw.${c.idx}.range`]="Overlaps another window."; }
    return { sanitized:s, errors, isValid:!Object.keys(errors).length };
  };

  /* ── API ── */
  const loadDashboard = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/admin/dashboard");
      if (res.data?.success) setDashboard(res.data.data);
      else setError(res.data?.message||"Unable to load dashboard.");
    } catch (err) { setError(err.response?.data?.message||"Unable to load dashboard."); }
    finally { setLoading(false); }
  };

  const loadAssets = async (f=assetFilters) => {
    setAssetLoading(true); setAssetError("");
    try {
      const params = { q:f.q||undefined, type:f.type||undefined, minCapacity:f.minCapacity===""?undefined:f.minCapacity, location:f.location||undefined, status:f.status||undefined };
      const res = await api.get("/admin/assets",{params});
      if (res.data?.success) setAssetItems(res.data.data||[]);
      else setAssetError(res.data?.message||"Unable to load assets.");
    } catch (err) { setAssetError(err.response?.data?.message||"Unable to load assets."); }
    finally { setAssetLoading(false); }
  };

  useEffect(()=>{ loadDashboard(); },[]);
  useEffect(()=>{ if (activeSection==="assets") loadAssets(); },[activeSection]); // eslint-disable-line

  // Debounced search effect
  useEffect(() => {
    if (activeSection !== "assets") return;
    
    const timeoutId = setTimeout(() => {
      const { sanitized, errors, isValid } = validateFilters(assetFilters);
      setAssetFilterErrors(errors);
      if (isValid) {
        loadAssets(sanitized);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [assetFilters, activeSection]); // eslint-disable-line

  const resetForm = () => { setAssetForm({id:null,name:"",type:"",capacity:"",location:"",status:"ACTIVE",availabilityWindows:[]}); setAssetFormErrors({}); };

  const startEdit = asset => {
    setAssetError(""); setAssetFormErrors({});
    setAssetForm({ id:asset.id, name:asset.name||"", type:asset.type||"", capacity:asset.capacity??"", location:asset.location||"", status:asset.status||"ACTIVE", availabilityWindows:(asset.availabilityWindows||[]).map(w=>({startAt:toDatetimeLocal(w.startAt),endAt:toDatetimeLocal(w.endAt)})) });
    document.getElementById("asset-form-anchor")?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  const submitForm = async e => {
    e.preventDefault(); setAssetError("");
    const {sanitized,errors,isValid} = validateForm(assetForm);
    setAssetForm(p=>({...p,...sanitized})); setAssetFormErrors(errors);
    if (!isValid) return;
    setAssetSaving(true);
    const payload = { name:sanitized.name, type:sanitized.type, capacity:Number(sanitized.capacity), location:sanitized.location, status:sanitized.status, availabilityWindows:sanitized.availabilityWindows.filter(w=>w.startAt&&w.endAt).map(w=>({startAt:toBackendDateTime(w.startAt),endAt:toBackendDateTime(w.endAt)})) };
    try {
      if (assetForm.id) await api.put(`/admin/assets/${assetForm.id}`,payload);
      else              await api.post("/admin/assets",payload);
      await loadAssets(); await loadDashboard(); resetForm();
    } catch (err) { setAssetError(err.response?.data?.message||"Unable to save asset."); }
    finally { setAssetSaving(false); }
  };

  const deleteAsset = async asset => {
    setAssetError(""); setAssetSaving(true);
    try {
      await api.delete(`/admin/assets/${asset.id}`);
      await loadAssets(); await loadDashboard();
      if (assetForm.id===asset.id) resetForm();
    } catch (err) { setAssetError(err.response?.data?.message||"Unable to delete asset."); }
    finally { setAssetSaving(false); }
  };

  const updateUserRole = async (userId,role) => {
    setSavingId(userId);
    try { await api.put(`/admin/users/${userId}/role`,{role}); await loadDashboard(); }
    catch (err) { setError(err.response?.data?.message||"Unable to update role."); }
    finally { setSavingId(null); }
  };

  const toggleBlock = async targetUser => {
    setSavingId(targetUser.id);
    try { await api.put(`/admin/users/${targetUser.id}/block`,{blocked:!targetUser.blocked}); await loadDashboard(); }
    catch (err) { setError(err.response?.data?.message||"Unable to update status."); }
    finally { setSavingId(null); }
  };

  /* ── derived ── */
  const users      = dashboard?.users||[];
  const roleStats  = dashboard?.roleStats||[];
  const loginChart = dashboard?.loginChart||[];
  const maxLogins  = useMemo(()=>Math.max(1,...loginChart.map(i=>i.loginCount||0)),[loginChart]);

  const moduleCards = [
    { title:"Users",       value:dashboard?.totalUsers??0,       note:`${dashboard?.blockedUsers??0} blocked` },
    { title:"Booking",     value:dashboard?.bookingCount??0,      note:"Reservations" },
    { title:"Maintenance", value:dashboard?.maintenanceCount??0,  note:"Service requests" },
    { title:"Assets",      value:dashboard?.assetCount??0,        note:"Asset inventory" },
  ];

  /* field setter for asset form */
  const setField = key => e => {
    setAssetForm(p=>({...p,[key]:e.target.value}));
    if (assetFormErrors[key]) setAssetFormErrors(p=>({...p,[key]:undefined}));
  };

  return (
    <main className="relative overflow-hidden">
      <style>{ADMIN_STYLES}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_35%)]" />

      <section className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* ── sidebar ── */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Admin Console</p>
            <h2 className="mt-2 text-2xl font-black text-white">UniOps</h2>
            <p className="mt-2 text-sm text-slate-300">{user?.name}</p>
            <div className="mt-6 space-y-2">
              {sections.map(s=>(
                <button key={s.id} type="button" onClick={()=>setActiveSection(s.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeSection===s.id?"bg-cyan-500 text-slate-950":"bg-slate-950/60 text-slate-200 hover:bg-slate-800"}`}>
                  <span>{s.label}</span>
                  <span className="text-xs opacity-80">{activeSection===s.id?"Open":"View"}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
              Signed in as {user?.role}. Role control and block/unblock actions are available on the Users panel.
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {/* ── header card ── */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Admin Dashboard</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-white sm:text-4xl">Control users, bookings, maintenance, and assets.</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Review role distribution, watch login activity, and manage user access.</p>
              </div>
              <button type="button" onClick={loadDashboard} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Refresh data</button>
            </div>
          </div>

          {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">⚠ {error}</div>}

          {/* ── stat cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={dashboard?.totalUsers??0}   tone="cyan" />
            <StatCard label="Admins"      value={dashboard?.adminUsers??0}   tone="blue" />
            <StatCard label="Students"    value={dashboard?.studentUsers??0} tone="emerald" />
            <StatCard label="Blocked"     value={dashboard?.blockedUsers??0} tone="rose" />
          </div>

          {/* ── overview + panel ── */}
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Users overview</h2>
                  <p className="mt-1 text-sm text-slate-300">Role split and login activity.</p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{dashboard?.totalLogins??0} logins</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Role %</h3>
                  <div className="mt-4 space-y-4">
                    {roleStats.map(item=>(
                      <div key={item.role}>
                        <div className="flex justify-between text-sm text-slate-200"><span>{item.role}</span><span>{item.percentage}%</span></div>
                        <div className="mt-2 h-3 rounded-full bg-slate-800"><div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{width:`${item.percentage}%`}}/></div>
                        <p className="mt-1 text-xs text-slate-400">{item.count} accounts</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">User logins</h3>
                  <div className="mt-4 space-y-3">
                    {loginChart.map(item=>(
                      <div key={item.id}>
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-200"><span className="truncate">{item.name}</span><span>{item.loginCount}</span></div>
                        <div className="mt-2 h-3 rounded-full bg-slate-800"><div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{width:`${(item.loginCount/maxLogins)*100}%`}}/></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {moduleCards.map(c=>(
                  <div key={c.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{c.title}</p>
                    <p className="mt-3 text-3xl font-black text-white">{c.value}</p>
                    <p className="mt-2 text-sm text-slate-300">{c.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white">Module panel</h2>
                <p className="mt-1 text-sm text-slate-300">
                  {activeSection==="users"&&"Manage roles, block status, and account activity."}
                  {activeSection==="bookings"&&"View booking totals and reservation workload."}
                  {activeSection==="maintenance"&&"Track open, active, and resolved requests."}
                  {activeSection==="assets"&&"Monitor inventory and asset availability."}
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <InfoRow label="Bookings"     value={dashboard?.bookingCount??0} />
                  <InfoRow label="Maintenance"  value={dashboard?.maintenanceCount??0} />
                  <InfoRow label="Assets"       value={dashboard?.assetCount??0} />
                  <InfoRow label="Blocked users" value={dashboard?.blockedUsers??0} />
                </div>
              </section>
              <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white">Current admin</h2>
                <p className="mt-2 text-sm text-slate-300">{user?.name}</p>
                <p className="text-sm text-cyan-300">{user?.email}</p>
                <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">Use the user table to promote, demote, or block access.</div>
              </section>
            </aside>
          </div>

          {/* ── USERS ── */}
          {activeSection==="users" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">User management</h2>
                  <p className="mt-1 text-sm text-slate-300">Edit roles and toggle access without leaving the dashboard.</p>
                </div>
                <span className="text-sm text-slate-400">{users.length} users</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                      {["User","Role","Logins","Status","Actions"].map(h=><th key={h} className="px-4 py-2">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-300">Loading users…</td></tr>
                      : users.map(item=>(
                      <tr key={item.id} className="rounded-2xl bg-slate-950/60">
                        <td className="rounded-l-2xl px-4 py-4"><p className="font-semibold text-white">{item.name}</p><p className="text-sm text-slate-400">{item.email}</p></td>
                        <td className="px-4 py-4">
                          <select value={item.role} onChange={e=>updateUserRole(item.id,e.target.value)} disabled={savingId===item.id}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400">
                            <option value="STUDENT">STUDENT</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-200">{item.loginCount}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${item.blocked?"bg-rose-500/20 text-rose-300":"bg-emerald-500/20 text-emerald-300"}`}>
                            {item.blocked?"Blocked":"Active"}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <button type="button" onClick={()=>toggleBlock(item)} disabled={savingId===item.id}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${item.blocked?"bg-emerald-500 text-slate-950 hover:bg-emerald-400":"bg-rose-500 text-white hover:bg-rose-400"}`}>
                            {item.blocked?"Unblock":"Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ════════════════ ASSETS — fully redesigned ════════════════ */}
          {activeSection==="assets" && (
            <section style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              {/* section header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", borderRadius:999, background:"rgba(34,211,238,0.08)", border:"1px solid rgba(34,211,238,0.2)", fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#22d3ee", marginBottom:10 }}>
                    ◈ Assets
                  </span>
                  <h2 style={{ fontSize:22, fontWeight:900, color:"#f1f5f9", margin:0, letterSpacing:"-0.01em" }}>Resource catalogue management</h2>
                  <p style={{ color:"#475569", fontSize:13, marginTop:4 }}>Add, edit, delete resources and configure availability windows.</p>
                </div>
                <Btn onClick={()=>loadAssets()} variant="edit">↻ Refresh</Btn>
              </div>

              {assetError && (
                <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", color:"#fca5a5", fontSize:13, marginBottom:20 }}>
                  ⚠ {assetError}
                </div>
              )}

              {/* ── FORM ── */}
              <div id="asset-form-anchor" style={{ ...T.glass, padding:24, marginBottom:20 }}>
                {/* form header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#334155", marginBottom:4 }}>
                      {assetForm.id ? "Editing resource" : "New resource"}
                    </p>
                    <p style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:0 }}>
                      {assetForm.id ? `#${assetForm.id} — ${assetForm.name||"…"}` : "Add to catalogue"}
                    </p>
                  </div>
                  {assetForm.id && <Btn onClick={resetForm} variant="ghost">✕ Cancel edit</Btn>}
                </div>

                <form onSubmit={submitForm}>
                  {/* core fields grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:20 }}>
                    {/* Name */}
                    <div>
                      <label style={T.label}>Name</label>
                      <GlassInput value={assetForm.name} onChange={setField("name")} onBlur={()=>setAssetForm(p=>({...p,name:sanitizeText(p.name,80)}))} placeholder="Lecture Hall A" error={assetFormErrors.name} />
                      {assetFormErrors.name && <p style={T.errMsg}>{assetFormErrors.name}</p>}
                    </div>
                    {/* Type */}
                    <div>
                      <label style={T.label}>Type</label>
                      <GlassInput value={assetForm.type} onChange={setField("type")} onBlur={()=>setAssetForm(p=>({...p,type:sanitizeText(p.type,40)}))} placeholder="LECTURE_HALL / LAB / …" error={assetFormErrors.type} />
                      {assetFormErrors.type && <p style={T.errMsg}>{assetFormErrors.type}</p>}
                    </div>
                    {/* Capacity */}
                    <div>
                      <label style={T.label}>Capacity</label>
                      <GlassInput type="number" value={assetForm.capacity} onChange={setField("capacity")} placeholder="0" error={assetFormErrors.capacity} />
                      {assetFormErrors.capacity && <p style={T.errMsg}>{assetFormErrors.capacity}</p>}
                    </div>
                    {/* Location */}
                    <div style={{ gridColumn:"span 2" }}>
                      <label style={T.label}>Location</label>
                      <GlassInput value={assetForm.location} onChange={setField("location")} onBlur={()=>setAssetForm(p=>({...p,location:sanitizeText(p.location,60)}))} placeholder="Block A – Level 1" error={assetFormErrors.location} />
                      {assetFormErrors.location && <p style={T.errMsg}>{assetFormErrors.location}</p>}
                    </div>
                    {/* Status */}
                    <div>
                      <label style={T.label}>Status</label>
                      <GlassInput value={assetForm.status} onChange={setField("status")} error={assetFormErrors.status}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                      </GlassInput>
                      {assetFormErrors.status && <p style={T.errMsg}>{assetFormErrors.status}</p>}
                    </div>
                  </div>

                  {/* availability windows */}
                  <div style={{ ...T.glassDeep, padding:18, marginBottom:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div>
                        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#334155", margin:0 }}>Availability windows</p>
                        <p style={{ fontSize:12, color:"#475569", marginTop:4 }}>No windows = always available when ACTIVE.</p>
                      </div>
                      <Btn variant="edit" style={{ padding:"6px 14px", fontSize:12 }}
                        onClick={()=>setAssetForm(p=>({...p,availabilityWindows:[...(p.availabilityWindows||[]),{startAt:"",endAt:""}]}))}>
                        + Add window
                      </Btn>
                    </div>

                    {assetFormErrors.availabilityWindows && (
                      <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#fca5a5", fontSize:12, marginBottom:12 }}>
                        {assetFormErrors.availabilityWindows}
                      </div>
                    )}

                    {(assetForm.availabilityWindows||[]).length===0 ? (
                      <p style={{ fontSize:13, color:"#334155", textAlign:"center", padding:"12px 0" }}>No windows configured.</p>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {assetForm.availabilityWindows.map((w,idx)=>(
                          <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:10, padding:"14px 16px", borderRadius:12, background:"rgba(6,182,212,0.04)", border:"1px solid rgba(6,182,212,0.12)", animation:`fadeSlideUp 0.2s ease ${idx*0.05}s both` }}>
                            <div>
                              <label style={T.label}>Start</label>
                              <GlassInput type="datetime-local" value={w.startAt}
                                error={assetFormErrors[`aw.${idx}.startAt`]||assetFormErrors[`aw.${idx}.range`]}
                                onChange={e=>{
                                  setAssetForm(p=>{const n=[...p.availabilityWindows];n[idx]={...n[idx],startAt:e.target.value};return{...p,availabilityWindows:n};});
                                  setAssetFormErrors(p=>({...p,[`aw.${idx}.startAt`]:undefined,[`aw.${idx}.range`]:undefined}));
                                }} />
                              {assetFormErrors[`aw.${idx}.startAt`] && <p style={T.errMsg}>{assetFormErrors[`aw.${idx}.startAt`]}</p>}
                            </div>
                            <div>
                              <label style={T.label}>End</label>
                              <GlassInput type="datetime-local" value={w.endAt}
                                error={assetFormErrors[`aw.${idx}.endAt`]||assetFormErrors[`aw.${idx}.range`]}
                                onChange={e=>{
                                  setAssetForm(p=>{const n=[...p.availabilityWindows];n[idx]={...n[idx],endAt:e.target.value};return{...p,availabilityWindows:n};});
                                  setAssetFormErrors(p=>({...p,[`aw.${idx}.endAt`]:undefined,[`aw.${idx}.range`]:undefined}));
                                }} />
                              {assetFormErrors[`aw.${idx}.endAt`] && <p style={T.errMsg}>{assetFormErrors[`aw.${idx}.endAt`]}</p>}
                            </div>
                            <div style={{ display:"flex", alignItems:"flex-end" }}>
                              <Btn variant="danger" style={{ padding:"8px 12px", fontSize:12 }}
                                onClick={()=>setAssetForm(p=>({...p,availabilityWindows:p.availabilityWindows.filter((_,i)=>i!==idx)}))}>
                                ✕
                              </Btn>
                            </div>
                            {assetFormErrors[`aw.${idx}.range`] && (
                              <p style={{ ...T.errMsg, gridColumn:"1/-1" }}>{assetFormErrors[`aw.${idx}.range`]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* submit */}
                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <Btn type="submit" variant="primary" disabled={assetSaving} style={{ padding:"10px 28px", fontSize:14 }}>
                      {assetSaving ? "Saving…" : assetForm.id ? "Save changes" : "Add resource"}
                    </Btn>
                  </div>
                </form>
              </div>

              {/* ── FILTER + TABLE ── */}
              <div style={{ ...T.glass, padding:24 }}>
                {/* filter bar */}
                <div style={{ ...T.glassDeep, padding:18, marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:14 }}>
                    <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#334155", margin:0 }}>Filter resources</p>
                    <Btn variant="ghost" style={{ padding:"6px 14px", fontSize:12 }} onClick={()=>{
                      const c={q:"",type:"",minCapacity:"",location:"",status:""};
                      setAssetFilters(c); setAssetFilterErrors({}); loadAssets(c);
                    }}>Clear</Btn>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:12 }}>
                    <GlassInput value={assetFilters.q}           onChange={e=>{setAssetFilters(p=>({...p,q:e.target.value}));setAssetFilterErrors(p=>({...p,q:undefined}));}}           placeholder="Search by name…" />
                    <GlassInput value={assetFilters.type}        onChange={e=>{setAssetFilters(p=>({...p,type:e.target.value}));setAssetFilterErrors(p=>({...p,type:undefined}));}}        placeholder="Type" />
                    <GlassInput type="number" value={assetFilters.minCapacity} error={assetFilterErrors.minCapacity}
                      onChange={e=>{setAssetFilters(p=>({...p,minCapacity:e.target.value}));setAssetFilterErrors(p=>({...p,minCapacity:undefined}));}}
                      placeholder="Min cap." />
                    <GlassInput value={assetFilters.location}    onChange={e=>{setAssetFilters(p=>({...p,location:e.target.value}));setAssetFilterErrors(p=>({...p,location:undefined}));}}    placeholder="Location" />
                    <GlassInput value={assetFilters.status} error={assetFilterErrors.status}
                      onChange={e=>{setAssetFilters(p=>({...p,status:e.target.value}));setAssetFilterErrors(p=>({...p,status:undefined}));}}>
                      <option value="">Any status</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                    </GlassInput>
                  </div>
                  {(assetFilterErrors.minCapacity||assetFilterErrors.status) && (
                    <p style={{ ...T.errMsg, marginBottom:10 }}>{assetFilterErrors.minCapacity||assetFilterErrors.status}</p>
                  )}
                  <div style={{ display:"flex", justifyContent:"flex-end", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {assetLoading && <div style={{ width: 12, height: 12, border: "1.5px solid rgba(6,182,212,0.3)", borderTop: "1.5px solid #06b6d4", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>}
                      <p style={{ fontSize: 11, color: assetLoading ? "#06b6d4" : "#64748b", margin: 0 }}>
                        {assetLoading ? "Searching..." : "Search updates automatically"}
                      </p>
                    </div>
                    <Btn variant="primary" onClick={()=>{
                      const{sanitized,errors,isValid}=validateFilters(assetFilters);
                      setAssetFilters(p=>({...p,...sanitized})); setAssetFilterErrors(errors);
                      if (isValid) loadAssets(sanitized);
                    }}>Search Now</Btn>
                  </div>
                </div>

                {/* table */}
                <div style={{ overflowX:"auto", borderRadius:14, border:"1px solid rgba(255,255,255,0.05)" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr>
                        {["Resource","Type","Cap.","Location","Status","Avail.","Actions"].map(h=>(
                          <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#334155", borderBottom:"1px solid rgba(255,255,255,0.04)", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {assetLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={7}/>)
                        : assetItems.length===0 ? (
                          <tr><td colSpan={7} style={{ padding:"40px 16px", textAlign:"center", color:"#334155", fontSize:14 }}>No resources found.</td></tr>
                        ) : assetItems.map((asset,idx)=>(
                          <tr key={asset.id} style={{ borderTop:"1px solid rgba(255,255,255,0.035)", animation:`fadeSlideUp 0.3s ease ${idx*0.04}s both`, transition:"background 0.15s" }}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.025)"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <td style={{ padding:"14px 16px" }}>
                              <p style={{ fontWeight:700, fontSize:14, color:"#f1f5f9", margin:0 }}>{asset.name}</p>
                              <p style={{ fontSize:11, color:"#334155", fontFamily:"monospace", margin:"2px 0 0" }}>#{asset.id}</p>
                            </td>
                            <td style={{ padding:"14px 16px", fontSize:13, color:"#94a3b8" }}>{asset.type}</td>
                            <td style={{ padding:"14px 16px", fontSize:13, color:"#94a3b8", fontVariantNumeric:"tabular-nums" }}>{asset.capacity}</td>
                            <td style={{ padding:"14px 16px", fontSize:13, color:"#94a3b8" }}>{asset.location}</td>
                            <td style={{ padding:"14px 16px" }}><StatusBadge status={asset.status}/></td>
                            <td style={{ padding:"14px 16px" }}><AvailBadge now={asset.availableNow}/></td>
                            <td style={{ padding:"14px 16px" }}>
                              <div style={{ display:"flex", gap:8 }}>
                                <Btn variant="edit"   style={{ padding:"6px 14px", fontSize:12 }} onClick={()=>startEdit(asset)}>Edit</Btn>
                                <Btn variant="danger" style={{ padding:"6px 14px", fontSize:12 }} disabled={assetSaving} onClick={()=>deleteAsset(asset)}>Delete</Btn>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── other sections placeholder ── */}
          {activeSection!=="users" && activeSection!=="assets" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              <h2 className="text-xl font-bold text-white">{sections.find(s=>s.id===activeSection)?.label}</h2>
              <p className="mt-2 text-sm text-slate-300">Expand this module with CRUD actions when the domain workflow is ready.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {moduleCards.map(c=>(
                  <div key={c.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-sm text-slate-400">{c.title}</p>
                    <p className="mt-2 text-2xl font-black text-white">{c.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

/* ── unchanged helper components ── */
function StatCard({label,value,tone}) {
  const toneClasses = {
    cyan:    "from-cyan-500/20 to-cyan-500/5 border-cyan-400/20 text-cyan-300",
    blue:    "from-blue-500/20 to-blue-500/5 border-blue-400/20 text-blue-300",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-400/20 text-emerald-300",
    rose:    "from-rose-500/20 to-rose-500/5 border-rose-400/20 text-rose-300",
  };
  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-lg ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">{label}</p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function InfoRow({label,value}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

export default AdminDashboard;