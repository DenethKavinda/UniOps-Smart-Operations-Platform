import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axiosConfig";

const sections = [
  { id: "users", label: "Users" },
  { id: "bookings", label: "Booking" },
  { id: "maintenance", label: "Maintenance" },
  { id: "assets", label: "Assets" },
  { id: "notifications", label: "Notifications" },
];

function AdminDashboard({ user, onOpenAddNotifications, onOpenAnalytics }) {
  const [dashboard, setDashboard] = useState(null);
  const [activeSection, setActiveSection] = useState("users");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [userActionModal, setUserActionModal] = useState({
    open: false,
    action: null,
    targetUser: null,
  });
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [assets, setAssets] = useState([]);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    linkUrl: "",
    linkLabel: "",
    documentUrl: "",
    documentFile: null,
  });
  const documentInputRef = useRef(null);

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

  const loadBookings = async () => {
    try {
      const response = await api.get("/bookings");
      if (response.data?.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      setError("Unable to load bookings.");
    }
  };

  const loadMaintenance = async () => {
    try {
      const response = await api.get("/maintenance");
      if (response.data?.success) {
        setMaintenance(response.data.data);
      }
    } catch (err) {
      setError("Unable to load maintenance records.");
    }
  };

  const loadAssets = async () => {
    try {
      const response = await api.get("/assets");
      if (response.data?.success) {
        setAssets(response.data.data);
      }
    } catch (err) {
      setError("Unable to load assets.");
    }
  };

  useEffect(() => {
    if (activeSection === "bookings" && bookings.length === 0) {
      loadBookings();
    } else if (activeSection === "maintenance" && maintenance.length === 0) {
      loadMaintenance();
    } else if (activeSection === "assets" && assets.length === 0) {
      loadAssets();
    }
  }, [activeSection]);

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

  const openUserActionModal = (action, targetUser) => {
    setError("");
    setUserActionModal({ open: true, action, targetUser });
  };

  const closeUserActionModal = () => {
    setUserActionModal({ open: false, action: null, targetUser: null });
  };

  const confirmUserAction = async () => {
    if (!userActionModal.targetUser || !userActionModal.action) {
      return;
    }

    const { action, targetUser } = userActionModal;
    setSavingId(targetUser.id);
    try {
      if (action === "delete") {
        await api.delete(`/admin/users/${targetUser.id}`);
      } else {
        await api.put(`/admin/users/${targetUser.id}/block`, {
          blocked: action === "block",
        });
      }
      await loadDashboard();
      closeUserActionModal();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user status.");
    } finally {
      setSavingId(null);
    }
  };

  const userActionMessage = userActionModal.targetUser
    ? userActionModal.action === "delete"
      ? `This will permanently remove ${userActionModal.targetUser.name} from UniOps. This action cannot be undone.`
      : userActionModal.action === "block"
        ? `Block ${userActionModal.targetUser.name}? They will no longer be able to access the system.`
        : `Unblock ${userActionModal.targetUser.name}? They will regain access to the system.`
    : "";

  const userActionConfirmLabel =
    userActionModal.action === "delete"
      ? "Delete user"
      : userActionModal.action === "block"
        ? "Block user"
        : "Unblock user";

  const userActionToneClasses =
    userActionModal.action === "unblock"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : "border-rose-500/30 bg-rose-500/10 text-rose-300";

  const userActionConfirmClasses =
    userActionModal.action === "unblock"
      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
      : "bg-rose-500 text-white hover:bg-rose-400";

  const handleNotificationField = (field, value) => {
    setNotificationForm((prev) => ({ ...prev, [field]: value }));
  };

  const createNotification = async (e) => {
    e.preventDefault();
    setNotificationSaving(true);

    try {
      const payload = {
        title: notificationForm.title,
        message: notificationForm.message,
        linkUrl: notificationForm.linkUrl,
        linkLabel: notificationForm.linkLabel,
        documentUrl: notificationForm.documentUrl,
        createdBy: user?.name,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      if (notificationForm.documentFile) {
        formData.append("document", notificationForm.documentFile);
      }

      const response = await api.post("/admin/notifications", formData);
      if (response.data?.success) {
        setNotificationForm({
          title: "",
          message: "",
          linkUrl: "",
          linkLabel: "",
          documentUrl: "",
          documentFile: null,
        });
        if (documentInputRef.current) {
          documentInputRef.current.value = "";
        }
      } else {
        setError(response.data?.message || "Unable to create notification.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create notification.");
    } finally {
      setNotificationSaving(false);
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
              <button
                type="button"
                onClick={onOpenAnalytics}
                className="flex w-full items-center justify-between rounded-2xl bg-slate-950/60 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                <span>Analytics</span>
                <span className="text-xs opacity-80">View</span>
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
              Signed in as {user?.role}. Role control and block/unblock actions
              are available on the Users panel.
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {activeSection === "users" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    User Management
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Edit roles and manage user access. {users.length} users in
                    total
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDashboard}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Email</th>
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
                          colSpan="6"
                          className="px-4 py-8 text-center text-slate-300"
                        >
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-8 text-center text-slate-300"
                        >
                          No users found
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
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-400">
                            {item.email}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={item.role}
                              onChange={(e) =>
                                updateUserRole(item.id, e.target.value)
                              }
                              disabled={savingId === item.id}
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
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
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openUserActionModal(
                                    item.blocked ? "unblock" : "block",
                                    item,
                                  )
                                }
                                disabled={savingId === item.id}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  item.blocked
                                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                    : "bg-rose-500 text-white hover:bg-rose-400"
                                }`}
                              >
                                {item.blocked ? "Unblock" : "Block"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openUserActionModal("delete", item)
                                }
                                disabled={savingId === item.id}
                                className="rounded-lg border border-rose-500/40 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {activeSection === "users" && (
                <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
                  <h2 className="text-xl font-bold text-white">
                    Role percentage
                  </h2>
                  <div className="mt-4 space-y-4">
                    {roleStats.map((item) => (
                      <div key={item.role}>
                        <div className="flex items-center justify-between text-sm text-slate-200">
                          <span>{item.role}</span>
                          <span className="font-semibold">
                            {item.count} accounts ({item.percentage}%)
                          </span>
                        </div>
                        <div className="mt-2 h-3 rounded-full bg-slate-800">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </section>
          )}

          {activeSection !== "users" && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
              {activeSection === "bookings" && (
                <>
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Booking Management
                      </h2>
                      <p className="mt-2 text-sm text-slate-300">
                        View and manage all room bookings. {bookings.length}{" "}
                        total bookings
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadBookings}
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                          <th className="px-4 py-2">Title</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-slate-300"
                            >
                              Loading bookings...
                            </td>
                          </tr>
                        ) : bookings.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-slate-300"
                            >
                              No bookings found
                            </td>
                          </tr>
                        ) : (
                          bookings.map((item) => (
                            <tr
                              key={item.id}
                              className="rounded-2xl bg-slate-950/60"
                            >
                              <td className="rounded-l-2xl px-4 py-4">
                                <p className="font-semibold text-white">
                                  {item.title}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                    item.status === "CONFIRMED"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : item.status === "CANCELLED"
                                        ? "bg-rose-500/20 text-rose-300"
                                        : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="rounded-r-2xl px-4 py-4 text-sm text-slate-300">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeSection === "maintenance" && (
                <>
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Maintenance Management
                      </h2>
                      <p className="mt-2 text-sm text-slate-300">
                        Track maintenance requests and status.{" "}
                        {maintenance.length} total requests
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadMaintenance}
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                          <th className="px-4 py-2">Title</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-slate-300"
                            >
                              Loading maintenance requests...
                            </td>
                          </tr>
                        ) : maintenance.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-slate-300"
                            >
                              No maintenance requests found
                            </td>
                          </tr>
                        ) : (
                          maintenance.map((item) => (
                            <tr
                              key={item.id}
                              className="rounded-2xl bg-slate-950/60"
                            >
                              <td className="rounded-l-2xl px-4 py-4">
                                <p className="font-semibold text-white">
                                  {item.title}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                    item.status === "RESOLVED"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : item.status === "PENDING"
                                        ? "bg-yellow-500/20 text-yellow-300"
                                        : "bg-blue-500/20 text-blue-300"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="rounded-r-2xl px-4 py-4 text-sm text-slate-300">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeSection === "assets" && (
                <>
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Asset Management
                      </h2>
                      <p className="mt-2 text-sm text-slate-300">
                        Monitor campus assets and availability. {assets.length}{" "}
                        total assets
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadAssets}
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                          <th className="px-4 py-2">Asset Name</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-slate-300"
                            >
                              Loading assets...
                            </td>
                          </tr>
                        ) : assets.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-4 py-8 text-center text-slate-300"
                            >
                              No assets found
                            </td>
                          </tr>
                        ) : (
                          assets.map((item) => (
                            <tr
                              key={item.id}
                              className="rounded-2xl bg-slate-950/60"
                            >
                              <td className="rounded-l-2xl px-4 py-4">
                                <p className="font-semibold text-white">
                                  {item.name}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                    item.status === "AVAILABLE"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : item.status === "UNAVAILABLE"
                                        ? "bg-rose-500/20 text-rose-300"
                                        : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="rounded-r-2xl px-4 py-4 text-sm text-slate-300">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeSection === "notifications" && (
                <>
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Manage Notifications
                      </h2>
                      <p className="mt-2 text-sm text-slate-300">
                        Publish notifications here. Published notifications are
                        listed on a separate page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenAddNotifications}
                      className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                    >
                      View Published Notifications
                    </button>
                  </div>

                  <form
                    onSubmit={createNotification}
                    className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-200">
                        Title
                      </label>
                      <input
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) =>
                          handleNotificationField("title", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                        placeholder="Exam update, Assignment submission, Event alert..."
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-200">
                        Message
                      </label>
                      <textarea
                        rows="4"
                        value={notificationForm.message}
                        onChange={(e) =>
                          handleNotificationField("message", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                        placeholder="Write full notification details here..."
                        required
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-200">
                          Submission / Form Link
                        </label>
                        <input
                          type="url"
                          value={notificationForm.linkUrl}
                          onChange={(e) =>
                            handleNotificationField("linkUrl", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                          placeholder="https://forms.google.com/..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-200">
                          Link Label
                        </label>
                        <input
                          type="text"
                          value={notificationForm.linkLabel}
                          onChange={(e) =>
                            handleNotificationField("linkLabel", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                          placeholder="Open submission"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-200">
                        PDF / Document URL
                      </label>
                      <input
                        type="url"
                        value={notificationForm.documentUrl}
                        onChange={(e) =>
                          handleNotificationField("documentUrl", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                        placeholder="https://drive.google.com/... or any document link"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-200">
                        Upload Image or Document
                      </label>
                      <input
                        ref={documentInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) =>
                          handleNotificationField(
                            "documentFile",
                            e.target.files?.[0] || null,
                          )
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-slate-950"
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        Images will be shown inline in notifications. Max upload
                        size is 10 MB.
                      </p>
                      {notificationForm.documentFile &&
                        notificationForm.documentFile.type.startsWith(
                          "image/",
                        ) && (
                          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80">
                            <img
                              src={URL.createObjectURL(
                                notificationForm.documentFile,
                              )}
                              alt="Notification attachment preview"
                              className="max-h-56 w-full object-cover"
                            />
                          </div>
                        )}
                    </div>

                    <button
                      type="submit"
                      disabled={notificationSaving}
                      className="justify-self-start rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {notificationSaving
                        ? "Publishing..."
                        : "Publish Notification"}
                    </button>
                  </form>
                </>
              )}
            </section>
          )}
        </div>
      </section>

      {userActionModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4"
          onClick={closeUserActionModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-action-title"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${userActionToneClasses}`}
            >
              Confirm action
            </div>
            <h4 id="user-action-title" className="text-xl font-bold text-white">
              {userActionConfirmLabel}
            </h4>
            <p className="mt-2 text-sm text-slate-300">{userActionMessage}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeUserActionModal}
                disabled={savingId === userActionModal.targetUser?.id}
                className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUserAction}
                disabled={savingId === userActionModal.targetUser?.id}
                className={`flex-1 rounded-lg px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${userActionConfirmClasses}`}
              >
                {savingId === userActionModal.targetUser?.id
                  ? "Processing..."
                  : userActionConfirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
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
