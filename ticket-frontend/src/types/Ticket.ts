export type Ticket = {
  id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "InProgress" | "Closed";
  isFlagged: boolean;
  receivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt?: string;
  ownerId: string;
};
