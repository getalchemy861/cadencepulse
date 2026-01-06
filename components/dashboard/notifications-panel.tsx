"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock, CalendarIcon, Mail } from "lucide-react";
import { format, isToday, isPast, startOfDay, addDays, addWeeks } from "date-fns";

interface Reminder {
  id: string;
  dueDate: string;
  note: string | null;
  status: string;
  contact: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
}

interface NotificationsPanelProps {
  reminders: Reminder[];
  onRefresh: () => void;
}

export function NotificationsPanel({ reminders, onRefresh }: NotificationsPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [snoozeReminderId, setSnoozeReminderId] = useState<string | null>(null);

  const handleAction = async (
    reminderId: string,
    action: "complete" | "dismiss"
  ) => {
    setLoadingId(reminderId);
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "complete" ? "COMPLETED" : "DISMISSED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }

      onRefresh();
    } catch (error) {
      console.error("Failed to update reminder:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSnooze = async (reminderId: string, newDate: Date) => {
    setLoadingId(reminderId);
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueDate: newDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to snooze reminder");
      }

      setSnoozeReminderId(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to snooze reminder:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Split reminders into due/overdue and upcoming
  const today = startOfDay(new Date());
  const dueReminders = reminders.filter((r) => {
    const dueDate = startOfDay(new Date(r.dueDate));
    return dueDate <= today;
  });
  const upcomingReminders = reminders.filter((r) => {
    const dueDate = startOfDay(new Date(r.dueDate));
    return dueDate > today;
  });

  const quickSnoozeOptions = [
    { label: "Tomorrow", date: addDays(new Date(), 1) },
    { label: "In 3 days", date: addDays(new Date(), 3) },
    { label: "Next week", date: addWeeks(new Date(), 1) },
  ];

  const ReminderItem = ({ reminder }: { reminder: Reminder }) => {
    const dueDate = new Date(reminder.dueDate);
    const isOverdue = isPast(dueDate) && !isToday(dueDate);
    const isDueToday = isToday(dueDate);

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a5f4a]/5 transition-colors">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-[#1a5f4a]/10 text-[#1a5f4a] text-xs">
            {getInitials(reminder.contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1a5f4a] truncate">
            Reach out to {reminder.contact.name}
          </p>
          {reminder.note && (
            <p className="text-xs text-[#1a5f4a]/50 truncate mt-0.5">
              {reminder.note}
            </p>
          )}
          <p
            className={`text-xs mt-1 ${
              isOverdue
                ? "text-[#d4a853]"
                : isDueToday
                ? "text-[#d4a853]"
                : "text-[#1a5f4a]/50"
            }`}
          >
            {isOverdue
              ? `Overdue: ${format(dueDate, "MMM d")}`
              : isDueToday
              ? "Due today"
              : `Due: ${format(dueDate, "MMM d")}`}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5"
              onClick={() => window.open(`mailto:${reminder.contact.email}`)}
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
            <Popover
              open={snoozeReminderId === reminder.id}
              onOpenChange={(open) =>
                setSnoozeReminderId(open ? reminder.id : null)
              }
            >
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5"
                  disabled={loadingId === reminder.id}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Snooze
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 border-[#1a5f4a]/10" align="start">
                <div className="flex flex-col gap-1 mb-2">
                  {quickSnoozeOptions.map((option) => (
                    <Button
                      key={option.label}
                      size="sm"
                      variant="ghost"
                      className="justify-start h-8 text-xs text-[#1a5f4a] hover:bg-[#1a5f4a]/5"
                      onClick={() => handleSnooze(reminder.id, option.date)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="border-t border-[#1a5f4a]/10 pt-2">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={(date) => {
                      if (date) handleSnooze(reminder.id, date);
                    }}
                    disabled={(date) => date < new Date()}
                    className="p-0"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-[#1a5f4a] hover:text-[#164a3a] hover:bg-[#1a5f4a]/10 border-[#1a5f4a]/20"
              onClick={() => handleAction(reminder.id, "complete")}
              disabled={loadingId === reminder.id}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-[#1a5f4a]/40 hover:text-[#1a5f4a]/60 border-[#1a5f4a]/20"
              onClick={() => handleAction(reminder.id, "dismiss")}
              disabled={loadingId === reminder.id}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (reminders.length === 0) {
    return (
      <div className="py-8 px-4 text-center">
        <CalendarIcon className="h-10 w-10 text-[#1a5f4a]/20 mx-auto mb-3" />
        <p className="text-sm text-[#1a5f4a]/60">No reminders set</p>
        <p className="text-xs text-[#1a5f4a]/40 mt-1">
          Set reminders from the contact menu
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {dueReminders.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-[#1a5f4a]/50 uppercase tracking-wider bg-[#1a5f4a]/5">
            Today & Overdue
          </div>
          <div className="divide-y divide-[#1a5f4a]/10">
            {dueReminders.map((reminder) => (
              <ReminderItem key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {upcomingReminders.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-[#1a5f4a]/50 uppercase tracking-wider bg-[#1a5f4a]/5">
            Upcoming
          </div>
          <div className="divide-y divide-[#1a5f4a]/10">
            {upcomingReminders.map((reminder) => (
              <ReminderItem key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
