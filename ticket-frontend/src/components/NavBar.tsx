import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/dashboard" className="text-xl font-bold text-indigo-600">
          TicketSystem
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <Link to="/tickets" className="hover:text-indigo-600">Tickets</Link>
          <Link to="/tickets/new" className="hover:text-indigo-600">New Ticket</Link>
        </nav>

        {/* USER + LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
