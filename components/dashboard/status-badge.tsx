"use client";

import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  [Status.OVERDUE]: {
    styles: "bg-[#d4a853]/10 text-[#d4a853] border-[#d4a853]/30 hover:bg-[#d4a853]/20",
    icon: AlertCircle,
    label: "Overdue",
  },
  [Status.IN_WINDOW]: {
    styles: "bg-[#d4a853]/5 text-[#c49943] border-[#d4a853]/20 hover:bg-[#d4a853]/10",
    icon: Clock,
    label: "Due Soon",
  },
  [Status.HEALTHY]: {
    styles:
      "bg-[#1a5f4a]/10 text-[#1a5f4a] border-[#1a5f4a]/20 hover:bg-[#1a5f4a]/15",
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
