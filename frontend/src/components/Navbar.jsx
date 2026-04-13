function Navbar({ isAuthenticated, currentUser, onNavigate, onLogout }) {
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Smart Ops
          </p>
          <h1 className="text-lg font-black tracking-tight text-slate-100">
            UniOps
          </h1>
        </div>

        <nav className="flex items-center gap-2 text-sm sm:gap-4 sm:text-base">
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
              onClick={() => onNavigate(isAdmin ? "admin" : "home")}
              className="rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {isAdmin ? "Users" : "Modules"}
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
