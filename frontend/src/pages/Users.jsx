import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import api from "../api/axiosConfig";

const guideSections = [
  {
    title: "Respect the campus community",
    items: [
      "Be polite to lecturers, staff, and classmates.",
      "Use official communication channels for requests and complaints.",
      "Follow university rules, room policies, and event instructions.",
    ],
  },
  {
    title: "Academic habits",
    items: [
      "Attend classes on time and keep your timetable updated.",
      "Keep your student ID and login credentials private.",
      "Submit work through approved systems only.",
    ],
  },
  {
    title: "Safety and facilities",
    items: [
      "Keep classrooms, labs, and common areas clean.",
      "Report maintenance or security issues early.",
      "Use university assets and equipment responsibly.",
    ],
  },
  {
    title: "Daily essentials",
    items: [
      "Carry your ID card, charger, and notebook.",
      "Check announcements and notifications regularly.",
      "Reach out to the relevant office when you need help.",
    ],
  },
];

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function roleLabel(role) {
  return role || "STUDENT";
}

function roleTone(role) {
  switch (role) {
    case "ADMIN":
      return "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200";
    default:
      return "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
  }
}

function initials(name) {
  return name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : "U";
}

function Users({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        if (!user?.id) {
          throw new Error("Logged-in user details are not available.");
        }

        const response = await api.get(`/users/${user.id}/profile`);
        const data = response.data?.success ? response.data.data : null;
        if (mounted && data) {
          setProfile({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            blocked: Boolean(user?.blocked),
            loginCount: user?.loginCount ?? 0,
            lastLoginAt: user?.lastLoginAt || null,
            createdAt: user?.createdAt || null,
            profileImageUrl: data.profileImageUrl || "",
            address: data.address || "",
            mobileNumber: data.mobileNumber || "",
            department: data.department || "",
            bio: data.bio || "",
          });
        } else if (mounted) {
          setError(response.data?.message || "Unable to load your profile.");
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load your profile.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Role", value: roleLabel(profile?.role) },
      { label: "Logins", value: profile?.loginCount ?? 0 },
      { label: "Status", value: profile?.blocked ? "Blocked" : "Active" },
    ],
    [profile],
  );

  const buildGuidePdf = () => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 18;

    doc.setFillColor(7, 89, 133);
    doc.rect(0, 0, 210, 42, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("UniOps University Guide", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      "How to behave at university and what every student should remember.",
      margin,
      y + 8,
      { maxWidth: 182 },
    );

    y = 54;
    doc.setTextColor(15, 23, 42);

    guideSections.forEach((section) => {
      doc.setFillColor(15, 118, 110);
      doc.roundedRect(margin, y - 3, 182, 9, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, margin + 3, y + 3.5);
      y += 12;

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");

      section.items.forEach((item) => {
        const lines = doc.splitTextToSize(`- ${item}`, 176);
        doc.text(lines, margin + 2, y);
        y += lines.length * 6 + 2;
      });

      y += 2;
    });

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y + 1, 182, 16, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Remember", margin + 3, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Keep your profile current, stay respectful, and ask the university office when you need support.",
      margin + 3,
      y + 12,
      { maxWidth: 174 },
    );

    return doc;
  };

  const viewGuidePdf = () => {
    const doc = buildGuidePdf();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  };

  const downloadGuidePdf = () => {
    const doc = buildGuidePdf();
    doc.save("uniops-university-guide.pdf");
  };

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.02),_rgba(2,6,23,0.2))]" />

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-[0_20px_80px_rgba(2,132,199,0.14)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              My Profile
            </p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              View your details in one read-only place.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              This screen is for browsing only. Your profile details cannot be
              edited here. Use the guide below for day-to-day university
              behavior and review your contact and profile information.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={viewGuidePdf}
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              View Guide PDF
            </button>
            <button
              type="button"
              onClick={downloadGuidePdf}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Download Guide PDF
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-black text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  University Guide
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  How to behave at university and the essentials every user
                  should remember.
                </p>
              </div>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                PDF ready
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {guideSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <h3 className="text-base font-semibold text-white">
                    {section.title}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Keep this page read-only. The directory is for reference only, so
              any profile changes should be handled through the proper account
              settings or office workflow.
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Profile Notes</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your profile data shown in a locked state.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                {user?.name ? (
                  <p>
                    Signed in as{" "}
                    <span className="font-semibold text-white">
                      {user.name}
                    </span>
                    .
                  </p>
                ) : null}
                <p className="mt-2">
                  Your profile picture, contact details, and account summary are
                  included below for quick review.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">What you cannot do</p>
                <ul className="mt-2 space-y-2">
                  <li>• No edits to your profile details.</li>
                  <li>• No role changes or account status changes.</li>
                  <li>• No password updates from this page.</li>
                </ul>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">My Details</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your role, contact data, profile image, and usage details.
              </p>
            </div>
            <p className="text-sm text-slate-400">1 record loaded</p>
          </div>

          {loading ? (
            <div className="py-8 text-slate-300">Loading your details...</div>
          ) : error ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : !profile ? (
            <div className="py-8 text-slate-300">No profile details found.</div>
          ) : (
            <article className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/65 p-5">
              <div className="flex items-start gap-4">
                {profile.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.name || "User"}
                    className="h-16 w-16 rounded-2xl border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-lg font-black text-slate-950">
                    {initials(profile.name)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-white">
                      {profile.name || "Unnamed user"}
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleTone(profile.role)}`}
                    >
                      {roleLabel(profile.role)}
                    </span>
                    {profile.blocked && (
                      <span className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {profile.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-slate-700 px-2.5 py-1">
                      Logins: {profile.loginCount ?? 0}
                    </span>
                    <span className="rounded-full border border-slate-700 px-2.5 py-1">
                      Last login: {formatDateTime(profile.lastLoginAt)}
                    </span>
                    <span className="rounded-full border border-slate-700 px-2.5 py-1">
                      Joined: {formatDateTime(profile.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Department" value={profile.department} />
                <Field label="Mobile number" value={profile.mobileNumber} />
                <Field label="Address" value={profile.address} fullWidth />
                <Field label="Bio" value={profile.bio} fullWidth />
              </div>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}

function Field({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
        {value && String(value).trim() ? value : "Not provided"}
      </p>
    </div>
  );
}

export default Users;
