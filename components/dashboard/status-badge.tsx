"use client";

import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  [Status.OVERDUE]: {
    styles: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    icon: AlertCircle,
    label: "Overdue",
  },
  [Status.IN_WINDOW]: {
    styles: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    icon: Clock,
    label: "Due Soon",
  },
  [Status.HEALTHY]: {
    styles:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    icon: CheckCircle2,
    label: "Healthy",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.styles} flex gap-1.5 items-center w-fit px-2.5 py-0.5 font-medium transition-colors`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
