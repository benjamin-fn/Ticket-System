import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { useMyTickets } from "@/shared/api/useMyTickets";
import { useState } from "react";
import type { Ticket } from "@/shared/api/tickets";

// ----------------------
// STATUS MAPPING
// ----------------------
function mapStatus(s: string): "Open" | "InProgress" | "Closed" {
  switch (s) {
    case "Inkommet":
      return "Open";
    case "Paagende":
      return "InProgress";
    case "Klart":
      return "Closed";
    default:
      return "Open";
  }
}

// ----------------------
// PRIORITY MAPPING
// ----------------------
function mapPriority(p: string): "Low" | "Medium" | "High" {
  switch (p) {
    case "Low":
    case "Medium":
    case "High":
      return p;
    default:
      return "Low";
  }
}

// ----------------------
// BADGES
// ----------------------
function PriorityBadge({ level }: { level: Ticket["priority"] }) {
  const map = {
    Low: "bg-green-100 text-green-700 border border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    High: "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    <span className={"text-[10px] font-medium px-2 py-1 rounded-md " + map[level]}>
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    Open: "bg-blue-100 text-blue-700 border border-blue-200",
    InProgress: "bg-amber-100 text-amber-700 border border-amber-200",
    Closed: "bg-green-100 text-green-700 border border-green-200",
  };
  return (
    <span className={"text-[10px] font-medium px-2 py-1 rounded-md " + map[status]}>
      {status === "InProgress" ? "In Progress" : status}
    </span>
  );
}

// ----------------------
// MAIN PAGE
// ----------------------
export default function TicketsPage() {
  const navigate = useNavigate();
  const { data: tickets = [], isLoading } = useMyTickets();

  const [search, setSearch] = useState("");

  const filtered = tickets.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Tickets</div>
            <h2 className="text-xl font-semibold text-gray-900">All Tickets</h2>
          </div>

          <button
            onClick={() => navigate("/tickets/new")}
            className="rounded-md bg-black text-white text-sm px-3 py-1.5 hover:bg-gray-800"
          >
            + New Ticket
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex justify-between items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black w-60"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">Your Tickets</div>
            <div className="text-xs text-gray-500">{filtered.length} results</div>
          </div>

          {isLoading ? (
            <div className="p-4 text-sm text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No tickets found.</div>
          ) : (
            <ul>
              {filtered.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 border-t border-gray-100 hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      #{String(t.id).slice(0, 4)} — {t.title}
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <StatusBadge status={mapStatus(t.status)} />
                      <PriorityBadge level={mapPriority(t.priority)} />

                      <span className="text-gray-400">
                        Last updated:{" "}
                        {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="text-indigo-600 hover:underline text-xs font-medium"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
