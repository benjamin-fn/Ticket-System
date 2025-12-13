
export function statusDisplay(sv: string): string {
  const map: Record<string, string> = {
    Inkommet: "Incoming",
    Paagende: "Ongoing",
    Klart: "Done",
  };
  return map[sv] ?? sv;
}
