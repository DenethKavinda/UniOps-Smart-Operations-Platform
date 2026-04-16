import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

function Notifications({ onBack, onViewed }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const streamUrl = useMemo(() => {
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
    try {
      const response = await api.get("/notifications");
      if (response.data?.success) {
        setNotifications(response.data.data || []);
        setError("");
      } else {
        setError(
          response.data?.message || "Unable to load notifications right now.",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    if (onViewed) {
      onViewed();
    }
  }, []);

  useEffect(() => {
    const stream = new EventSource(streamUrl);

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
  }, [streamUrl]);

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            User Notices
          </p>
          <h2 className="mt-1 text-3xl font-black text-white">Notifications</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-800"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
            No notifications yet.
          </div>
        ) : (
          notifications.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-slate-200">
                {item.message}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    {item.linkLabel || "Open submission link"}
                  </a>
                )}
                {item.documentUrl && (
                  <a
                    href={item.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-800"
                  >
                    Open document
                  </a>
                )}
                {item.hasDocument && (
                  <a
                    href={`${notificationsBaseUrl}/notifications/${item.id}/document`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-emerald-500/40 px-3 py-2 font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                  >
                    {item.documentName || "Open attached file"}
                  </a>
                )}
              </div>

              {item.createdBy && (
                <p className="mt-3 text-xs text-slate-400">
                  Posted by {item.createdBy}
                </p>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default Notifications;
