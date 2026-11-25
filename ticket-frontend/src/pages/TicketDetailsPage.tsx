import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { ticketsApi } from "@/shared/api/tickets";
import type { Ticket } from "@/shared/api/tickets";

// FRONTEND STATUS
type FrontStatus = "Open" | "InProgress" | "Closed";

// BACKEND STATUS (svenska)
type ApiStatus = "Inkommet" | "Paagende" | "Klart";

// MAPPING API → FRONTEND
const toFrontendStatus: Record<ApiStatus, FrontStatus> = {
  Inkommet: "Open",
  Paagende: "InProgress",
  Klart: "Closed",
};

// MAPPING FRONTEND → API
const toApiStatus: Record<FrontStatus, ApiStatus> = {
  Open: "Inkommet",
  InProgress: "Paagende",
  Closed: "Klart",
};

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTicket() {
    try {
      const data = await ticketsApi.get(id!);

      setTicket({
        ...data,
        description: data.description ?? "",
        status: toFrontendStatus[data.status as ApiStatus],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  async function saveChanges() {
    if (!ticket) return;
    setSaving(true);

    try {
      const updated = await ticketsApi.edit(ticket.id, {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        isFlagged: ticket.isFlagged,
      });

      setTicket({
        ...updated,
        description: updated.description ?? "",
        status: toFrontendStatus[updated.status as ApiStatus],
      });

      alert("Ticket updated successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(newFrontStatus: FrontStatus) {
    if (!ticket) return;

    const apiStatus = toApiStatus[newFrontStatus];

    try {
      const updated = await ticketsApi.changeStatus(ticket.id, apiStatus);

      setTicket({
        ...updated,
        description: updated.description ?? "",
        status: toFrontendStatus[updated.status as ApiStatus],
      });

      alert(`Status updated to ${newFrontStatus}`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deleteTicket() {
    if (!ticket) return;
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await ticketsApi.remove(ticket.id);
      navigate("/tickets");
    } catch {
      alert("Failed to delete ticket");
    }
  }

  if (loading)
    return (
      <AppLayout>
        <p className="p-6">Loading…</p>
      </AppLayout>
    );

  if (error)
    return (
      <AppLayout>
        <p className="p-6 text-red-600">{error}</p>
      </AppLayout>
    );

  if (!ticket) return null;

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold mb-2">Edit Ticket</h2>

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={ticket.title}
            onChange={(e) =>
              setTicket({ ...ticket, title: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={ticket.description ?? ""}
            onChange={(e) =>
              setTicket({ ...ticket, description: e.target.value })
            }
            className="w-full border rounded-md p-2 text-sm"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select
            value={ticket.priority}
            onChange={(e) =>
              setTicket({
                ...ticket,
                priority: e.target.value as "Low" | "Medium" | "High",
              })
            }
            className="border rounded-md p-2 text-sm"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ticket.isFlagged}
            onChange={(e) =>
              setTicket({ ...ticket, isFlagged: e.target.checked })
            }
          />
          <label className="text-sm">Flagged</label>
        </div>

        <div>
          <p className="text-sm font-medium">Status: {ticket.status}</p>

          {ticket.status === "Open" && (
            <button
              onClick={() => updateStatus("InProgress")}
              className="bg-blue-600 text-white text-sm px-3 py-2 rounded-md"
            >
              Mark as In Progress
            </button>
          )}

          {ticket.status === "InProgress" && (
            <button
              onClick={() => updateStatus("Closed")}
              className="bg-green-600 text-white text-sm px-3 py-2 rounded-md"
            >
              Mark as Done
            </button>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="bg-black text-white text-sm px-4 py-2 rounded-md"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={deleteTicket}
            className="bg-red-600 text-white text-sm px-4 py-2 rounded-md"
          >
            Delete
          </button>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600"
          >
            ← Back
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
