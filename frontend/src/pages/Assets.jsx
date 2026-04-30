import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

const SECTIONS = [
  {
    key: "lecture-halls",
    title: "Lecture Halls",
    description: "Large rooms for lectures, seminars, and presentations.",
    tone: "cyan",
    prefix: "LH",
    projectorAvailable: true,
    cameraAvailable: false,
  },
  {
    key: "meeting-rooms",
    title: "Meeting Rooms",
    description: "Spaces for team meetings, reviews, and student discussions.",
    tone: "emerald",
    prefix: "MR",
    projectorAvailable: true,
    cameraAvailable: true,
  },
  {
    key: "labs",
    title: "Labs",
    description:
      "Practical learning spaces for hands-on sessions and experiments.",
    tone: "amber",
    prefix: "LAB",
    projectorAvailable: true,
    cameraAvailable: true,
  },
];

function buildLocations(section) {
  return Array.from({ length: 10 }, (_, index) => {
    const locationNumber = index + 1;
    const available = (locationNumber + section.key.length) % 3 !== 0;
    const projectorAvailable =
      section.projectorAvailable && locationNumber % 2 === 1;
    const cameraAvailable = section.cameraAvailable && locationNumber % 2 === 0;

    return {
      name: `${section.title.slice(0, -1)} ${locationNumber}`,
      reference: `${section.prefix}-${String(locationNumber).padStart(2, "0")}`,
      availability: available ? "Available" : "Not available",
      status: available ? "AVAILABLE" : "UNAVAILABLE",
      projectorAvailable,
      cameraAvailable,
    };
  });
}

function Assets({ user, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverAssets, setServerAssets] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadAssets = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/assets");
        if (!mounted) {
          return;
        }

        if (response.data?.success) {
          setServerAssets(response.data.data || []);
        } else {
          setError(response.data?.message || "Unable to load assets.");
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || "Unable to load assets.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  const serverAssetCount = serverAssets.length;

  const sections = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        locations: buildLocations(section),
      })),
    [],
  );

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(180deg,_rgba(2,6,23,0.0),_rgba(2,6,23,0.22))]" />

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back
        </button>

        <div className="mt-4 rounded-[2rem] border border-slate-800/80 bg-slate-950/85 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Campus Assets
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Available lecture halls, meeting rooms, and labs
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                Browse the available spaces for teaching and collaboration. Each
                card shows whether the location is available, plus projector and
                camera support.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatChip
                label="Lecture halls"
                value="10 locations"
                tone="cyan"
              />
              <StatChip
                label="Meeting rooms"
                value="10 locations"
                tone="emerald"
              />
              <StatChip label="Labs" value="10 locations" tone="amber" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
            Signed in as {user?.name || "Guest"}. Server assets loaded:{" "}
            {serverAssetCount}.
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 space-y-8">
              {SECTIONS.map((section) => (
                <div key={section.key} className="space-y-4">
                  <div className="h-5 w-44 animate-pulse rounded-full bg-slate-800" />
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`${section.key}-skeleton-${index}`}
                        className="h-52 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {sections.map((section) => (
                <section key={section.key} className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {section.title}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-slate-400">
                        {section.description}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-300">
                      {
                        section.locations.filter(
                          (location) => location.availability === "Available",
                        ).length
                      }{" "}
                      available now
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {section.locations.map((location) => (
                      <article
                        key={location.reference}
                        className="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30 transition hover:-translate-y-1 hover:border-cyan-400/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                              {section.title}
                            </p>
                            <h3 className="mt-2 text-xl font-bold text-white">
                              {location.name}
                            </h3>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${location.availability === "Available" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}
                          >
                            {location.availability}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <AssetDetail
                            label="Reference"
                            value={location.reference}
                          />
                          <AssetDetail label="Status" value={location.status} />
                          <AssetDetail
                            label="Projector"
                            value={
                              location.projectorAvailable
                                ? "Available"
                                : "Not available"
                            }
                            valueTone={
                              location.projectorAvailable ? "emerald" : "rose"
                            }
                          />
                          <AssetDetail
                            label="Camera"
                            value={
                              location.cameraAvailable
                                ? "Available"
                                : "Not available"
                            }
                            valueTone={
                              location.cameraAvailable ? "emerald" : "rose"
                            }
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatChip({ label, value, tone }) {
  const toneClasses = {
    cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function AssetDetail({ label, value, valueTone = "slate" }) {
  const valueClasses =
    valueTone === "emerald"
      ? "text-emerald-300"
      : valueTone === "rose"
        ? "text-rose-300"
        : "text-slate-100";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${valueClasses}`}>{value}</p>
    </div>
  );
}

export default Assets;
