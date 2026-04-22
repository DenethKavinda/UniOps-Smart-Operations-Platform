import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{7,20}$/;

const emptyForm = {
  resourceId: "",
  resourceName: "",
  location: "",
  category: "",
  description: "",
  priority: "MEDIUM",
  preferredContactName: "",
  preferredContactEmail: "",
  preferredContactPhone: "",
};

function IncidentTickets({ user, onBack }) {
  const isAdmin = user?.role === "ADMIN";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assets, setAssets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createImages, setCreateImages] = useState([]);
  const [createErrors, setCreateErrors] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentMessage, setEditingCommentMessage] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [assignForm, setAssignForm] = useState({ assigneeName: "", assigneeEmail: "" });
  const [assignErrors, setAssignErrors] = useState({});
  const [statusForm, setStatusForm] = useState({
    status: "OPEN",
    resolutionNotes: "",
    rejectionReason: "",
  });
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [statusErrors, setStatusErrors] = useState({});

  const selectedTicket = useMemo(
    () => tickets.find((item) => item.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

  const loadTickets = async (preferredTicketId) => {
    setLoading(true);
    setError("");
    try {
      const params = isAdmin ? {} : { createdByEmail: user?.email };
      const response = await api.get("/incidents", { params });
      if (!response.data?.success) {
        setError(response.data?.message || "Unable to load incident tickets.");
        return;
      }

      const items = response.data.data || [];
      setTickets(items);
      const nextSelectedId =
        preferredTicketId ||
        (selectedTicketId && items.some((item) => item.id === selectedTicketId)
          ? selectedTicketId
          : items[0]?.id || null);
      setSelectedTicketId(nextSelectedId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load incident tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [isAdmin, user?.email]);

  useEffect(() => {
    if (isAdmin) {
      setAssets([]);
      return;
    }
    const loadAssets = async () => {
      try {
        const response = await api.get("/assets");
        if (response.data?.success) {
          setAssets(response.data.data || []);
        }
      } catch {
        setAssets([]);
      }
    };
    loadAssets();
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedTicket) {
      setAssignForm({ assigneeName: "", assigneeEmail: "" });
      setStatusForm({ status: "OPEN", resolutionNotes: "", rejectionReason: "" });
      setAssignErrors({});
      setStatusErrors({});
      setCommentError("");
      setAttachmentError("");
      return;
    }

    setAssignForm({
      assigneeName: selectedTicket.assignedToName || "",
      assigneeEmail: selectedTicket.assignedToEmail || "",
    });
    setStatusForm({
      status: selectedTicket.status || "OPEN",
      resolutionNotes: selectedTicket.resolutionNotes || "",
      rejectionReason: selectedTicket.rejectionReason || "",
    });
    setAssignErrors({});
    setStatusErrors({});
    setCommentError("");
    setAttachmentError("");
  }, [selectedTicket?.id]);

  const createTicket = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const nextErrors = {};
    if (!createForm.resourceName.trim() || createForm.resourceName.trim().length < 3) {
      nextErrors.resourceName = "Resource name must be at least 3 characters.";
    }
    if (!createForm.location.trim() || createForm.location.trim().length < 3) {
      nextErrors.location = "Location must be at least 3 characters.";
    }
    if (!createForm.category.trim() || createForm.category.trim().length < 3) {
      nextErrors.category = "Category must be at least 3 characters.";
    }
    if (!createForm.description.trim() || createForm.description.trim().length < 10) {
      nextErrors.description = "Description must be at least 10 characters.";
    }
    if (
      createForm.preferredContactEmail &&
      !EMAIL_REGEX.test(createForm.preferredContactEmail.trim())
    ) {
      nextErrors.preferredContactEmail = "Enter a valid email (e.g., name@example.com).";
    }
    if (
      createForm.preferredContactPhone &&
      !PHONE_REGEX.test(createForm.preferredContactPhone.trim())
    ) {
      nextErrors.preferredContactPhone = "Use a valid phone number (digits, +, - allowed).";
    }
    if (createImages.length > 3) {
      nextErrors.images = "You can upload up to 3 images only.";
    }
    if (createImages.some((file) => file.size > MAX_IMAGE_SIZE_BYTES)) {
      nextErrors.images = "Each image must be less than 5 MB.";
    }
    if (createImages.some((file) => !file.type?.startsWith("image/"))) {
      nextErrors.images = "Only image files are allowed.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setCreateErrors(nextErrors);
      return;
    }

    setCreateErrors({});
    setCreating(true);

    try {
      const formData = new FormData();
      const selectedAsset = assets.find(
        (item) => String(item.id) === String(createForm.resourceId),
      );
      if (createForm.resourceId) {
        formData.append("resourceId", createForm.resourceId);
      }
      formData.append(
        "resourceName",
        selectedAsset?.name || createForm.resourceName,
      );
      formData.append("location", createForm.location);
      formData.append("category", createForm.category);
      formData.append("description", createForm.description);
      formData.append("priority", createForm.priority);
      formData.append("createdByName", user?.name || "Unknown User");
      formData.append("createdByEmail", user?.email || "");

      if (createForm.preferredContactName) {
        formData.append("preferredContactName", createForm.preferredContactName);
      }
      if (createForm.preferredContactEmail) {
        formData.append("preferredContactEmail", createForm.preferredContactEmail);
      }
      if (createForm.preferredContactPhone) {
        formData.append("preferredContactPhone", createForm.preferredContactPhone);
      }
      createImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await api.post("/incidents", formData);
      if (!response.data?.success) {
        setError(response.data?.message || "Unable to create incident ticket.");
        return;
      }

      const created = response.data.data;
      setSuccess("Incident ticket created successfully.");
      setCreateForm(emptyForm);
      setCreateImages([]);
      await loadTickets(created?.id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create incident ticket.");
    } finally {
      setCreating(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    setCommentError("");
    if (!selectedTicket) {
      return;
    }
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }
    if (commentText.trim().length < 2) {
      setCommentError("Comment should be at least 2 characters.");
      return;
    }

    setCommentSaving(true);
    setError("");
    try {
      const response = await api.post(`/incidents/${selectedTicket.id}/comments`, {
        authorName: user?.name || "Unknown User",
        authorEmail: user?.email || "",
        message: commentText.trim(),
      });
      if (!response.data?.success) {
        setError(response.data?.message || "Unable to add comment.");
        return;
      }
      setTickets((prev) =>
        prev.map((item) => (item.id === selectedTicket.id ? response.data.data : item)),
      );
      setCommentText("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add comment.");
    } finally {
      setCommentSaving(false);
    }
  };

  const saveEditedComment = async (commentId) => {
    if (!selectedTicket) {
      return;
    }
    if (!editingCommentMessage.trim() || editingCommentMessage.trim().length < 2) {
      setError("Edited comment should be at least 2 characters.");
      return;
    }
    setActionSaving(true);
    setError("");
    try {
      const response = await api.put(
        `/incidents/${selectedTicket.id}/comments/${commentId}`,
        {
          requesterEmail: user?.email || "",
          message: editingCommentMessage.trim(),
        },
      );
      if (!response.data?.success) {
        setError(response.data?.message || "Unable to update comment.");
        return;
      }
      setTickets((prev) =>
        prev.map((item) => (item.id === selectedTicket.id ? response.data.data : item)),
      );
      setEditingCommentId(null);
      setEditingCommentMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update comment.");
    } finally {
      setActionSaving(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!selectedTicket) {
      return;
    }
    setActionSaving(true);
    setError("");
    try {
      await api.delete(`/incidents/${selectedTicket.id}/comments/${commentId}`, {
        params: { requesterEmail: user?.email || "" },
      });
      await loadTickets(selectedTicket.id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete comment.");
    } finally {
      setActionSaving(false);
    }
  };

  const assignTicket = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !isAdmin) {
      return;
    }
    const nextErrors = {};
    if (!assignForm.assigneeName.trim() || assignForm.assigneeName.trim().length < 3) {
      nextErrors.assigneeName = "Assignee name must be at least 3 characters.";
    }
    if (!assignForm.assigneeEmail.trim() || !EMAIL_REGEX.test(assignForm.assigneeEmail.trim())) {
      nextErrors.assigneeEmail = "Enter a valid assignee email.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setAssignErrors(nextErrors);
      return;
    }
    setAssignErrors({});
    setActionSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.put(`/incidents/${selectedTicket.id}/assign`, {
        requesterEmail: user?.email || "",
        assigneeName: assignForm.assigneeName,
        assigneeEmail: assignForm.assigneeEmail,
      });
      if (!response.data?.success) {
        setError(response.data?.message || "Unable to assign ticket.");
        return;
      }
      setTickets((prev) =>
        prev.map((item) => (item.id === selectedTicket.id ? response.data.data : item)),
      );
      setSuccess("Technician/staff assignment updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign ticket.");
    } finally {
      setActionSaving(false);
    }
  };

  const updateStatus = async (event) => {
    event.preventDefault();
    if (!selectedTicket) {
      return;
    }
    const nextErrors = {};
    if (
      (statusForm.status === "RESOLVED" || statusForm.status === "CLOSED") &&
      statusForm.resolutionNotes.trim().length < 5
    ) {
      nextErrors.resolutionNotes = "Resolution notes must be at least 5 characters.";
    }
    if (statusForm.status === "REJECTED" && statusForm.rejectionReason.trim().length < 5) {
      nextErrors.rejectionReason = "Rejection reason must be at least 5 characters.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setStatusErrors(nextErrors);
      return;
    }
    setStatusErrors({});
    setActionSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        requesterEmail: user?.email || "",
        status: statusForm.status,
        resolutionNotes: statusForm.resolutionNotes,
        rejectionReason: statusForm.rejectionReason,
      };
      const response = await api.put(`/incidents/${selectedTicket.id}/status`, payload);
      if (!response.data?.success) {
        setError(response.data?.message || "Unable to update ticket status.");
        return;
      }
      setTickets((prev) =>
        prev.map((item) => (item.id === selectedTicket.id ? response.data.data : item)),
      );
      setSuccess("Ticket status updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update ticket status.");
    } finally {
      setActionSaving(false);
    }
  };

  const addAttachments = async (event) => {
    event.preventDefault();
    setAttachmentError("");
    if (!selectedTicket || attachmentFiles.length === 0) {
      return;
    }
    if (attachmentFiles.length > 3) {
      setAttachmentError("Upload up to 3 images at a time.");
      return;
    }
    if (attachmentFiles.some((file) => !file.type?.startsWith("image/"))) {
      setAttachmentError("Only image files are allowed.");
      return;
    }
    if (attachmentFiles.some((file) => file.size > MAX_IMAGE_SIZE_BYTES)) {
      setAttachmentError("Each image must be less than 5 MB.");
      return;
    }
    setActionSaving(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("uploadedByEmail", user?.email || "");
      attachmentFiles.forEach((file) => formData.append("images", file));
      const response = await api.post(
        `/incidents/${selectedTicket.id}/attachments`,
        formData,
      );
      if (!response.data?.success) {
        setError(response.data?.message || "Unable to add attachments.");
        return;
      }
      setTickets((prev) =>
        prev.map((item) => (item.id === selectedTicket.id ? response.data.data : item)),
      );
      setAttachmentFiles([]);
      setSuccess("Attachments uploaded successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add attachments.");
    } finally {
      setActionSaving(false);
    }
  };

  const canEditComment = (comment) =>
    isAdmin || comment?.authorEmail?.toLowerCase() === user?.email?.toLowerCase();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
            Module C
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Maintenance & Incident Ticketing
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {isAdmin
              ? "Admin view: assign technicians/staff, update workflow, and handle comments."
              : "User view: create incident tickets, upload evidence images, and track progress."}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/60 hover:bg-slate-800"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr,1fr]">
        <section className="space-y-6">
          {!isAdmin && (
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-xl font-bold text-white">Create Ticket</h2>
              <p className="mt-1 text-sm text-slate-300">
                Include category, priority, and up to 3 image attachments.
              </p>

              <form onSubmit={createTicket} className="mt-4 grid gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-200">
                    Linked Resource (optional)
                  </label>
                  <select
                    value={createForm.resourceId}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        resourceId: event.target.value,
                        resourceName:
                          assets.find(
                            (item) => String(item.id) === event.target.value,
                          )?.name || prev.resourceName,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  >
                    <option value="">Select a resource from catalogue</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.status})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-400">
                    Example: Select `Lab Tablets (IN_USE)` if issue belongs to that asset.
                  </p>
                </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Resource"
                  value={createForm.resourceName}
                  onChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, resourceName: value }))
                  }
                  placeholder="Example: Smart Board - Room 305"
                  helperText="Enter the exact resource/equipment name."
                  error={createErrors.resourceName}
                  maxLength={120}
                  required
                />
                <Field
                  label="Location"
                  value={createForm.location}
                  onChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, location: value }))
                  }
                  placeholder="Example: Engineering Block, Floor 3"
                  helperText="Mention building and room/area."
                  error={createErrors.location}
                  maxLength={160}
                  required
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Category"
                  value={createForm.category}
                  onChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, category: value }))
                  }
                  placeholder="Example: ELECTRICAL / NETWORK / FURNITURE"
                  helperText="Short category helps technicians route quickly."
                  error={createErrors.category}
                  maxLength={80}
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-200">
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, priority: event.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Example: Projector in Hall A flickers every 2 minutes and shuts down during lectures."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  maxLength={2000}
                  required
                />
                <p className="mt-1 text-xs text-slate-400">
                  Add clear symptoms, when it happens, and impact.
                </p>
                {createErrors.description && (
                  <p className="mt-1 text-xs text-rose-300">{createErrors.description}</p>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Field
                  label="Preferred Contact Name"
                  value={createForm.preferredContactName}
                  onChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, preferredContactName: value }))
                  }
                  placeholder="Example: Yomal Radinsha"
                  helperText="Who should technician contact?"
                  maxLength={120}
                />
                <Field
                  label="Preferred Contact Email"
                  type="email"
                  value={createForm.preferredContactEmail}
                  onChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, preferredContactEmail: value }))
                  }
                  placeholder="Example: yomal@example.com"
                  helperText="Use an active email for updates."
                  error={createErrors.preferredContactEmail}
                  maxLength={160}
                />
                <Field
                  label="Preferred Contact Phone"
                  value={createForm.preferredContactPhone}
                  onChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, preferredContactPhone: value }))
                  }
                  placeholder="Example: 0712345678"
                  helperText="Digits, + and - allowed."
                  error={createErrors.preferredContactPhone}
                  maxLength={20}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">
                  Evidence Images (max 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []).slice(0, 3);
                    setCreateImages(files);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-slate-950"
                />
                {createImages.length > 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    Selected: {createImages.map((file) => file.name).join(", ")}
                  </p>
                )}
                {createErrors.images && (
                  <p className="mt-1 text-xs text-rose-300">{createErrors.images}</p>
                )}
              </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="justify-self-start rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? "Creating..." : "Create Ticket"}
                </button>
              </form>
            </article>
          )}

          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isAdmin ? "Incident Queue" : "My Tickets"}
              </h2>
              <button
                type="button"
                onClick={() => loadTickets(selectedTicketId)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-300">Loading incident tickets...</p>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-slate-300">No incident tickets available.</p>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedTicketId === ticket.id
                        ? "border-cyan-400/70 bg-cyan-500/10"
                        : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">
                        #{ticket.id} - {ticket.resourceName}
                      </p>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{ticket.location}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>Priority: {ticket.priority}</span>
                      <span>•</span>
                      <span>{ticket.comments?.length || 0} comments</span>
                      <span>•</span>
                      <span>{ticket.attachments?.length || 0} attachments</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </article>
        </section>

        <section>
          {!selectedTicket ? (
            <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-sm text-slate-300">
              Select a ticket to view details.
            </article>
          ) : (
            <article className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-white">
                  #{selectedTicket.id} {selectedTicket.category}
                </h2>
                <StatusBadge status={selectedTicket.status} />
              </div>

              <DetailRow label="Resource" value={selectedTicket.resourceName} />
              <DetailRow
                label="Linked Resource ID"
                value={
                  selectedTicket.resourceId != null
                    ? String(selectedTicket.resourceId)
                    : "Not linked"
                }
              />
              <DetailRow label="Location" value={selectedTicket.location} />
              <DetailRow label="Priority" value={selectedTicket.priority} />
              <DetailRow label="Reported By" value={selectedTicket.createdByName} />
              <p className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
                {selectedTicket.description}
              </p>

              <section>
                <h3 className="text-lg font-semibold text-white">Attachments</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(selectedTicket.attachments || []).map((attachment) => (
                    <a
                      key={attachment.id}
                      href={`${api.defaults.baseURL || "http://localhost:8081/api"}/incidents/${selectedTicket.id}/attachments/${attachment.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 transition hover:border-cyan-400/60"
                    >
                      <img
                        src={`${api.defaults.baseURL || "http://localhost:8081/api"}/incidents/${selectedTicket.id}/attachments/${attachment.id}`}
                        alt={attachment.fileName}
                        className="h-36 w-full object-cover"
                      />
                      <p className="truncate px-3 py-2 text-xs text-slate-300">
                        {attachment.fileName}
                      </p>
                    </a>
                  ))}
                  {(selectedTicket.attachments || []).length === 0 && (
                    <p className="text-sm text-slate-300">No attachments yet.</p>
                  )}
                </div>

                {isAdmin && (
                  <form onSubmit={addAttachments} className="mt-3 grid gap-2">
                    <label className="text-sm font-semibold text-slate-200">
                      Add more images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) =>
                        setAttachmentFiles(Array.from(event.target.files || []))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-slate-950"
                    />
                    <button
                      type="submit"
                      disabled={actionSaving || attachmentFiles.length === 0}
                      className="justify-self-start rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Upload Attachments
                    </button>
                    {attachmentError && (
                      <p className="text-xs text-rose-300">{attachmentError}</p>
                    )}
                  </form>
                )}
              </section>

              {isAdmin && (
                <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
                  <h3 className="text-lg font-semibold text-white">Admin Actions</h3>

                  <form onSubmit={assignTicket} className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="Assignee Name"
                      value={assignForm.assigneeName}
                      onChange={(value) =>
                        setAssignForm((prev) => ({ ...prev, assigneeName: value }))
                      }
                      placeholder="Example: Nimal Perera"
                      helperText="Technician or staff full name."
                      error={assignErrors.assigneeName}
                      required
                    />
                    <Field
                      label="Assignee Email"
                      type="email"
                      value={assignForm.assigneeEmail}
                      onChange={(value) =>
                        setAssignForm((prev) => ({ ...prev, assigneeEmail: value }))
                      }
                      placeholder="Example: tech1@uniops.edu"
                      helperText="Must be a valid email."
                      error={assignErrors.assigneeEmail}
                      required
                    />
                    <button
                      type="submit"
                      disabled={actionSaving}
                      className="md:col-span-2 justify-self-start rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Assign Technician / Staff
                    </button>
                  </form>
                </section>
              )}

              {isAdmin && (
                <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
                  <h3 className="text-lg font-semibold text-white">Update Workflow Status</h3>
                  <form onSubmit={updateStatus} className="grid gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-200">
                        Status
                      </label>
                      <select
                        value={statusForm.status}
                        onChange={(event) =>
                          setStatusForm((prev) => ({ ...prev, status: event.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-200">
                        Resolution Notes
                      </label>
                      <textarea
                        rows={3}
                        value={statusForm.resolutionNotes}
                        onChange={(event) =>
                          setStatusForm((prev) => ({
                            ...prev,
                            resolutionNotes: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                        placeholder="Example: Replaced HDMI cable and tested for 30 minutes."
                      />
                      {statusErrors.resolutionNotes && (
                        <p className="mt-1 text-xs text-rose-300">
                          {statusErrors.resolutionNotes}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-200">
                        Rejection Reason
                      </label>
                      <textarea
                        rows={2}
                        value={statusForm.rejectionReason}
                        onChange={(event) =>
                          setStatusForm((prev) => ({
                            ...prev,
                            rejectionReason: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                        placeholder="Example: Issue report lacks enough information and evidence."
                      />
                      {statusErrors.rejectionReason && (
                        <p className="mt-1 text-xs text-rose-300">
                          {statusErrors.rejectionReason}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={actionSaving}
                      className="justify-self-start rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save Status
                    </button>
                  </form>
                </section>
              )}

              <section>
                <h3 className="text-lg font-semibold text-white">Comments</h3>
                <form onSubmit={addComment} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    placeholder="Example: Please prioritize this before tomorrow's lecture."
                  />
                  <button
                    type="submit"
                    disabled={commentSaving}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Post
                  </button>
                </form>
                {commentError && (
                  <p className="mt-1 text-xs text-rose-300">{commentError}</p>
                )}

                <div className="mt-3 space-y-3">
                  {(selectedTicket.comments || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">
                          {comment.authorName}{" "}
                          <span className="text-xs text-slate-400">
                            ({comment.authorRole})
                          </span>
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatDate(comment.updatedAt || comment.createdAt)}
                        </span>
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={editingCommentMessage}
                            onChange={(event) =>
                              setEditingCommentMessage(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={actionSaving}
                              onClick={() => saveEditedComment(comment.id)}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentMessage("");
                              }}
                              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-200">{comment.message}</p>
                          {canEditComment(comment) && (
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditingCommentMessage(comment.message || "");
                                }}
                                className="rounded-lg border border-cyan-500/40 px-2 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/10"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={actionSaving}
                                onClick={() => deleteComment(comment.id)}
                                className="rounded-lg border border-rose-500/40 px-2 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:opacity-60"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {(selectedTicket.comments || []).length === 0 && (
                    <p className="text-sm text-slate-300">No comments yet.</p>
                  )}
                </div>
              </section>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder = "",
  helperText = "",
  error = "",
  maxLength,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-lg border bg-slate-950 px-3 py-2 text-slate-100 outline-none ${
          error ? "border-rose-500/70 focus:border-rose-400" : "border-slate-700 focus:border-cyan-400"
        }`}
      />
      {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value || "-"}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    OPEN: "bg-rose-500/20 text-rose-300",
    IN_PROGRESS: "bg-blue-500/20 text-blue-300",
    RESOLVED: "bg-emerald-500/20 text-emerald-300",
    CLOSED: "bg-slate-500/30 text-slate-200",
    REJECTED: "bg-amber-500/20 text-amber-300",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${classes[status] || "bg-slate-700 text-slate-200"}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
}

export default IncidentTickets;
