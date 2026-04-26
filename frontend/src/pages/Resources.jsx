import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

/* ─── tiny pulse animation injected once ─── */
const PULSE_STYLE = `
@keyframes pulseRing {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(1.8); opacity: 0;   }
  100% { transform: scale(1.8); opacity: 0;   }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
`;

function StyleOnce() {
  return <style>{PULSE_STYLE}</style>;
}

/* ─── helpers ─── */
const STATUSES = new Set(["", "ACTIVE", "OUT_OF_SERVICE"]);

const sanitize = (v, max) =>
  String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

function validateFilters(f) {
  const errors = {};
  const s = {
    ...f,
    q: sanitize(f.q, 80),
    type: sanitize(f.type, 40),
    location: sanitize(f.location, 60),
    status: f.status ?? "",
    minCapacity: f.minCapacity ?? "",
  };
  if (s.minCapacity !== "") {
    const n = Number(s.minCapacity);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0)
      errors.minCapacity = "Must be a non-negative whole number.";
  }
  if (!STATUSES.has(s.status)) errors.status = "Invalid status value.";
  return { sanitized: s, errors, isValid: !Object.keys(errors).length };
}

function fmtWindow(s, e) {
  if (!s || !e) return "";
  const fmt = (d) =>
    new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  return `${fmt(s)} → ${fmt(e)}`;
}

/* ─── sub-components ─── */
function StatusBadge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)",
        color: active ? "#10b981" : "#f87171",
        border: `1px solid ${active ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
      }}
    >
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: active ? "#10b981" : "#f87171",
        }}
      >
        {active && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#10b981",
              animation: "pulseRing 1.8s ease-out infinite",
            }}
          />
        )}
      </span>
      {status}
    </span>
  );
}

function AvailBadge({ now }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: now ? "rgba(6,182,212,0.12)" : "rgba(100,116,139,0.12)",
        color: now ? "#22d3ee" : "#94a3b8",
        border: `1px solid ${now ? "rgba(6,182,212,0.22)" : "rgba(100,116,139,0.2)"}`,
      }}
    >
      {now ? "● Available" : "○ Not now"}
    </span>
  );
}

function DetailRow({ label, value, accent }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "9px 14px",
        borderRadius: 10,
        background: "rgba(15,23,42,0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        marginBottom: 6,
      }}
    >
      <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          fontSize: 13,
          color: accent ? "#22d3ee" : "#f1f5f9",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function FilterInput({ value, onChange, placeholder, error, type = "text", children }) {
  const base = {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(15,23,42,0.6)",
    border: `1px solid ${error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.07)"}`,
    borderRadius: 10,
    padding: "9px 12px",
    color: "#f1f5f9",
    fontSize: 13,
    outline: "none",
    transition: "border-color 0.2s",
  };

  if (children) {
    return (
      <select value={value} onChange={onChange} style={base}>
        {children}
      </select>
    );
  }
  return (
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={base}
    />
  );
}

function SkeletonRow() {
  const shimmer = {
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 1.4s infinite linear",
    borderRadius: 6,
    height: 13,
  };
  return (
    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      {[120, 80, 60, 90, 80, 70].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{ ...shimmer, width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ─── main component ─── */
function Resources({ user }) {
  const isAdmin = user?.role === "ADMIN";
  const [assets, setAssets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    q: "", type: "", minCapacity: "", location: "", status: "",
  });

  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    type: "",
    capacity: "0",
    location: "",
    status: "ACTIVE",
  });
  const [createFieldErrors, setCreateFieldErrors] = useState({});

  const EMPTY = { q: "", type: "", minCapacity: "", location: "", status: "" };

  const loadAssets = async (f = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        q: f.q || undefined,
        type: f.type || undefined,
        minCapacity: f.minCapacity === "" ? undefined : f.minCapacity,
        location: f.location || undefined,
        status: f.status || undefined,
      };
      const endpoint = isAdmin ? "/admin/assets" : "/assets";
      const res = await api.get(endpoint, { params });
      if (res.data?.success) {
        const items = res.data.data || [];
        setAssets(items);
        if (selected) {
          const refreshed = items.find((a) => a.id === selected.id);
          setSelected(refreshed || null);
        }
      } else {
        setError(res.data?.message || "Unable to load resources.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const validateCreate = (payload) => {
    const nextErrors = {};
    const cleaned = {
      name: sanitize(payload.name, 80),
      type: sanitize(payload.type, 40),
      location: sanitize(payload.location, 60),
      status: sanitize(payload.status, 40),
      capacity: payload.capacity,
    };

    if (!cleaned.name) nextErrors.name = "Name is required.";
    if (!cleaned.type) nextErrors.type = "Type is required.";
    if (!cleaned.location) nextErrors.location = "Location is required.";

    const capacityValue = Number(cleaned.capacity);
    if (!Number.isFinite(capacityValue) || !Number.isInteger(capacityValue) || capacityValue < 0) {
      nextErrors.capacity = "Capacity must be a non-negative whole number.";
    }

    const statusValue = String(cleaned.status || "").trim().toUpperCase();
    if (statusValue && statusValue !== "ACTIVE" && statusValue !== "OUT_OF_SERVICE") {
      nextErrors.status = "Status must be ACTIVE or OUT_OF_SERVICE.";
    }

    return {
      errors: nextErrors,
      isValid: Object.keys(nextErrors).length === 0,
      cleaned: {
        name: cleaned.name,
        type: cleaned.type,
        location: cleaned.location,
        capacity: capacityValue,
        status: statusValue || "ACTIVE",
      },
    };
  };

  const setCreateField = (key) => (e) => {
    setCreateForm((p) => ({ ...p, [key]: e.target.value }));
    if (createFieldErrors[key]) {
      setCreateFieldErrors((p) => ({ ...p, [key]: undefined }));
    }
  };

  const handleCreate = async () => {
    if (!isAdmin) {
      return;
    }

    setCreateError("");
    const { cleaned, errors: nextErrors, isValid } = validateCreate(createForm);
    setCreateFieldErrors(nextErrors);
    if (!isValid) {
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await api.post("/admin/assets", cleaned);
      if (!res.data?.success) {
        setCreateError(res.data?.message || "Unable to add resource.");
        return;
      }

      setShowCreate(false);
      setCreateForm({ name: "", type: "", capacity: "0", location: "", status: "ACTIVE" });
      setCreateFieldErrors({});
      await loadAssets();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Unable to add resource.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  useEffect(() => { loadAssets(EMPTY); }, []); // eslint-disable-line

  const handleSearch = () => {
    const { sanitized, errors, isValid } = validateFilters(filters);
    setFilters((p) => ({ ...p, ...sanitized }));
    setFormErrors(errors);
    if (isValid) loadAssets(sanitized);
  };

  const handleClear = () => {
    setFilters(EMPTY);
    setFormErrors({});
    loadAssets(EMPTY);
  };

  const setField = (key) => (e) => {
    setFilters((p) => ({ ...p, [key]: e.target.value }));
    if (formErrors[key]) setFormErrors((p) => ({ ...p, [key]: undefined }));
  };

  /* glass card base */
  const glass = {
    background: "rgba(15,23,42,0.65)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
  };

  return (
    <main
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        background: "linear-gradient(135deg,#020817 0%,#0a1628 50%,#041020 100%)",
      }}
    >
      <StyleOnce />

      {/* decorative orbs */}
      <div
        style={{
          position: "absolute", top: -120, right: -120,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -80, left: -80,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,116,144,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 96px",
        }}
      >
        {/* page header */}
        <div style={{ marginBottom: 40 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 14px",
              borderRadius: 999,
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.2)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#22d3ee",
              marginBottom: 20,
            }}
          >
            <span style={{ opacity: 0.6 }}>◈</span> Resources
          </span>

          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Facilities &amp;{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#22d3ee,#0891b2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Assets
            </span>
          </h1>

          <p style={{ marginTop: 12, color: "#64748b", fontSize: 15, maxWidth: 480 }}>
            Browse campus resources, check live status, and review availability windows.
            {user?.name && (
              <span style={{ color: "#22d3ee" }}> Welcome, {user.name}.</span>
            )}
          </p>
        </div>

        {/* catalogue card */}
        <div style={{ ...glass, padding: 28 }}>
          {/* card header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  margin: 0,
                }}
              >
                Catalogue
              </h2>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
                {assets.length} resource{assets.length !== 1 ? "s" : ""} loaded
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate((v) => !v);
                    setCreateError("");
                    setCreateFieldErrors({});
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(6,182,212,0.28)",
                    transition: "opacity 0.2s, transform 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  ＋ Add Resource
                </button>
              )}
              <button
                type="button"
                onClick={() => loadAssets()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: "rgba(34,211,238,0.1)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  color: "#22d3ee",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(34,211,238,0.18)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(34,211,238,0.1)")
                }
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {isAdmin && showCreate && (
            <div
              style={{
                background: "rgba(8,15,30,0.6)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 14,
                padding: 20,
                marginBottom: 24,
                animation: "fadeSlideUp 220ms ease-out",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#334155",
                  marginBottom: 14,
                }}
              >
                Add resource
              </p>

              {createError && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    color: "#fca5a5",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  ⚠ {createError}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <FilterInput
                  value={createForm.name}
                  onChange={setCreateField("name")}
                  placeholder="Resource name"
                  error={createFieldErrors.name}
                />
                <FilterInput
                  value={createForm.type}
                  onChange={setCreateField("type")}
                  placeholder="Type"
                  error={createFieldErrors.type}
                />
                <FilterInput
                  type="number"
                  value={createForm.capacity}
                  onChange={setCreateField("capacity")}
                  placeholder="Capacity"
                  error={createFieldErrors.capacity}
                />
                <FilterInput
                  value={createForm.location}
                  onChange={setCreateField("location")}
                  placeholder="Location"
                  error={createFieldErrors.location}
                />
                <FilterInput
                  value={createForm.status}
                  onChange={setCreateField("status")}
                  error={createFieldErrors.status}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </FilterInput>
              </div>

              {Object.values(createFieldErrors).some(Boolean) && (
                <div style={{ marginBottom: 12, fontSize: 12, color: "#f87171" }}>
                  {Object.entries(createFieldErrors).map(
                    ([k, v]) => v && <p key={k} style={{ margin: "2px 0" }}>• {v}</p>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError("");
                    setCreateFieldErrors({});
                  }}
                  disabled={createSubmitting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: createSubmitting ? "not-allowed" : "pointer",
                    opacity: createSubmitting ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createSubmitting}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: createSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(6,182,212,0.3)",
                    opacity: createSubmitting ? 0.75 : 1,
                  }}
                >
                  {createSubmitting ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.25)",
                color: "#fca5a5",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* filters */}
          <div
            style={{
              background: "rgba(8,15,30,0.6)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#334155",
                marginBottom: 14,
              }}
            >
              Filter resources
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <FilterInput
                value={filters.q}
                onChange={setField("q")}
                placeholder="Search by name…"
                error={formErrors.q}
              />
              <FilterInput
                value={filters.type}
                onChange={setField("type")}
                placeholder="Type"
                error={formErrors.type}
              />
              <FilterInput
                type="number"
                value={filters.minCapacity}
                onChange={setField("minCapacity")}
                placeholder="Min capacity"
                error={formErrors.minCapacity}
              />
              <FilterInput
                value={filters.location}
                onChange={setField("location")}
                placeholder="Location"
                error={formErrors.location}
              />
              <FilterInput
                value={filters.status}
                onChange={setField("status")}
                error={formErrors.status}
              >
                <option value="">Any status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </FilterInput>
            </div>

            {Object.values(formErrors).some(Boolean) && (
              <div style={{ marginBottom: 12, fontSize: 12, color: "#f87171" }}>
                {Object.entries(formErrors).map(
                  ([k, v]) => v && <p key={k} style={{ margin: "2px 0" }}>• {v}</p>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                }
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSearch}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(6,182,212,0.3)",
                  transition: "opacity 0.2s, transform 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.97)")
                }
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Search
              </button>
            </div>
          </div>

          {/* table + detail panel */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selected ? "1.5fr 1fr" : "1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* table */}
            <div
              style={{
                background: "rgba(8,15,30,0.5)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Resource", "Type", "Cap.", "Location", "Status", "Avail."].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "#334155",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : assets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "40px 16px",
                          textAlign: "center",
                          color: "#334155",
                          fontSize: 14,
                        }}
                      >
                        No resources found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    assets.map((a, idx) => {
                      const isSelected = selected?.id === a.id;
                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelected(isSelected ? null : a)}
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.035)",
                            cursor: "pointer",
                            background: isSelected
                              ? "rgba(34,211,238,0.06)"
                              : "transparent",
                            transition: "background 0.15s",
                            animation: `fadeSlideUp 0.3s ease ${idx * 0.04}s both`,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.025)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#f1f5f9",
                                margin: 0,
                              }}
                            >
                              {a.name}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#334155",
                                margin: "2px 0 0",
                                fontFamily: "monospace",
                              }}
                            >
                              #{a.id}
                            </p>
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 13,
                              color: "#94a3b8",
                            }}
                          >
                            {a.type}
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 13,
                              color: "#94a3b8",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {a.capacity}
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 13,
                              color: "#94a3b8",
                            }}
                          >
                            {a.location}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <StatusBadge status={a.status} />
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <AvailBadge now={a.availableNow} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* detail panel */}
            {selected && (
              <aside
                style={{
                  background: "rgba(8,15,30,0.6)",
                  border: "1px solid rgba(34,211,238,0.12)",
                  borderRadius: 16,
                  padding: 20,
                  position: "sticky",
                  top: 20,
                  animation: "fadeSlideUp 0.25s ease both",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#f1f5f9",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {selected.name}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#334155",
                        fontFamily: "monospace",
                        marginTop: 3,
                      }}
                    >
                      ID #{selected.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      color: "#475569",
                      width: 28,
                      height: 28,
                      cursor: "pointer",
                      fontSize: 16,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                <DetailRow label="Type" value={selected.type} />
                <DetailRow label="Capacity" value={selected.capacity} />
                <DetailRow label="Location" value={selected.location} />
                <div style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 14px",
                      borderRadius: 10,
                      background: "rgba(15,23,42,0.4)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: 13 }}>Status</span>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 14px",
                      borderRadius: 10,
                      background: "rgba(15,23,42,0.4)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: 13 }}>
                      Available now
                    </span>
                    <AvailBadge now={selected.availableNow} />
                  </div>
                </div>

                {/* availability windows */}
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#334155",
                      marginBottom: 10,
                    }}
                  >
                    Availability windows
                  </p>
                  {(selected.availabilityWindows || []).length === 0 ? (
                    <p style={{ fontSize: 13, color: "#475569" }}>
                      No windows configured.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {selected.availabilityWindows.map((w, idx) => (
                        <div
                          key={`${w.id || "w"}-${idx}`}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(6,182,212,0.06)",
                            border: "1px solid rgba(6,182,212,0.15)",
                            fontSize: 12,
                            color: "#67e8f9",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          🕐 {fmtWindow(w.startAt, w.endAt)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Resources;