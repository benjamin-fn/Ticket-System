import { useQuery } from "@tanstack/react-query";
import { ticketsApi } from "./tickets";
import { useUser } from "@/components/UserProvider";

export function useMyTickets() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["tickets", user?.id],
    queryFn: async () => {
      // Backend filtrerar redan på OwnerId, så list() räcker
      return await ticketsApi.list();
    },
  });
}
