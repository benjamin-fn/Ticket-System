import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketsApi } from "../shared/api/tickets";
import { useUser } from "@/components/UserProvider";

export default function NewTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // FIX: Typed priority state
  const [priority, setPriority] =
    useState<"Low" | "Medium" | "High">("Low");

  const [isFlagged, setIsFlagged] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutation = useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      navigate("/dashboard");
    },
    onError: () => {
      setError("Could not create ticket.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!user?.id) {
      setError("User session error — please log in again.");
      return;
    }

    mutation.mutate({
      title,
      description,
      priority,
      isFlagged,
      ownerId: user.id, // FIX: Correct ownerId
    });
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create new ticket</h2>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ticket title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Describe the issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select
                className="mt-1 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "Low" | "Medium" | "High")
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={isFlagged}
                onChange={(e) => setIsFlagged(e.target.checked)}
              />
              Flagged
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 transition"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
