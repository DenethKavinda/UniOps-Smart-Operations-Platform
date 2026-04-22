import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Resources({ user }) {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    q: "",
    type: "",
    minCapacity: "",
    location: "",
    status: "",
  });

  const validateFilters = (nextFilters) => {
    const errors = {};

    const sanitized = {
      ...nextFilters,
      q: (nextFilters.q ?? "").trim().slice(0, 80),
      type: (nextFilters.type ?? "").trim().slice(0, 40),
      location: (nextFilters.location ?? "").trim().slice(0, 60),
      status: nextFilters.status ?? "",
      minCapacity: nextFilters.minCapacity ?? "",
    };

    if (sanitized.minCapacity !== "") {
      const asNumber = Number(sanitized.minCapacity);
      const isInteger = Number.isInteger(asNumber);
      if (!Number.isFinite(asNumber) || !isInteger || asNumber < 0) {
        errors.minCapacity = "Minimum capacity must be a non-negative whole number.";
      }
    }

    return { sanitized, errors, isValid: Object.keys(errors).length === 0 };
  };

  const loadAssets = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        q: nextFilters.q || undefined,
        type: nextFilters.type || undefined,
        minCapacity:
          nextFilters.minCapacity === "" ? undefined : nextFilters.minCapacity,
        location: nextFilters.location || undefined,
        status: nextFilters.status || undefined,
      };

      const response = await api.get("/assets", { params });
      if (response.data?.success) {
        const items = response.data.data || [];
        setAssets(items);
        if (selectedAsset) {
          const refreshed = items.find((a) => a.id === selectedAsset.id);
          setSelectedAsset(refreshed || null);
        }
      } else {
        setError(response.data?.message || "Unable to load resources.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadAssets({
        q: "",
        type: "",
        minCapacity: "",
        location: "",
        status: "",
      });
    };

    init();
    // Intentionally run once on mount.
  }, []);

  const formatWindow = (startAt, endAt) => {
    if (!startAt || !endAt) return "";
    return `${startAt.replace("T", " ")} → ${endAt.replace("T", " ")}`;
  };

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(14,116,144,0.25),_transparent_40%)]" />

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <p className="mb-3 inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Resources
        </p>
        <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
          Facilities & assets catalogue
        </h2>
        <p className="mt-3 text-cyan-300">Browse and book resources, {user?.name}.</p>
        <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Search campus resources, check status, and review availability windows.
        </p>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">Catalogue</h3>
              <p className="mt-1 text-sm text-slate-300">
                Browse bookable resources, check status, and review availability
                windows.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadAssets()}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Search and filter
            </h4>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <input
                value={filters.q}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, q: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                placeholder="Search by name"
              />
              <input
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                placeholder="Type"
              />
              <input
                type="number"
                min="0"
                value={filters.minCapacity}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    minCapacity: e.target.value,
                  }));
                  if (formErrors.minCapacity) {
                    setFormErrors((prev) => ({ ...prev, minCapacity: undefined }));
                  }
                }}
                className={`w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/60 transition focus:ring ${
                  formErrors.minCapacity
                    ? "border-rose-500/60"
                    : "border-slate-700"
                }`}
                placeholder="Min capacity"
              />
              <input
                value={filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                placeholder="Location"
              />
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
              >
                <option value="">Any status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>

            {formErrors.minCapacity && (
              <p className="mt-3 text-sm text-rose-200">
                {formErrors.minCapacity}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  const cleared = {
                    q: "",
                    type: "",
                    minCapacity: "",
                    location: "",
                    status: "",
                  };
                  setFilters(cleared);
                  setFormErrors({});
                  loadAssets(cleared);
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const { sanitized, errors, isValid } = validateFilters(filters);
                  setFilters((prev) => ({ ...prev, ...sanitized }));
                  setFormErrors(errors);
                  if (!isValid) return;
                  loadAssets(sanitized);
                }}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-slate-300"
                      >
                        Loading resources...
                      </td>
                    </tr>
                  ) : assets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-slate-300"
                      >
                        No resources found.
                      </td>
                    </tr>
                  ) : (
                    assets.map((asset) => (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`cursor-pointer border-t border-slate-800 text-sm text-slate-200 transition hover:bg-slate-900/60 ${
                          selectedAsset?.id === asset.id
                            ? "bg-slate-900/60"
                            : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">
                            {asset.name}
                          </p>
                          <p className="text-xs text-slate-400">ID: {asset.id}</p>
                        </td>
                        <td className="px-4 py-4">{asset.type}</td>
                        <td className="px-4 py-4">{asset.capacity}</td>
                        <td className="px-4 py-4">{asset.location}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                              asset.status === "ACTIVE"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                              asset.availableNow
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            {asset.availableNow ? "Available" : "Not now"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <aside className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Resource details
              </h4>
              {!selectedAsset ? (
                <p className="mt-3 text-sm text-slate-300">
                  Select a resource from the list to view details.
                </p>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {selectedAsset.name}
                    </p>
                    <p className="text-slate-400">ID: {selectedAsset.id}</p>
                  </div>
                  <DetailRow label="Type" value={selectedAsset.type} />
                  <DetailRow
                    label="Capacity"
                    value={String(selectedAsset.capacity)}
                  />
                  <DetailRow label="Location" value={selectedAsset.location} />
                  <DetailRow label="Status" value={selectedAsset.status} />
                  <DetailRow
                    label="Available now"
                    value={selectedAsset.availableNow ? "Yes" : "No"}
                  />

                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Availability windows
                    </p>
                    {(selectedAsset.availabilityWindows || []).length === 0 ? (
                      <p className="mt-2 text-sm text-slate-300">
                        No windows configured.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm text-slate-200">
                        {selectedAsset.availabilityWindows.map((w, idx) => (
                          <li
                            key={`${w.id || "w"}-${idx}`}
                            className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
                          >
                            {formatWindow(w.startAt, w.endAt)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

export default Resources;
