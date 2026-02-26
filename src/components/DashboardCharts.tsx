import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "framer-motion";

const GOLD = "hsl(43, 73%, 52%)";
const GOLD_LIGHT = "hsl(43, 60%, 70%)";
const DARK = "hsl(220, 20%, 12%)";
const INFO = "hsl(210, 80%, 52%)";

export function VehicleCountingChart({ data }) {
  return (
    <ChartCard title="VEHICLE COUNTING">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={35} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="totalIn" stroke={INFO} fill={INFO} fillOpacity={0.15} strokeWidth={2} name="Vehicles" />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PassingVehiclesChart({ data }) {
  return (
    <ChartCard title="PASSING VEHICLES">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={35} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="totalOut" stroke={INFO} fill="transparent" strokeWidth={2} name="Passing Cars" />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function VehicleTypeChart({ data }) {
  return (
    <ChartCard title="VEHICLE TYPE">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={70} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Bar dataKey="total" fill={INFO} radius={[0, 4, 4, 0]} name="Count" barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GateLoadChart({ data }) {
  return (
    <ChartCard title="GATE LOAD (IN vs OUT)">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="gate" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={35} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Bar dataKey="inCount" fill={GOLD} name="IN" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outCount" fill={DARK} name="OUT" radius={[4, 4, 0, 0]} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ParkingVolumeChart({ data }) {
  return (
    <ChartCard title="PARKING VOLUME">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={35} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="total" stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} name="Parking" />
          <Area type="monotone" dataKey="parking1" stroke={GOLD_LIGHT} fill="transparent" strokeWidth={1} strokeDasharray="4 4" name="Camera 1" />
          <Area type="monotone" dataKey="parking2" stroke={DARK} fill="transparent" strokeWidth={1} strokeDasharray="4 4" name="Camera 2" />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GateComparisonChart({ data }) {
  return (
    <ChartCard title="GATE COMPARISON (IN)">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={35} />
          <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(40,15%,90%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="gateA_in" stroke={GOLD} fill="transparent" strokeWidth={2} name="Gate A" />
          <Area type="monotone" dataKey="gateB_in" stroke={DARK} fill="transparent" strokeWidth={2} name="Gate B" />
          <Area type="monotone" dataKey="gateC_in" stroke={INFO} fill="transparent" strokeWidth={2} name="Gate C" />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4 sm:p-5 shadow-card min-w-0"
    >
      <h3 className="font-display text-xs sm:text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-3 sm:mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}
