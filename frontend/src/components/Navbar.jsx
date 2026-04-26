function Navbar({
  isAuthenticated,
  currentUser,
  onNavigate,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const isAdmin = currentUser?.role === "ADMIN";
  const initial = currentUser?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const isLightTheme = theme === "light";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Smart Ops
          </p>
          <h1 className="text-lg font-black tracking-tight text-slate-100">UniOps</h1>
        </div>

        <nav className="flex items-center gap-2 text-sm sm:gap-4 sm:text-base">
          {typeof onToggleTheme === "function" && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-md border border-slate-700 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-800"
              title={isLightTheme ? "Switch to dark mode" : "Switch to light mode"}
              aria-label={
                isLightTheme ? "Switch to dark mode" : "Switch to light mode"
              }
            >
              {isLightTheme ? "Dark mode" : "Light mode"}
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onNavigate(
                isAuthenticated ? (isAdmin ? "admin" : "home") : "login",
              )
            }
            className="rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            {isAdmin ? "Admin Dashboard" : "Dashboard"}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate("profile")}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-2 py-1.5 text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-800"
              title="Open profile"
            >
              {currentUser?.profileImageUrl ? (
                <img
                  src={currentUser.profileImageUrl}
                  alt={currentUser?.name || "User"}
                  className="h-7 w-7 rounded-full border border-slate-600 object-cover"
                />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 font-bold text-slate-950">
                  {initial}
                </span>
              )}
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate("resources")}
              className="rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Resources
            </button>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate("incidents")}
              className="rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Incident Tickets
            </button>
          )}

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate("register")}
              className="rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Register
            </button>
          )}

          {isAuthenticated && (
            <span
              className="hidden rounded-md bg-slate-800 px-3 py-1.5 text-slate-200 sm:inline"
              title={currentUser?.email}
            >
              {currentUser?.name} · {currentUser?.role}
            </span>
          )}

          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="rounded-md bg-cyan-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Sign In
            </button>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md bg-rose-500 px-3 py-1.5 font-semibold text-white transition hover:bg-rose-400"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
