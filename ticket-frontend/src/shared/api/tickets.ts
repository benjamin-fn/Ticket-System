import { http } from "./client";

// =======================
// FRONTEND Ticket type
// =======================
export type Ticket = {
  id: string;
  title: string;
  description: string;

  status: "Open" | "InProgress" | "Closed";
  priority: "Low" | "Medium" | "High";

  isFlagged: boolean;

  receivedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;

  ownerId: string;
};

// =======================
// CREATE DTO
// =======================
export type CreateTicketDto = {
  title: string;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  isFlagged?: boolean;
  ownerId: string;
};

// =======================
// API Ticket type (raw backend)
// =======================
export type ApiTicket = {
  id: string;
  title: string;
  description?: string | null;

  status: "Inkommet" | "Paagende" | "Klart";
  priority: "Low" | "Medium" | "High";

  isFlagged: boolean;

  receivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;

  ownerId: string;
};

// =======================
// MAP API → FRONTEND
// =======================
function mapTicket(t: ApiTicket): Ticket {
  const statusMap = {
    Inkommet: "Open",
    Paagende: "InProgress",
    Klart: "Closed",
  } as const;

  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",

    status: statusMap[t.status],
    priority: t.priority,

    isFlagged: t.isFlagged,

    receivedAt: t.receivedAt ?? null,
    startedAt: t.startedAt ?? null,
    completedAt: t.completedAt ?? null,
    updatedAt: t.updatedAt ?? null,

    ownerId: t.ownerId,
  };
}

// =======================
// API METHODS
// =======================
export const ticketsApi = {
  async list(): Promise<Ticket[]> {
    const r = await http.get("/api/tickets");
    return r.data.map(mapTicket);
  },

  async get(id: string): Promise<Ticket> {
    const r = await http.get(`/api/tickets/${id}`);
    return mapTicket(r.data);
  },

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const r = await http.post("/api/tickets", dto);
    return mapTicket(r.data);
  },

  async changeStatus(
    id: string,
    status: "Inkommet" | "Paagende" | "Klart"
  ): Promise<Ticket> {
    const r = await http.put(`/api/tickets/${id}`, { status });
    return mapTicket(r.data);
  },

  async edit(id: string, dto: Partial<CreateTicketDto>): Promise<Ticket> {
    const r = await http.put(`/api/tickets/${id}/edit`, dto);
    return mapTicket(r.data);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/api/tickets/${id}`);
  },
};
