import { Car, Truck, Bike } from "lucide-react";

const VEHICLE_ICONS = {
  Sedan: Car,
  SUV: Car,
  Hatchback: Car,
  Pickup: Truck,
  Van: Truck,
  Truck: Truck,
  Motorcycle: Bike,
};

const COLOR_MAP = {
  White: "bg-gray-100 border-gray-300",
  Black: "bg-gray-800 border-gray-900",
  Silver: "bg-gray-300 border-gray-400",
  Red: "bg-red-400 border-red-500",
  Blue: "bg-blue-400 border-blue-500",
  Gray: "bg-gray-400 border-gray-500",
  Green: "bg-green-400 border-green-500",
  Brown: "bg-amber-600 border-amber-700",
};

export function VehicleIdentityBadge({ vehicleType, color, size = "sm" }) {
  const Icon = VEHICLE_ICONS[vehicleType] || Car;
  const colorClass = COLOR_MAP[color] || "bg-muted border-border";
  const isSmall = size === "sm";

  return (
    <div className="flex items-center gap-1.5">
      <div className={`${isSmall ? "w-3 h-3" : "w-4 h-4"} rounded-full border ${colorClass} flex-shrink-0`} />
      <Icon className={`${isSmall ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground flex-shrink-0`} />
      <span className={`${isSmall ? "text-xs" : "text-sm"} font-medium truncate`}>
        {color} {vehicleType}
      </span>
    </div>
  );
}
