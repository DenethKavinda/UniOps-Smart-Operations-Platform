import { useState, useEffect } from "react";
import api from "../api/axiosConfig";

function Bookings({ user, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    resourceName: "",
    purpose: "",
    expectedAttendees: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
  });

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/bookings/my?email=${user.email}`);
      if (response.data?.success) {
        setBookings(response.data.data || []);
      } else {
        setError(response.data?.message || "Unable to load your bookings.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.resourceName.trim()) {
      setError("Resource name is required.");
      return;
    }
    if (!formData.purpose.trim()) {
      setError("Purpose is required.");
      return;
    }
    if (!formData.bookingDate) {
      setError("Booking date is required.");
      return;
    }
    if (!formData.startTime) {
      setError("Start time is required.");
      return;
    }
    if (!formData.endTime) {
      setError("End time is required.");
      return;
    }

    // Validate end time > start time
    if (formData.endTime <= formData.startTime) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/bookings", {
        resourceId: 1,
        resourceName: formData.resourceName,
        requestedBy: user.name,
        requestedByEmail: user.email,
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees
          ? parseInt(formData.expectedAttendees)
          : null,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });

      if (response.data?.success) {
        setSuccess("Booking created successfully!");
        setFormData({
          resourceName: "",
          purpose: "",
          expectedAttendees: "",
          bookingDate: "",
          startTime: "",
          endTime: "",
        });
        await loadBookings();
      } else {
        setError(response.data?.message || "Unable to create booking.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create booking.");
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  const handleCancel = async (bookingId) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, {
        status: "CANCELLED",
        adminNote: "Cancelled by student.",
      });
      if (response.data?.success) {
        setSuccess("Booking cancelled successfully.");
        await loadBookings();
      } else {
        setError(response.data?.message || "Unable to cancel booking.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_35%)]" />

      <section className="relative mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          ← Back
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-cyan-950/10">
          <h2 className="text-3xl font-bold text-white">My Bookings</h2>
          <p className="mt-2 text-sm text-slate-300">
            Create and manage your resource bookings
          </p>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {/* Create Booking Form */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
            <h3 className="text-xl font-bold text-white">New Booking</h3>
            <p className="mt-2 text-sm text-slate-300">
              Fill in the details to create a new booking
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-200">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    name="resourceName"
                    value={formData.resourceName}
                    onChange={handleFormChange}
                    placeholder="e.g., Auditorium A, Lab 2"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleFormChange}
                    min={today}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-200">
                    Purpose *
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleFormChange}
                    placeholder="Describe the purpose of this booking"
                    rows="3"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">
                    Expected Attendees (optional)
                  </label>
                  <input
                    type="number"
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleFormChange}
                    placeholder="Number of attendees"
                    min="1"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Booking"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      resourceName: "",
                      purpose: "",
                      expectedAttendees: "",
                      bookingDate: "",
                      startTime: "",
                      endTime: "",
                    })
                  }
                  disabled={loading}
                  className="rounded-lg border border-slate-600 px-6 py-2 font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Bookings List */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Your Bookings</h3>
              <button
                type="button"
                onClick={loadBookings}
                disabled={loading}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Refresh
              </button>
            </div>

            {loading && bookings.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
                <p className="text-slate-300">Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
                <p className="text-slate-300 font-semibold">No bookings yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Fill in the form above to create your first booking request.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your bookings will appear here after submission.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">
                          {booking.resourceName}
                        </h4>
                        <p className="mt-1 text-sm text-slate-400">
                          {booking.purpose}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
                          <div>
                            <span className="text-slate-400">Date: </span>
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-slate-400">Time: </span>
                            {booking.startTime} – {booking.endTime}
                          </div>
                          {booking.expectedAttendees && (
                            <div>
                              <span className="text-slate-400">Attendees: </span>
                              {booking.expectedAttendees}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            booking.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : booking.status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-300"
                                : booking.status === "CANCELLED"
                                  ? "bg-slate-500/20 text-slate-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {booking.status}
                        </span>
                        {booking.status === "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => handleCancel(booking.id)}
                            disabled={loading}
                            className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        )}
                        {booking.adminNote && (
                          <p className="text-right text-xs text-slate-400">
                            {booking.adminNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Bookings;
