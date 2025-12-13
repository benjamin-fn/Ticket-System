
import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useUser } from "@/components/UserProvider";
import { useTickets } from "@/hooks/useTickets";
import type { Ticket } from "@/types/Ticket";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as ChartTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS_STATUS = {
  Open: "#60a5fa",
  InProgress: "#f59e0b",
  Closed: "#22c55e",
};

const COLORS_PRIORITY = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

function PriorityBadge({ level }: { level: Ticket["priority"] }) {
  const map = {
    Low: "bg-green-100 text-green-700 border border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    High: "bg-red-100 text-red-700 border border-red-200",
  };
  return <span className={"text-[10px] font-medium px-2 py-1 rounded-md " + map[level]}>{level}</span>;
}

function StatusBadge({ status }: { status?: Ticket["status"] }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const map = {
    Open: "bg-blue-100 text-blue-700 border border-blue-200",
    InProgress: "bg-amber-100 text-amber-700 border border-amber-200",
    Closed: "bg-green-100 text-green-700 border border-green-200",
  };
  return (
    <span className={"text-[10px] font-medium px-2 py-1 rounded-md " + map[status]}>
      {status === "InProgress" ? "In Progress" : status}
    </span>
  );
}

function LegendDots({ items }: { items: { name: string; color: string; value?: number }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs mt-2">
      {items.map((it) => (
        <div key={it.name} className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: it.color }} />
          <span className="text-gray-700">
            {it.name} {typeof it.value === "number" ? `(${it.value})` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function TopTabs() {
  const loc = useLocation();
  const isDash = loc.pathname.startsWith("/dashboard");
  const isTickets = loc.pathname.startsWith("/tickets");
  const base = "px-3 py-1.5 rounded-md text-sm border transition";
  return (
    <div className="flex items-center gap-2">
      <Link to="/dashboard" className={`${base} ${isDash ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>
        Dashboard
      </Link>
      <Link to="/tickets/new" className={`${base} ${isTickets ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>
        Tickets
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const { tickets: allTickets = [], loading } = useTickets();
  const navigate = useNavigate();

  // KPIs
  const total = allTickets.length;
  const openCount = allTickets.filter(t => t.status === "Open").length;
  const inProgressCount = allTickets.filter(t => t.status === "InProgress").length;
  const closedCount = allTickets.filter(t => t.status === "Closed").length;

  const statusData = useMemo(() => [
    { name: "Open", value: openCount, color: COLORS_STATUS.Open },
    { name: "In Progress", value: inProgressCount, color: COLORS_STATUS.InProgress },
    { name: "Closed", value: closedCount, color: COLORS_STATUS.Closed },
  ], [openCount, inProgressCount, closedCount]);

  const priorityData = useMemo(() => {
    const low = allTickets.filter(t => t.priority === "Low").length;
    const med = allTickets.filter(t => t.priority === "Medium").length;
    const high = allTickets.filter(t => t.priority === "High").length;
    return [
      { name: "Low", value: low, color: COLORS_PRIORITY.Low },
      { name: "Medium", value: med, color: COLORS_PRIORITY.Medium },
      { name: "High", value: high, color: COLORS_PRIORITY.High },
    ];
  }, [allTickets]);

  // Recent tickets
  const recent = [...allTickets].sort((a, b) => {
    const da = a.updatedAt ? +new Date(a.updatedAt) : 0;
    const db = b.updatedAt ? +new Date(b.updatedAt) : 0;
    return db - da;
  }).slice(0, 6);

  const [search, setSearch] = useState("");
  const filteredRecent = recent.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Dashboard</div>
            <h2 className="text-xl font-semibold text-gray-900">
              Overview of your ticket system
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <TopTabs />
            <button
              onClick={() => navigate("/tickets/new")}
              className="rounded-md bg-black text-white text-sm px-3 py-1.5 hover:bg-gray-800"
            >
              + New Ticket
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Total Tickets</div>
            <div className="text-2xl font-semibold">{total}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Open</div>
            <div className="text-2xl font-semibold">{openCount}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">In Progress</div>
            <div className="text-2xl font-semibold">{inProgressCount}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Closed</div>
            <div className="text-2xl font-semibold">{closedCount}</div>
          </div>

        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Status Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm font-medium mb-2 text-gray-900">Status Distribution</div>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} innerRadius={60} outerRadius={90} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <LegendDots items={statusData} />
          </div>

          {/* Priority Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm font-medium mb-2 text-gray-900">Priority Levels</div>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip />
                  <Bar dataKey="value">
                    {priorityData.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <LegendDots items={priorityData} />
          </div>

        </section>

        {/* RECENT TICKETS */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">Recent Tickets</div>
              <div className="text-xs text-gray-500">Latest activity</div>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading…</div>
          ) : filteredRecent.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No tickets found.</div>
          ) : (
            <ul>
              {filteredRecent.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-4 py-3 border-t border-gray-100 hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">
                      #{String(t.id).slice(0, 4)} — {t.title}
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <StatusBadge status={t.status} />
                      <PriorityBadge level={t.priority} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate(`/tickets/${t.id}`)}
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      View
                    </button>
                    <div className="text-xs text-gray-500">
                      {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

        </div>

        <div className="mt-6 text-xs text-gray-400">
          Logged in as: <span className="font-medium text-gray-600">{user?.email}</span>

        </div>

      </div>
    </AppLayout>
  );
}
