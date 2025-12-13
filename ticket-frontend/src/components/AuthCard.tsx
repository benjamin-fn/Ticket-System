import type { ReactNode } from "react";
import Logo from "./Logo";

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e6ecff] to-[#f7f9ff]">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 space-y-6">
        <div className="text-center space-y-2">
          <Logo />
          <h1 className="text-xl font-semibold">Ticket Management</h1>
          <p className="text-gray-500 text-sm">
            Manage your support tickets efficiently
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
