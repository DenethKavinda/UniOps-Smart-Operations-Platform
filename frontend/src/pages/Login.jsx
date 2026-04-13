import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Login({
  onLoginSuccess,
  onSwitchToRegister,
  initialEmail = "",
  initialPassword = "",
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    setEmail(initialEmail);
    setPassword(initialPassword);
  }, [initialEmail, initialPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const payload = response.data;

      if (payload?.success) {
        setPendingUser(payload.data);
        setModal({
          open: true,
          type: "success",
          title: "Login Successful",
          message: payload.message || "Welcome back. Press OK to continue.",
        });
      } else {
        setModal({
          open: true,
          type: "error",
          title: "Login Failed",
          message:
            payload?.message || "Please check your credentials and try again.",
        });
      }
    } catch (err) {
      setModal({
        open: true,
        type: "error",
        title: "Login Failed",
        message:
          err.response?.data?.message || "Unable to login. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    const isSuccess = modal.type === "success";
    setModal((prev) => ({ ...prev, open: false }));

    if (isSuccess && pendingUser) {
      onLoginSuccess(pendingUser);
      setPendingUser(null);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <h2 className="text-2xl font-black text-white">Login</h2>
          <p className="mt-2 text-sm text-slate-300">
            Access your UniOps dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                placeholder="you@campus.edu"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-300">
            No account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              Create one
            </button>
          </p>
        </div>

        <aside className="w-full rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-6 shadow-xl">
          <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Login Instructions
          </p>
          <h3 className="mt-4 text-xl font-bold text-white">How to sign in</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>1. Enter your registered email address.</li>
            <li>2. Enter the same password you created during registration.</li>
            <li>3. Click Sign In to open your dashboard home page.</li>
            <li>4. If you are new, click Create one to register first.</li>
          </ul>
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
            Tip: After successful registration, your credentials are prefilled
            on this page.
          </div>
        </aside>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div
              className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                modal.type === "success"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {modal.type === "success" ? "Success" : "Error"}
            </div>
            <h4 className="text-xl font-bold text-white">{modal.title}</h4>
            <p className="mt-2 text-sm text-slate-300">{modal.message}</p>
            <button
              type="button"
              onClick={handleModalOk}
              className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;
