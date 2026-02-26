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

export function VehicleTypeChart({ data }) {
  const chartHeight = Math.max(220, (data?.length || 0) * 32 + 40);
  return (
    <ChartCard title="Vehicle Type Distribution">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={75} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Bar dataKey="inCount" stackId="a" fill={SUCCESS} name="Gate IN" radius={[0, 0, 0, 0]} />
          <Bar dataKey="outCount" stackId="a" fill={INFO} name="Gate OUT" radius={[0, 0, 0, 0]} />
          <Bar dataKey="parkingCount" stackId="a" fill={GOLD} name="Parking" radius={[0, 4, 4, 0]} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function VehicleTypeDonutChart({ data }) {
  const PALETTE = [
    "hsl(43, 73%, 52%)",   // Gold
    "hsl(220, 20%, 12%)",  // Dark navy
    "hsl(152, 50%, 42%)",  // Emerald
    "hsl(210, 65%, 52%)",  // Blue
    "hsl(43, 40%, 70%)",   // Soft gold
    "hsl(220, 10%, 46%)",  // Gray
    "hsl(38, 70%, 50%)",   // Warm amber
  ];
  const total = data?.reduce((sum, d) => sum + d.total, 0) || 0;

  const renderCustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg text-xs">
        <div className="font-semibold text-foreground">{item.name}</div>
        <div className="text-muted-foreground mt-0.5">Count: <span className="font-medium text-foreground">{item.value.toLocaleString()}</span></div>
        <div className="text-muted-foreground">{pct}% of total</div>
      </div>
    );
  };

  return (
    <ChartCard title="Vehicle Type Split">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {data?.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <RTooltip content={renderCustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
            <span className="font-display text-xl font-bold text-foreground">{total.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">Vehicles</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 px-2">
          {data?.map((d, i) => {
            const pct = total > 0 ? ((d.total / total) * 100).toFixed(0) : 0;
            return (
              <div key={d.type} className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                <span>{d.type}</span>
                <span className="text-[10px] opacity-70">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
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
