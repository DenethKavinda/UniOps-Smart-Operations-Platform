const modules = [
  { title: "Users", desc: "Manage admin, staff, and student roles." },
  { title: "Bookings", desc: "Track room and facility reservations." },
  { title: "Maintenance", desc: "Create and resolve service requests." },
  { title: "Assets", desc: "Monitor equipment lifecycle and status." },
];

function Home({ user }) {
  return (
    <main id="dashboard" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(14,116,144,0.25),_transparent_40%)]" />

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <p className="mb-3 inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Campus Operations Platform
        </p>
        <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
          Command center for daily university operations.
        </h2>
        <p className="mt-3 text-cyan-300">Welcome back, {user?.name}.</p>
        <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          One dashboard for users, bookings, maintenance, and assets with faster
          visibility and cleaner workflows.
        </p>

        <div
          id="modules"
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6"
        >
          {modules.map((module) => (
            <article
              key={module.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.4)] transition duration-200 hover:-translate-y-1 hover:border-cyan-400/50"
            >
              <h3 className="text-xl font-bold text-slate-100">
                {module.title}
              </h3>
              <p className="mt-2 text-slate-300">{module.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
