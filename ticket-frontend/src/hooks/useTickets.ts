import { useEffect, useState } from "react";
import type { Ticket } from "@/types/Ticket";

function normalizePriority(p: string): "Low" | "Medium" | "High" {
  const map: Record<string, "Low" | "Medium" | "High"> = {
    low: "Low",
    låg: "Low",
    medium: "Medium",
    medel: "Medium",
    high: "High",
    hög: "High",
    urgent: "High",
  };
  return map[p?.toLowerCase?.()] ?? "Low";
}

function normalizeStatus(s: string | undefined): "Open" | "InProgress" | "Closed" {
  if (!s) return "Open";
  const key = s.toLowerCase();
  const map: Record<string, "Open" | "InProgress" | "Closed"> = {
    open: "Open",
    inkommet: "Open",

    "in progress": "InProgress",
    "inprogress": "InProgress",
    pågående: "InProgress",
    paagende: "InProgress",

    closed: "Closed",
    klar: "Closed",
    avslutad: "Closed",
  };
  return map[key] ?? "Open";
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:5167/api/tickets");
        if (!res.ok) throw new Error("Failed to load tickets");
        const data = await res.json();

        const normalized: Ticket[] = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          priority: normalizePriority(t.priority),
          status: normalizeStatus(t.status),
          isFlagged: Boolean(t.isFlagged),
          assignedTo: t.assignedTo ?? undefined,
          updatedAt: t.updatedAt ?? undefined,
        }));

        setTickets(normalized);
      } catch (err) {
        console.error("Ticket fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { tickets, loading };
}
