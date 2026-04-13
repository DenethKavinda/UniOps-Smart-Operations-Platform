import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

const sections = [
  { id: "users", label: "Users" },
  { id: "bookings", label: "Booking" },
  { id: "maintenance", label: "Maintenance" },
  { id: "assets", label: "Assets" },
];

function AdminDashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [activeSection, setActiveSection] = useState("users");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/dashboard");
      if (response.data?.success) {
        setDashboard(response.data.data);
      } else {
        setError(response.data?.message || "Unable to load admin dashboard.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const users = dashboard?.users || [];
  const roleStats = dashboard?.roleStats || [];
  const loginChart = dashboard?.loginChart || [];
  const maxLogins = useMemo(
    () => Math.max(1, ...loginChart.map((item) => item.loginCount || 0)),
    [loginChart],
  );

  const updateUserRole = async (userId, role) => {
    setSavingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user role.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleBlock = async (targetUser) => {
    setSavingId(targetUser.id);
    try {
      await api.put(`/admin/users/${targetUser.id}/block`, {
        blocked: !targetUser.blocked,
      });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user status.");
    } finally {
      setSavingId(null);
    }
  };

  const moduleCards = [
    {
      title: "Users",
      value: dashboard?.totalUsers ?? 0,
      note: `${dashboard?.blockedUsers ?? 0} blocked accounts`,
    },
    {
      title: "Booking",
      value: dashboard?.bookingCount ?? 0,
      note: "Reservation records loaded",
    },
    {
      title: "Maintenance",
      value: dashboard?.maintenanceCount ?? 0,
      note: "Service requests tracked",
    },
    {
      title: "Assets",
      value: dashboard?.assetCount ?? 0,
      note: "Asset inventory overview",
    },
  ];

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_35%)]" />

      <section className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Admin Console
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">UniOps</h2>
            <p className="mt-2 text-sm text-slate-300">{user?.name}</p>
            <div className="mt-6 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeSection === section.id
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-950/60 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>{section.label}</span>
                  <span className="text-xs opacity-80">
                    {section.id === activeSection ? "Open" : "View"}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
              Signed in as {user?.role}. Role control and block/unblock actions
              are available on the Users panel.
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Admin Dashboard
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-white sm:text-4xl">
                  Control users, bookings, maintenance, and assets.
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Review role distribution, watch login activity, and manage
                  user access from one place.
                </p>
              </div>
              <button
                type="button"
                onClick={loadDashboard}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Refresh data
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={dashboard?.totalUsers ?? 0}
              tone="cyan"
            />
            <StatCard
              label="Admins"
              value={dashboard?.adminUsers ?? 0}
              tone="blue"
            />
            <StatCard
              label="Students"
              value={dashboard?.studentUsers ?? 0}
              tone="emerald"
            />
            <StatCard
              label="Blocked"
              value={dashboard?.blockedUsers ?? 0}
              tone="rose"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Users overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Role split and login activity based on current user records.
                  </p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  {dashboard?.totalLogins ?? 0} total logins
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Role percentage
                  </h3>
                  <div className="mt-4 space-y-4">
                    {roleStats.map((item) => (
                      <div key={item.role}>
                        <div className="flex items-center justify-between text-sm text-slate-200">
                          <span>{item.role}</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="mt-2 h-3 rounded-full bg-slate-800">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.count} accounts
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    User logins
                  </h3>
                  <div className="mt-4 space-y-3">
                    {loginChart.map((item) => (
                      <div key={item.id}>
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
                          <span className="truncate">{item.name}</span>
                          <span>{item.loginCount}</span>
                        </div>
                        <div className="mt-2 h-3 rounded-full bg-slate-800">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                            style={{
                              width: `${(item.loginCount / maxLogins) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {moduleCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {card.title}
                    </p>
                    <p className="mt-3 text-3xl font-black text-white">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">{card.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
                <h2 className="text-xl font-bold text-white">Module panel</h2>
                <p className="mt-1 text-sm text-slate-300">
                  {activeSection === "users" &&
                    "Manage role changes, block status, and account activity."}
                  {activeSection === "bookings" &&
                    "View booking totals and reservation workload."}
                  {activeSection === "maintenance" &&
                    "Track open, active, and resolved maintenance requests."}
                  {activeSection === "assets" &&
                    "Monitor inventory and asset availability."}
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <InfoRow
                    label="Bookings"
                    value={dashboard?.bookingCount ?? 0}
                  />
                  <InfoRow
                    label="Maintenance"
                    value={dashboard?.maintenanceCount ?? 0}
                  />
                  <InfoRow label="Assets" value={dashboard?.assetCount ?? 0} />
                  <InfoRow
                    label="Blocked users"
                    value={dashboard?.blockedUsers ?? 0}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
                <h2 className="text-xl font-bold text-white">Current admin</h2>
                <p className="mt-2 text-sm text-slate-300">{user?.name}</p>
                <p className="text-sm text-cyan-300">{user?.email}</p>
                <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                  Use the user table to promote students to admin, demote admins
                  to student, or block access.
                </div>
              </section>
            </aside>
          </div>

          {activeSection === "users" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    User management
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Edit roles and toggle access without leaving the dashboard.
                  </p>
                </div>
                <span className="text-sm text-slate-400">
                  {users.length} users in total
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Logins</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-slate-300"
                        >
                          Loading users...
                        </td>
                      </tr>
                    ) : (
                      users.map((item) => (
                        <tr
                          key={item.id}
                          className="rounded-2xl bg-slate-950/60"
                        >
                          <td className="rounded-l-2xl px-4 py-4">
                            <p className="font-semibold text-white">
                              {item.name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {item.email}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={item.role}
                              onChange={(e) =>
                                updateUserRole(item.id, e.target.value)
                              }
                              disabled={savingId === item.id}
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-200">
                            {item.loginCount}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                item.blocked
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {item.blocked ? "Blocked" : "Active"}
                            </span>
                          </td>
                          <td className="rounded-r-2xl px-4 py-4">
                            <button
                              type="button"
                              onClick={() => toggleBlock(item)}
                              disabled={savingId === item.id}
                              className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                item.blocked
                                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                  : "bg-rose-500 text-white hover:bg-rose-400"
                              }`}
                            >
                              {item.blocked ? "Unblock" : "Block"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection !== "users" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              <h2 className="text-xl font-bold text-white">
                {
                  sections.find((section) => section.id === activeSection)
                    ?.label
                }
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                The sidebar is wired and the summary cards are live. Expand this
                module with CRUD actions when the domain workflow is ready.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {moduleCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <p className="text-sm text-slate-400">{card.title}</p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {card.value}
                    </p>
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

function StatCard({ label, value, tone }) {
  const toneClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-400/20 text-cyan-300",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-400/20 text-blue-300",
    emerald:
      "from-emerald-500/20 to-emerald-500/5 border-emerald-400/20 text-emerald-300",
    rose: "from-rose-500/20 to-rose-500/5 border-rose-400/20 text-rose-300",
  };

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-lg ${toneClasses[tone]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

export default AdminDashboard;
