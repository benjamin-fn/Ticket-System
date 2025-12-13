import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/components/UserProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { logout } = useUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light)] text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">
            Ticket System
          </h1>
        </div>

        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-[var(--color-primary)] transition"
          >
            Dashboard
          </Link>
          <Link
            to="/tickets/new"
            className="text-gray-700 hover:text-[var(--color-primary)] transition"
          >
            New Ticket
          </Link>

          <button
            onClick={handleLogout}
            className="text-[var(--color-primary)] border border-[var(--color-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 sm:p-10">{children}</main>

      {/* Footer (optional) */}
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
        © {new Date().getFullYear()} Ticket System — All rights reserved.
      </footer>
    </div>
  );
}
