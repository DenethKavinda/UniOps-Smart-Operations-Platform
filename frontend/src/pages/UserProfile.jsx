import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

const profileFields = [
  "name",
  "email",
  "profileImageUrl",
  "address",
  "mobileNumber",
  "department",
  "bio",
];

function UserProfile({ user, onBack, onUserUpdated }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profileImageUrl: user?.profileImageUrl || "",
    address: user?.address || "",
    mobileNumber: user?.mobileNumber || "",
    department: user?.department || "",
    bio: user?.bio || "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      profileImageUrl: user?.profileImageUrl || "",
      address: user?.address || "",
      mobileNumber: user?.mobileNumber || "",
      department: user?.department || "",
      bio: user?.bio || "",
    });
  }, [user]);

  const completion = useMemo(() => {
    const completed = profileFields.reduce((count, key) => {
      const value = form[key];
      return value && String(value).trim() ? count + 1 : count;
    }, 0);

    return Math.round((completed * 100) / profileFields.length);
  }, [form]);

  const initial = form.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange("profileImageUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback("");

    try {
      const response = await api.put(`/users/${user.id}/profile`, {
        name: form.name,
        profileImageUrl: form.profileImageUrl,
        address: form.address,
        mobileNumber: form.mobileNumber,
        department: form.department,
        bio: form.bio,
      });

      const updatedProfile = response.data?.data;
      if (updatedProfile) {
        setForm({
          name: updatedProfile.name || "",
          email: updatedProfile.email || "",
          profileImageUrl: updatedProfile.profileImageUrl || "",
          address: updatedProfile.address || "",
          mobileNumber: updatedProfile.mobileNumber || "",
          department: updatedProfile.department || "",
          bio: updatedProfile.bio || "",
        });
        onUserUpdated(updatedProfile);
      }
      setFeedback(response.data?.message || "Profile updated successfully.");
    } catch (err) {
      setFeedback(
        err.response?.data?.message || "Unable to save profile changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordFeedback("New password and confirm password must match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.put(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordFeedback(response.data?.message || "Password changed.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordFeedback("");
      }, 900);
    } catch (err) {
      setPasswordFeedback(
        err.response?.data?.message || "Unable to change password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">User Profile</h2>
            <p className="mt-1 text-sm text-slate-300">
              Update your profile details and keep your account complete.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Back
          </button>
        </div>

        {loading ? (
          <p className="text-slate-300">Loading profile...</p>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 lg:col-span-1">
                <p className="text-sm font-semibold text-slate-200">
                  User Image
                </p>
                <div className="mt-4 flex items-center gap-4">
                  {form.profileImageUrl ? (
                    <img
                      src={form.profileImageUrl}
                      alt={form.name || "User"}
                      className="h-20 w-20 rounded-full border border-slate-600 object-cover"
                    />
                  ) : (
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500 text-2xl font-black text-slate-950">
                      {initial}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-300">
                      Upload image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-xs text-slate-200"
                    />
                  </div>
                </div>

                <label className="mt-4 block text-xs text-slate-300">
                  Or image URL
                </label>
                <input
                  type="url"
                  value={form.profileImageUrl}
                  onChange={(e) =>
                    handleChange("profileImageUrl", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                  placeholder="https://example.com/my-photo.jpg"
                />

                <div className="mt-6 rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                    Profile Completion
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {completion}%
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-cyan-400 transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Email (cannot be changed)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={form.mobileNumber}
                    onChange={(e) =>
                      handleChange("mobileNumber", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Department
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                    placeholder="Computing / Operations"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                    placeholder="Street, City, District"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Other Details / Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                    placeholder="Add any other details to complete your profile."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordModalOpen(true);
                  setPasswordFeedback("");
                }}
                className="rounded-lg border border-slate-600 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Change Password
              </button>
            </div>

            {feedback && (
              <p className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
                {feedback}
              </p>
            )}
          </form>
        )}
      </section>

      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Change Password</h3>
            <p className="mt-1 text-sm text-slate-300">
              Update your password in this same page.
            </p>

            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmNewPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
                  minLength={6}
                  required
                />
              </div>

              {passwordFeedback && (
                <p className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
                  {passwordFeedback}
                </p>
              )}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default UserProfile;
