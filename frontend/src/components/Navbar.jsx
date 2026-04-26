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

  // --- Style Helpers ---
  const baseButton = "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-all";
  const ghostButton = `${baseButton} text-slate-400 hover:bg-slate-800 hover:text-white`;
  const outlinedButton = `${baseButton} border border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800`;
  const primaryButton = `${baseButton} bg-cyan-500 text-slate-950 hover:bg-cyan-400`;
  const dangerButton = `${baseButton} bg-rose-500 text-white hover:bg-rose-400`;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Section */}
        <div className="shrink-0 leading-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
            Smart Ops
          </p>
          <h1 className="text-lg font-black tracking-tight text-white">UniOps</h1>
        </div>

        {/* Navigation Section */}
        <nav className="flex items-center gap-2">
          {/* Main App Links */}
          <div className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => onNavigate(isAuthenticated ? (isAdmin ? "admin" : "home") : "login")}
              className={ghostButton}
            >
              {isAdmin ? "Admin Dashboard" : "Dashboard"}
            </button>

            {isAuthenticated && (
              <>
                <button onClick={() => onNavigate("resources")} className={ghostButton}>Resources</button>
                <button onClick={() => onNavigate("incidents")} className={ghostButton}>Incidents</button>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="mx-2 hidden h-6 w-px bg-slate-800 md:block" />

          {/* User & Auth Controls */}
          <div className="flex items-center gap-2">
            {typeof onToggleTheme === "function" && (
              <button
                onClick={onToggleTheme}
                className={`${outlinedButton} hidden sm:flex`}
                title="Toggle Theme"
              >
                {isLightTheme ? "Dark" : "Light"}
              </button>
            )}

            {!isAuthenticated ? (
              <>
                <button onClick={() => onNavigate("register")} className={ghostButton}>Register</button>
                <button onClick={() => onNavigate("login")} className={primaryButton}>Sign In</button>
              </>
            ) : (
              <>
                {/* Profile Badge */}
                <button
                  onClick={() => onNavigate("profile")}
                  className={`${outlinedButton} gap-2 px-2`}
                  title="Open profile"
                >
                  {currentUser?.profileImageUrl ? (
                    <img
                      src={currentUser.profileImageUrl}
                      alt={currentUser?.name}
                      className="h-6 w-6 rounded-full border border-slate-600 object-cover"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950">
                      {initial}
                    </span>
                  )}
                  <span className="hidden sm:inline">Profile</span>
                </button>

                <button onClick={onLogout} className={dangerButton}>Logout</button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;