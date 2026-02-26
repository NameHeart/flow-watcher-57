import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";

const GOLD = "hsl(43, 73%, 52%)";
const GOLD_LIGHT = "hsl(43, 60%, 70%)";
const DARK = "hsl(220, 20%, 12%)";
const MUTED = "hsl(220, 10%, 46%)";
const SUCCESS = "hsl(152, 60%, 42%)";
const INFO = "hsl(210, 80%, 52%)";
const WARN = "hsl(38, 92%, 50%)";

export function GateInOutTrendChart({ data }) {
  return (
    <ChartCard title="Gate Traffic (IN vs OUT)">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={30} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="totalIn" stackId="1" stroke={SUCCESS} fill={SUCCESS} fillOpacity={0.5} name="Total IN" />
          <Area type="monotone" dataKey="totalOut" stackId="2" stroke={INFO} fill={INFO} fillOpacity={0.3} name="Total OUT" />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ParkingTrendChart({ data }) {
  return (
    <ChartCard title="Parking Detections">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={30} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="parking1" stackId="1" stroke={GOLD} fill={GOLD} fillOpacity={0.5} name="Camera 1" />
          <Area type="monotone" dataKey="parking2" stackId="1" stroke={GOLD_LIGHT} fill={GOLD_LIGHT} fillOpacity={0.4} name="Camera 2" />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GateComparisonChart({ data }) {
  return (
    <ChartCard title="Gate Comparison (IN)">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={30} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="gateA_in" stroke={GOLD} fill={GOLD} fillOpacity={0.5} name="Gate A" />
          <Area type="monotone" dataKey="gateB_in" stroke={DARK} fill={DARK} fillOpacity={0.3} name="Gate B" />
          <Area type="monotone" dataKey="gateC_in" stroke={INFO} fill={INFO} fillOpacity={0.3} name="Gate C" />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GateLoadChart({ data }) {
  return (
    <ChartCard title="Gate Load (IN vs OUT)">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="gate" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={30} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Bar dataKey="inCount" fill={GOLD} name="IN" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outCount" fill={DARK} name="OUT" radius={[4, 4, 0, 0]} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ParkingLoadCard({ data }) {
  return (
    <ChartCard title="Parking Volume">
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="text-center">
          <div className="font-display text-3xl font-bold text-primary">{data.total}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Detections</div>
        </div>
        <div className="w-px h-12 bg-border" />
        <div className="text-center">
          <div className="font-display text-lg font-semibold">{data.parking1}</div>
          <div className="text-[10px] text-muted-foreground">Camera 1</div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg font-semibold">{data.parking2}</div>
          <div className="text-[10px] text-muted-foreground">Camera 2</div>
        </div>
      </div>
    </ChartCard>
  );
}

export function FlowDistributionChart({ data }) {
  const colors = [GOLD, DARK, GOLD_LIGHT, MUTED, SUCCESS, INFO, WARN];
  return (
    <ChartCard title="Flow Pattern Distribution">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="pattern" cx="50%" cy="50%" outerRadius={70} label={e => e.pattern} labelLine={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
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
