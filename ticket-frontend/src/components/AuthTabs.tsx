import { Link } from "react-router-dom";

export default function AuthTabs({ active }: { active: "login" | "register" }) {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1">
      <Link
        to="/login"
        className={`flex-1 text-center py-2 rounded-lg font-medium ${
          active === "login" ? "bg-white shadow-sm" : "text-gray-500"
        }`}
      >
        Login
      </Link>
      <Link
        to="/register"
        className={`flex-1 text-center py-2 rounded-lg font-medium ${
          active === "register" ? "bg-white shadow-sm" : "text-gray-500"
        }`}
      >
        Register
      </Link>
    </div>
  );
}
