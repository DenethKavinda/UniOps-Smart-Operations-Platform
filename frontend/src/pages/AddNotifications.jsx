import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

function AddNotifications({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationDeletingId, setNotificationDeletingId] = useState(null);
  const [error, setError] = useState("");

  const notificationsStreamUrl = useMemo(() => {
    const base = (api.defaults.baseURL || "http://localhost:8081/api").replace(
      /\/+$/,
      "",
    );
    return `${base}/notifications/stream`;
  }, []);

  const notificationsBaseUrl = useMemo(() => {
    return (api.defaults.baseURL || "http://localhost:8081/api").replace(
      /\/+$/,
      "",
    );
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications");
      if (response.data?.success) {
        setNotifications(response.data.data || []);
        setError("");
      } else {
        setError(response.data?.message || "Unable to load notifications.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
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
      stream.removeEventListener("notification-created", refresh);
      stream.removeEventListener("notification-deleted", refresh);
      stream.close();
    };
  }, [notificationsStreamUrl]);

  const deleteNotification = async (id) => {
    setNotificationDeletingId(id);
    try {
      await api.delete(`/admin/notifications/${id}`);
      await loadNotifications();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete notification.");
    } finally {
      setNotificationDeletingId(null);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Admin Tools
          </p>
          <h2 className="mt-1 text-3xl font-black text-white">
            Published Notifications
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            This page stores and shows all published admin notifications.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadNotifications}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="mt-2 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-300">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-300">
            No notifications published yet.
          </div>
        ) : (
          notifications.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                    {item.message}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {item.linkUrl && (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-cyan-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
                      >
                        {item.linkLabel || "Open link"}
                      </a>
                    )}
                    {item.documentUrl && (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-700 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-800"
                      >
                        Open document
                      </a>
                    )}
                    {item.hasDocument && (
                      <a
                        href={`${notificationsBaseUrl}/notifications/${item.id}/document`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-emerald-500/40 px-3 py-1.5 font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                      >
                        {item.documentName || "Open attached file"}
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteNotification(item.id)}
                    disabled={notificationDeletingId === item.id}
                    className="mt-2 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {notificationDeletingId === item.id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

export default AddNotifications;
