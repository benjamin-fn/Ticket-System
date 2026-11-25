import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./UserProvider";
import { LogOut, Ticket, PlusCircle, Home } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col">
        <h1 class-length="text-xl font-bold mb-6">Ticket System</h1>

        <nav className="flex flex-col gap-3 text-sm">
          <Link to="/dashboard" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Home size={18} /> Dashboard
          </Link>

          <Link to="/tickets" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <Ticket size={18} /> Tickets
          </Link>

          <Link to="/tickets/new" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
            <PlusCircle size={18} /> New Ticket
          </Link>
        </nav>

        {/* USER INFO */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm mt-2 text-red-600 hover:underline"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
