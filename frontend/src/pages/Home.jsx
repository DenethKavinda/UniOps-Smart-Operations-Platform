import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

const moduleCards = [
  {
    title: "Users",
    desc: "Manage admin, staff, and student roles.",
    route: "/users",
    icon: UsersIcon,
  },
  {
    title: "Bookings",
    desc: "Track room and facility reservations.",
    route: "/bookings",
    icon: CalendarIcon,
  },
  {
    title: "Maintenance",
    desc: "Create and resolve service requests.",
    route: "/maintenance",
    icon: WrenchIcon,
  },
  {
    title: "Assets",
    desc: "Monitor equipment lifecycle and status.",
    route: "/assets",
    icon: ArchiveIcon,
  },
];

const quickActions = [
  { label: "New Booking", route: "/bookings/new", icon: PlusIcon },
  { label: "Report Issue", route: "/maintenance/new", icon: AlertIcon },
  { label: "View Assets", route: "/assets", icon: ArchiveIcon },
  { label: "Open Calendar", route: "/calendar", icon: CalendarIcon },
];

function Home({
  user,
  onOpenNotifications,
  unreadNotificationCount = 0,
  hasNewNotificationAlert = false,
  onNavigate,
}) {
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [homeSummary, setHomeSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");

  const notificationsStreamUrl = useMemo(() => {
    const base = (api.defaults.baseURL || "http://localhost:8081/api").replace(
      /\/+$/,
      "",
    );
    return `${base}/notifications/stream`;
  }, []);

  const notificationsLastSeenKey = useMemo(() => {
    const identity = user?.id || user?.email || "guest";
    return `uniops_notifications_last_seen_${identity}`;
  }, [user?.email, user?.id]);

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError("");

      try {
        const response = await api.get("/dashboard/home");
        if (mounted && response.data?.success) {
          setHomeSummary(response.data.data || null);
        } else if (mounted) {
          setSummaryError(
            response.data?.message || "Unable to load dashboard summary.",
          );
        }
      } catch (error) {
        if (mounted) {
          setSummaryError(
            error.response?.data?.message ||
              "Unable to load dashboard summary.",
          );
        }
      } finally {
        if (mounted) {
          setSummaryLoading(false);
          setLoading(false);
        }
      }
    };

    loadSummary();
    const intervalId = window.setInterval(loadSummary, 15000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const response = await api.get("/notifications");
        const items = response.data?.success ? response.data.data || [] : [];
        if (mounted) {
          setNotificationItems(items);
        }
      } catch (error) {
        if (mounted) {
          setNotificationsError(
            error.response?.data?.message || "Unable to load notifications.",
          );
        }
      } finally {
        if (mounted) {
          setNotificationsLoading(false);
        }
      }
    };

    loadNotifications();

    const stream = new EventSource(notificationsStreamUrl);
    const refresh = () => {
      loadNotifications();
    };

    stream.addEventListener("notification-created", refresh);
    stream.addEventListener("notification-deleted", refresh);
    stream.onerror = () => {
      stream.close();
    };

    return () => {
      mounted = false;
      stream.removeEventListener("notification-created", refresh);
      stream.removeEventListener("notification-deleted", refresh);
      stream.close();
    };
  }, [notificationsStreamUrl]);

  const stats = useMemo(() => {
    const summary = homeSummary || {};

    return [
      {
        label: "Total Resources",
        value: summary.totalResources ?? 0,
        tone: "cyan",
        icon: ArchiveIcon,
      },
      {
        label: "Active Bookings",
        value: summary.activeBookings ?? 0,
        tone: "emerald",
        icon: CalendarIcon,
      },
      {
        label: "Pending Bookings",
        value: summary.pendingBookings ?? 0,
        tone: "amber",
        icon: ClockIcon,
      },
      {
        label: "Open Tickets",
        value: summary.openTickets ?? 0,
        tone: "rose",
        icon: TicketIcon,
      },
      {
        label: "In Progress Tickets",
        value: summary.inProgressTickets ?? 0,
        tone: "blue",
        icon: WrenchIcon,
      },
    ];
  }, [homeSummary]);

  const ticketSummary = useMemo(() => {
    const highPriorityTickets = homeSummary?.highPriorityTickets ?? 0;
    return {
      highPriority: highPriorityTickets,
      alert: `${highPriorityTickets} urgent issue${highPriorityTickets === 1 ? "" : "s"} need attention`,
    };
  }, [homeSummary]);

  const resourceSnapshot = useMemo(
    () => ({
      available: homeSummary?.availableResources ?? 0,
      busy: homeSummary?.busyResources ?? 0,
    }),
    [homeSummary],
  );

  const recentActivityItems = useMemo(() => {
    const items = homeSummary?.recentActivities || [];
    return items.map((item) => ({
      ...item,
      icon: getActivityIcon(item.kind),
      time: formatRelativeTime(item.createdAt),
    }));
  }, [homeSummary]);

  const visibleNotifications = useMemo(() => {
    const lastSeenRaw = localStorage.getItem(notificationsLastSeenKey);
    const lastSeen = lastSeenRaw ? new Date(lastSeenRaw) : null;

    return [...notificationItems]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((item) => {
        const createdAt = new Date(item.createdAt);
        const unread =
          !lastSeen || Number.isNaN(lastSeen.getTime())
            ? true
            : createdAt > lastSeen;

        return {
          ...item,
          read: !unread,
          time: formatRelativeTime(item.createdAt),
        };
      });
  }, [notificationItems, notificationsLastSeenKey]);

  const unreadVisibleCount = visibleNotifications.filter(
    (item) => !item.read,
  ).length;

  const navigateTo = (route) => {
    if (typeof onNavigate === "function") {
      onNavigate(route);
      return;
    }

    window.location.assign(route);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
  };

  const handleMarkAsRead = () => {
    const latestCreatedAt =
      notificationItems.length > 0
        ? notificationItems[0].createdAt
        : new Date().toISOString();
    localStorage.setItem(notificationsLastSeenKey, latestCreatedAt);
  };

  return (
    <main id="dashboard" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(14,116,144,0.22),_transparent_35%),linear-gradient(180deg,_rgba(2,6,23,0.0),_rgba(2,6,23,0.18))]" />

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="relative mb-6 flex justify-end">
          <button
            type="button"
            onClick={toggleNotifications}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              hasNewNotificationAlert || unreadVisibleCount > 0
                ? "border-amber-300/70 bg-amber-400/15 text-amber-100"
                : "border-cyan-400/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
            }`}
            title="Open notifications"
          >
            <BellIcon />
            Notifications
            {(unreadNotificationCount > 0 || unreadVisibleCount > 0) && (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                {Math.max(unreadNotificationCount, unreadVisibleCount) > 99
                  ? "99+"
                  : Math.max(unreadNotificationCount, unreadVisibleCount)}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-14 z-30 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Notifications
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    Latest updates
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleMarkAsRead}
                  className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                >
                  Mark as read
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {notificationsLoading ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-4 text-sm text-slate-300">
                    Loading live notifications...
                  </div>
                ) : notificationsError ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-4 text-sm text-rose-200">
                    {notificationsError}
                  </div>
                ) : visibleNotifications.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-4 text-sm text-slate-300">
                    No notifications available.
                  </div>
                ) : (
                  visibleNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-2xl border px-3 py-3 transition ${
                        notification.read
                          ? "border-slate-800 bg-slate-950/60"
                          : "border-cyan-500/30 bg-cyan-500/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Open Notifications
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {hasNewNotificationAlert && unreadNotificationCount > 0 && (
          <div className="mb-5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            New notification alert: you have {unreadNotificationCount} unread
            message{unreadNotificationCount > 1 ? "s" : ""}.
          </div>
        )}

        {loading || summaryLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
            <SkeletonBlock className="h-56" />
            <SkeletonBlock className="h-36" />
          </div>
        ) : (
          <>
            {summaryError && (
              <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {summaryError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {stats.map((stat) => (
                <StatsCard key={stat.label} {...stat} />
              ))}
            </div>

            <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-[0_24px_80px_rgba(2,132,199,0.12)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-3 inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Campus Operations Platform
                  </p>
                  <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                    Command center for daily university operations.
                  </h2>
                  <p className="mt-3 text-cyan-300">
                    Welcome back, {user?.name}.{" "}
                    {user?.role ? `Role: ${user.role}.` : ""}
                  </p>
                  <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
                    One dashboard for users, bookings, maintenance, and assets
                    with real-time visibility and cleaner workflows.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {user?.role === "ADMIN" && (
                    <ActionButton
                      label="Approve Bookings"
                      icon={CheckIcon}
                      onClick={() => navigateTo("/bookings")}
                    />
                  )}
                  {user?.role === "TECHNICIAN" && (
                    <ActionButton
                      label="My Tickets"
                      icon={TicketIcon}
                      onClick={() => navigateTo("/maintenance")}
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Quick Actions
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Fast access to the most common campus workflows.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((action) => (
                  <ActionButton
                    key={action.label}
                    label={action.label}
                    icon={action.icon}
                    onClick={() => navigateTo(action.route)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">Modules</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Open the core campus operation areas.
                  </p>
                </div>
              </div>
              <div
                id="modules"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {moduleCards.map((module) => (
                  <ModuleCard
                    key={module.title}
                    title={module.title}
                    desc={module.desc}
                    icon={module.icon}
                    onClick={() => navigateTo(module.route)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Recent Activity
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Latest operational events across the campus.
                    </p>
                  </div>
                  <ActivityIcon />
                </div>
                <div className="mt-5 space-y-4">
                  {recentActivityItems.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4 text-sm text-slate-300">
                      No recent activity yet.
                    </div>
                  ) : (
                    recentActivityItems.map((activity) => (
                      <ActivityItem key={activity.title} {...activity} />
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Ticket Summary
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      High-priority tickets require attention now.
                    </p>
                  </div>
                  <TicketBadge />
                </div>

                <div className="mt-5 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-200">
                        High Priority Tickets
                      </p>
                      <p className="mt-2 text-4xl font-black text-white">
                        {ticketSummary.highPriority}
                      </p>
                    </div>
                    <div className="max-w-xs rounded-2xl border border-rose-400/20 bg-slate-950/70 p-4 text-sm text-rose-100">
                      {ticketSummary.alert}
                    </div>
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6">
                <h3 className="text-xl font-bold text-white">
                  Resource Availability Snapshot
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Live view of immediately available versus busy resources.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <MetricTile
                    label="Available Now"
                    value={resourceSnapshot.available}
                    tone="emerald"
                  />
                  <MetricTile
                    label="Busy Resources"
                    value={resourceSnapshot.busy}
                    tone="amber"
                  />
                </div>
                <div className="mt-5 h-3 rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{
                      width: `${
                        resourceSnapshot.available + resourceSnapshot.busy > 0
                          ? Math.round(
                              (resourceSnapshot.available /
                                (resourceSnapshot.available +
                                  resourceSnapshot.busy)) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  {resourceSnapshot.available} available resources right now,{" "}
                  {resourceSnapshot.busy} currently in use.
                </p>
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6">
                <h3 className="text-xl font-bold text-white">Summary</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <InfoRow label="Open tickets" value={stats[3].value} />
                  <InfoRow label="In progress tickets" value={stats[4].value} />
                  <InfoRow label="Pending bookings" value={stats[2].value} />
                  <InfoRow
                    label="Resources available"
                    value={resourceSnapshot.available}
                  />
                </div>
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function StatsCard({ label, value, tone, icon: Icon }) {
  const toneClasses = {
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    blue: "border-blue-400/20 bg-blue-500/10 text-blue-300",
  };

  return (
    <article
      className={`group rounded-3xl border p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-1 hover:border-cyan-400/50 ${toneClasses[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          {label}
        </p>
        <span className="inline-flex rounded-full bg-slate-950/50 p-2 text-current">
          <Icon />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
      <div className="mt-4 h-1.5 rounded-full bg-slate-800">
        <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-4/5" />
      </div>
    </article>
  );
}

function ModuleCard({ title, desc, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-slate-800 bg-slate-900/75 p-5 text-left shadow-[0_0_0_1px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300">
          <Icon />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Open →
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{desc}</p>
    </button>
  );
}

function ActionButton({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-900 hover:text-white"
    >
      <Icon />
      {label}
    </button>
  );
}

function ActivityItem({ title, detail, time, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
        <Icon />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold text-white">{title}</h4>
          <span className="shrink-0 text-xs text-slate-400">{time}</span>
        </div>
        <p className="mt-1 text-sm text-slate-300">{detail}</p>
      </div>
    </div>
  );
}

function MetricTile({ label, value, tone }) {
  const toneClasses = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
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

function SkeletonCard() {
  return (
    <div className="h-36 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="h-3 w-24 rounded-full bg-slate-800" />
      <div className="mt-4 h-8 w-28 rounded-full bg-slate-800" />
      <div className="mt-6 h-2 rounded-full bg-slate-800" />
    </div>
  );
}

function SkeletonBlock({ className = "h-48" }) {
  return (
    <div
      className={`animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70 ${className}`}
    />
  );
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function getActivityIcon(kind) {
  switch (kind) {
    case "booking-approved":
      return CheckIcon;
    case "booking-pending":
      return ClockIcon;
    case "booking-updated":
      return CalendarIcon;
    case "ticket-created":
      return TicketIcon;
    case "technician-assigned":
      return UserCheckIcon;
    case "ticket-resolved":
      return ShieldIcon;
    case "asset-status":
      return ArchiveIcon;
    default:
      return TicketIcon;
  }
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a4 4 0 01-5.6 5.6L3 18l3 3 6.1-6.1a4 4 0 005.6-5.6l3.3-3.3-2.1-2.1-3.3 3.3z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 010 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 010-4V9z" />
      <path d="M9 9v6" />
      <path d="M15 9v6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 11a4 4 0 10-8 0" />
      <path d="M12 14v7" />
      <path d="M6 21v-2a6 6 0 0112 0v2" />
      <path d="M19 16l2 2 4-4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-8 w-8 text-cyan-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}

function TicketBadge() {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">
      <TicketIcon />
    </div>
  );
}

export default Home;
