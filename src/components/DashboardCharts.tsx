import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#E8D48B";
const DARK = "#1e2a3a";
const MUTED = "#94a3b8";
const SUCCESS = "#22c55e";
const INFO = "#3b82f6";

export function EnteredTrendChart({ data }) {
  return (
    <ChartCard title="Entries by Gate">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={30} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Area type="monotone" dataKey="northIn" stackId="1" stroke={GOLD} fill={GOLD} fillOpacity={0.6} name="North Gate" />
          <Area type="monotone" dataKey="southIn" stackId="1" stroke={DARK} fill={DARK} fillOpacity={0.3} name="South Gate" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ParkedVsPassedChart({ data }) {
  return (
    <ChartCard title="Parked vs Passed Through">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={30} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Area type="monotone" dataKey="parked" stackId="1" stroke={SUCCESS} fill={SUCCESS} fillOpacity={0.5} name="Parked" />
          <Area type="monotone" dataKey="passed" stackId="1" stroke={INFO} fill={INFO} fillOpacity={0.3} name="Passed" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function FlowDistributionChart({ data }) {
  const colors = [GOLD, DARK, GOLD_LIGHT, MUTED];
  return (
    <ChartCard title="Flow Pattern Distribution">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="pattern" cx="50%" cy="50%" outerRadius={70} label={e => e.pattern} labelLine={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GateLoadChart({ data }) {
  return (
    <ChartCard title="Gate Load (IN vs OUT)">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="gate" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={30} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Bar dataKey="inCount" fill={GOLD} name="IN" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outCount" fill={DARK} name="OUT" radius={[4, 4, 0, 0]} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-3 sm:p-4 shadow-card min-w-0"
    >
      <h3 className="font-display text-xs sm:text-sm font-semibold mb-2 sm:mb-3">{title}</h3>
      {children}
    </motion.div>
  );
}
