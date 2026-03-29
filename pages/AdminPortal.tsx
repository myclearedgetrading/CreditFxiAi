import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Activity,
  LifeBuoy,
  Briefcase,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Target,
  Percent,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { User } from '../types';
import {
  adminFetchAllUsers,
  adminTryCountOpenTickets,
  adminTryCountClients,
} from '../services/firebaseService';

function daysAgo(iso: string | undefined, n: number): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= Date.now() - n * 86400000;
}

function hasImportedCredit(u: User): boolean {
  const s = u.creditScore;
  const hasScore = (s?.equifax || 0) > 0 || (s?.experian || 0) > 0 || (s?.transunion || 0) > 0;
  return hasScore || (u.negativeItems?.length ?? 0) > 0;
}

function signupBuckets(users: User[], days: number): { date: string; signups: number }[] {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, 0);
  }
  for (const u of users) {
    const c = u.createdAt;
    if (!c) continue;
    const day = c.slice(0, 10);
    if (map.has(day)) map.set(day, (map.get(day) || 0) + 1);
  }
  return Array.from(map.entries()).map(([date, signups]) => ({ date: date.slice(5), signups }));
}

const AdminPortal: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openTickets, setOpenTickets] = useState<number | null>(null);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, t, c] = await Promise.all([
        adminFetchAllUsers(),
        adminTryCountOpenTickets(),
        adminTryCountClients(),
      ]);
      setUsers(u);
      setOpenTickets(t);
      setClientCount(c);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const new7 = users.filter((u) => daysAgo(u.createdAt, 7)).length;
    const new30 = users.filter((u) => daysAgo(u.createdAt, 30)).length;
    const activated = users.filter(hasImportedCredit).length;
    const activationRate = total ? Math.round((activated / total) * 100) : 0;
    const byRole: Record<string, number> = {};
    for (const u of users) {
      const r = u.role || 'USER';
      byRole[r] = (byRole[r] || 0) + 1;
    }
    const roleChart = Object.entries(byRole).map(([name, value]) => ({ name, value }));
    return { total, new7, new30, activated, activationRate, roleChart };
  }, [users]);

  const chartData = useMemo(() => signupBuckets(users, 14), [users]);

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-orange-500" />
            Admin &amp; growth
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Platform KPIs for revenue, growth, and support. Grant access by setting{' '}
            <code className="text-orange-400/90 text-xs bg-slate-900 px-1 rounded">role</code> to{' '}
            <code className="text-orange-400/90 text-xs bg-slate-900 px-1">ADMIN</code> or{' '}
            <code className="text-orange-400/90 text-xs bg-slate-900 px-1">SUPER_ADMIN</code> on your
            user doc in Firestore.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-medium border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Core growth & product KPIs */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Users &amp; activation</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Users}
            label="Registered users"
            value={loading ? '—' : stats.total}
            hint="All profiles in Firestore"
          />
          <KpiCard
            icon={UserPlus}
            label="New (7 days)"
            value={loading ? '—' : stats.new7}
            hint="By createdAt"
          />
          <KpiCard
            icon={Activity}
            label="New (30 days)"
            value={loading ? '—' : stats.new30}
            hint="Signup velocity"
          />
          <KpiCard
            icon={TrendingUp}
            label="Activation rate"
            value={loading ? '—' : `${stats.activationRate}%`}
            hint="Imported report or scores / negatives"
            sub={!loading ? `${stats.activated} active` : undefined}
          />
        </div>
      </div>

      {/* Support & CRM */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Support &amp; CRM</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={LifeBuoy}
            label="Open tickets"
            value={loading ? '—' : openTickets === null ? '—' : openTickets}
            hint={openTickets === null && !loading ? 'Rules or index' : 'Status OPEN'}
          />
          <KpiCard
            icon={Briefcase}
            label="CRM clients"
            value={loading ? '—' : clientCount === null ? '—' : clientCount}
            hint="All tenant client records"
          />
        </div>
      </div>

      {/* Revenue placeholders — connect Stripe / billing later */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Revenue (manual / integrate)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={DollarSign}
            label="MRR"
            value="—"
            hint="Connect Stripe or enter in sheet"
          />
          <KpiCard
            icon={DollarSign}
            label="ARPU / mo"
            value="—"
            hint="MRR ÷ paying users"
          />
          <KpiCard
            icon={Percent}
            label="Trial → paid"
            value="—"
            hint="Funnel from your billing tool"
          />
          <KpiCard
            icon={TrendingUp}
            label="Net churn"
            value="—"
            hint="Logo + revenue churn"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Signups (14 days)</h3>
          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="signups" stroke="#ea580c" fill="#ea580c" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Users by role</h3>
          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            ) : stats.roleChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.roleChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                  />
                  <Bar dataKey="value" fill="#ea580c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Recent users</h3>
          <span className="text-xs text-slate-500">{users.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Credit data</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : (
                [...users]
                  .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                  .slice(0, 25)
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="px-5 py-3 whitespace-nowrap">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {u.createdAt ? u.createdAt.slice(0, 10) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {hasImportedCredit(u) ? (
                          <span className="text-emerald-500 text-xs">Yes</span>
                        ) : (
                          <span className="text-slate-600 text-xs">No</span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="p-2 rounded-lg bg-orange-900/20 text-orange-400">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mt-3 tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      <p className="text-[10px] text-slate-600 mt-2 leading-snug">{hint}</p>
    </div>
  );
}

export default AdminPortal;
