"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays, addWeeks } from "date-fns";
import { cn } from "@/lib/utils";

interface SetReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: { id: string; name: string } | null;
  onReminderSet: () => void;
}

export function SetReminderDialog({
  open,
  onOpenChange,
  contact,
  onReminderSet,
}: SetReminderDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [note, setNote] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const quickOptions = [
    { label: "Tomorrow", date: addDays(new Date(), 1) },
    { label: "In 3 days", date: addDays(new Date(), 3) },
    { label: "Next week", date: addWeeks(new Date(), 1) },
    { label: "In 2 weeks", date: addWeeks(new Date(), 2) },
  ];

  const handleQuickSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          dueDate: selectedDate.toISOString(),
          note: note || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to set reminder");
      }

      // Reset form and close
      setSelectedDate(undefined);
      setNote("");
      onOpenChange(false);
      onReminderSet();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedDate(undefined);
      setNote("");
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] border-[#1a5f4a]/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[#1a5f4a]">Set Reminder</DialogTitle>
            <DialogDescription className="text-[#1a5f4a]/60">
              Remind yourself to reach out to {contact?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label className="text-[#1a5f4a]">Quick options</Label>
              <div className="flex flex-wrap gap-2">
                {quickOptions.map((option) => (
                  <Button
                    key={option.label}
                    type="button"
                    variant={
                      selectedDate?.toDateString() === option.date.toDateString()
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleQuickSelect(option.date)}
                    className={
                      selectedDate?.toDateString() === option.date.toDateString()
                        ? "bg-[#1a5f4a] hover:bg-[#164a3a]"
                        : "border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[#1a5f4a]">Or pick a date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal border-[#1a5f4a]/20 hover:bg-[#1a5f4a]/5",
                      !selectedDate && "text-[#1a5f4a]/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[#1a5f4a]/10" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reminder-note" className="text-[#1a5f4a]">Note (optional)</Label>
              <Input
                id="reminder-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Discuss project update"
                className="border-[#1a5f4a]/20 focus-visible:ring-[#1a5f4a]/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedDate} className="bg-[#1a5f4a] hover:bg-[#164a3a]">
              {loading ? "Setting..." : "Set Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
