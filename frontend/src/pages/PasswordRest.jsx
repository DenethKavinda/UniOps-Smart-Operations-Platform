import { useState } from "react";
import api from "../api/axiosConfig";

function PasswordRest({ onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setModal({
        open: true,
        type: "error",
        title: "Invalid Password",
        message: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setModal({
        open: true,
        type: "error",
        title: "Password Mismatch",
        message: "New password and confirm password must match.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/password-reset", {
        name,
        email,
        newPassword,
      });
      const payload = response.data;

      setModal({
        open: true,
        type: "success",
        title: "Password Reset Successful",
        message:
          payload?.message ||
          "Your password has been reset. Click OK to continue to login.",
      });
    } catch (err) {
      setModal({
        open: true,
        type: "error",
        title: "Password Reset Failed",
        message:
          err.response?.data?.message ||
          "Unable to reset password. Check user name and email.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    const success = modal.type === "success";
    setModal((prev) => ({ ...prev, open: false }));

    if (success) {
      onBackToLogin();
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h2 className="text-2xl font-black text-white">Password Reset</h2>
        <p className="mt-2 text-sm text-slate-300">
          Reset password by entering your user name and valid email.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              User Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
              placeholder="Enter your user name"
              required
            />
          </div>

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
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
              placeholder="Re-enter new password"
              minLength={6}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Back to Login
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
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

export default PasswordRest;
