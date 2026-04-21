import { useMemo } from "react";
import { jsPDF } from "jspdf";

const guideSections = [
  {
    title: "Respect the university community",
    items: [
      "Be polite to lecturers, staff, and classmates.",
      "Use official channels for requests and complaints.",
      "Follow classroom, lab, and event instructions.",
    ],
  },
  {
    title: "Study habits",
    items: [
      "Attend classes on time and keep your timetable updated.",
      "Keep your student ID and login credentials private.",
      "Submit assignments through approved systems only.",
    ],
  },
  {
    title: "Safety and facilities",
    items: [
      "Keep classrooms, labs, and common spaces clean.",
      "Report maintenance or security issues early.",
      "Use university assets and equipment responsibly.",
    ],
  },
  {
    title: "Daily essentials",
    items: [
      "Carry your ID card, charger, and notebook.",
      "Check announcements and notifications regularly.",
      "Contact the relevant office when you need help.",
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

function Users({ user, onBack }) {
  const initials = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const profileItems = useMemo(
    () => [
      { label: "Name", value: user?.name || "Not available" },
      { label: "Email", value: user?.email || "Not available" },
      { label: "Role", value: user?.role || "STUDENT" },
      { label: "Department", value: user?.department || "Not available" },
      { label: "Mobile number", value: user?.mobileNumber || "Not available" },
      { label: "Address", value: user?.address || "Not available" },
      { label: "Bio", value: user?.bio || "Not available" },
      { label: "Last login", value: formatDateTime(user?.lastLoginAt) },
      { label: "Joined", value: formatDateTime(user?.createdAt) },
    ],
    [user],
  );

  const buildGuidePdf = () => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 18;

    doc.setFillColor(7, 89, 133);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("UniOps Student Guide", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      "How to behave at university and what every student should remember.",
      margin,
      y + 8,
      { maxWidth: 180 },
    );

    y = 52;
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
    doc.roundedRect(margin, y + 1, 182, 18, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Remember", margin + 3, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Keep your profile current, stay respectful, and contact the university office when you need support.",
      margin + 3,
      y + 12,
      { maxWidth: 174 },
    );

    return doc;
  };

  const viewGuidePdf = () => {
    const doc = buildGuidePdf();
    window.open(doc.output("bloburl"), "_blank", "noopener,noreferrer");
  };

  const downloadGuidePdf = () => {
    const doc = buildGuidePdf();
    doc.save("uniops-student-guide.pdf");
  };

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.02),_rgba(2,6,23,0.2))]" />

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-[0_20px_80px_rgba(2,132,199,0.14)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Student Guide
            </p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              How to behave at university.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              This page is read-only. You can review the guide, download it as a
              PDF, and check your own account details below, but nothing here is
              editable.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={viewGuidePdf}
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              View PDF
            </button>
            <button
              type="button"
              onClick={downloadGuidePdf}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Download PDF
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Guide</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Student behavior and expectations.
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
              Keep this page read-only. Profile changes should be done from the
              dedicated profile screen or through the proper office workflow.
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Your Details</h2>
                <p className="mt-1 text-sm text-slate-400">
                  This information is shown for reference only.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user?.name || "User"}
                  className="h-16 w-16 rounded-2xl border border-slate-700 object-cover"
                />
              ) : (
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-lg font-black text-slate-950">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-white">
                  {user?.name || "Unnamed user"}
                </h3>
                <p className="truncate text-sm text-slate-400">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {profileItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Users;
