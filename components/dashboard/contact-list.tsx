"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Search,
  Clock,
  Loader2,
  Bell,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusBadge } from "./status-badge";
import { AddContactDialog } from "./add-contact-dialog";
import { EditContactDialog } from "./edit-contact-dialog";
import { SetReminderDialog } from "./set-reminder-dialog";
import { Status } from "@prisma/client";
import { formatLastContacted, getOutreachSuggestion } from "@/lib/pulse-logic";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  targetFrequency: number;
  varianceBuffer: number;
  lastInteraction: string;
  status: Status;
  hasReminder?: boolean;
  reminder?: {
    id: string;
    dueDate: string;
    note: string | null;
  } | null;
}

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [reminderContact, setReminderContact] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch("/api/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCheckIn = async (contactId: string) => {
    setCheckingIn(contactId);
    try {
      const response = await fetch(`/api/contacts/${contactId}/checkin`, {
        method: "POST",
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to complete reminder:", error);
    }
  };

  const handleDismissReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISMISSED" }),
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to dismiss reminder:", error);
    }
  };

  const formatReminderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return "Overdue";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const overdueCount = contacts.filter((c) => c.status === Status.OVERDUE).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a5f4a]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Titles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-[#1a5f4a]">
            Relationship Health
          </h2>
          <p className="text-[#1a5f4a]/60 text-lg">
            {overdueCount > 0 ? (
              <>
                Check in with{" "}
                <span className="font-semibold text-[#d4a853] underline decoration-[#d4a853]/30 underline-offset-4">
                  {overdueCount} contact{overdueCount !== 1 ? "s" : ""}
                </span>{" "}
                to maintain your network.
              </>
            ) : (
              "All relationships are healthy. Great job!"
            )}
          </p>
        </div>
        <AddContactDialog onContactAdded={fetchContacts} />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-2xl border border-[#1a5f4a]/10 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1a5f4a]/40" />
          <Input
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 border-0 bg-[#1a5f4a]/5 focus-visible:ring-1 focus-visible:ring-[#1a5f4a]/20 focus-visible:bg-white transition-all text-base text-[#1a5f4a]"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 border-dashed border-[#1a5f4a]/20 px-4 text-[#1a5f4a] flex gap-2.5 font-medium hover:bg-[#1a5f4a]/5"
              >
                <Filter className="h-4 w-4" />
                Status: {statusFilter === "ALL" ? "All" : statusFilter}
                <ChevronDown className="h-4 w-4 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-[#1a5f4a]/10">
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")} className="text-[#1a5f4a] focus:bg-[#1a5f4a]/5">
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(Status.OVERDUE)} className="text-[#1a5f4a] focus:bg-[#1a5f4a]/5">
                Overdue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(Status.IN_WINDOW)} className="text-[#1a5f4a] focus:bg-[#1a5f4a]/5">
                Due Soon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(Status.HEALTHY)} className="text-[#1a5f4a] focus:bg-[#1a5f4a]/5">
                Healthy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Table */}
      {filteredContacts.length === 0 ? (
        <Card className="p-12 text-center border-[#1a5f4a]/10">
          <p className="text-[#1a5f4a]/60">
            {contacts.length === 0
              ? "No contacts yet. Add your first contact to get started!"
              : "No contacts match your search."}
          </p>
        </Card>
      ) : (
        <Card className="shadow-sm border-[#1a5f4a]/10 overflow-hidden bg-white rounded-2xl ring-1 ring-[#1a5f4a]/5">
          <Table>
            <TableHeader className="bg-[#1a5f4a]/5">
              <TableRow className="hover:bg-transparent border-[#1a5f4a]/10">
                <TableHead className="pl-6 h-14 font-semibold text-[#1a5f4a]">
                  Contact
                </TableHead>
                <TableHead className="h-14 font-semibold text-[#1a5f4a]">
                  Health Status
                </TableHead>
                <TableHead className="h-14 font-semibold text-[#1a5f4a]">
                  Last Spoke
                </TableHead>
                <TableHead className="hidden lg:table-cell h-14 font-semibold text-[#1a5f4a]">
                  Cadence
                </TableHead>
                <TableHead className="text-right pr-6 h-14 font-semibold text-[#1a5f4a]">
                  Quick Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => {
                const suggestion = getOutreachSuggestion(
                  contact.status,
                  contact.name.split(" ")[0],
                  contact.targetFrequency
                );

                return (
                  <TableRow
                    key={contact.id}
                    className="group hover:bg-[#1a5f4a]/5 border-[#1a5f4a]/10 transition-colors"
                  >
                    <TableCell className="pl-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-11 w-11 border border-[#1a5f4a]/10 shadow-sm transition-transform group-hover:scale-105">
                            <AvatarFallback
                              className={`${
                                contact.status === Status.OVERDUE
                                  ? "bg-[#d4a853]/20 text-[#d4a853]"
                                  : "bg-[#1a5f4a]/10 text-[#1a5f4a]"
                              } font-bold`}
                            >
                              {getInitials(contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          {contact.hasReminder && contact.reminder && (
                            <Popover modal={true}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#d4a853] flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Bell className="h-2.5 w-2.5 text-white" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-64 p-3 border-[#1a5f4a]/10"
                                align="start"
                              >
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <div className="text-xs font-semibold text-[#1a5f4a]/50 uppercase tracking-wider">
                                      Reminder
                                    </div>
                                    <div className="font-semibold text-[#1a5f4a]">
                                      {formatReminderDate(contact.reminder.dueDate)}
                                    </div>
                                    {contact.reminder.note && (
                                      <p className="text-sm text-[#1a5f4a]/70">
                                        {contact.reminder.note}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="flex-1 h-8 bg-[#1a5f4a] hover:bg-[#164a3a]"
                                      onClick={() => handleCompleteReminder(contact.reminder!.id)}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Complete
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 h-8 border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5"
                                      onClick={() => handleDismissReminder(contact.reminder!.id)}
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Dismiss
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#1a5f4a] text-[15px]">
                            {contact.name}
                          </div>
                          <div className="text-sm text-[#1a5f4a]/60 font-medium">
                            {contact.company || contact.email}
                          </div>
                          {suggestion && (
                            <div className="text-xs text-[#d4a853] mt-1">
                              {suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={contact.status} />
                    </TableCell>

                    <TableCell className="text-sm font-semibold text-[#1a5f4a]/70">
                      {formatLastContacted(new Date(contact.lastInteraction))}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-[#1a5f4a]/60 font-medium text-sm">
                      <span className="inline-flex items-center rounded-lg bg-[#1a5f4a]/5 px-2.5 py-1 ring-1 ring-inset ring-[#1a5f4a]/10">
                        Every {contact.targetFrequency} days
                      </span>
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant={
                            contact.status === Status.OVERDUE
                              ? "default"
                              : "secondary"
                          }
                          size="sm"
                          onClick={() => handleCheckIn(contact.id)}
                          disabled={checkingIn === contact.id}
                          className={`h-9 px-4 font-semibold transition-all ${
                            contact.status === Status.OVERDUE
                              ? "bg-[#d4a853] hover:bg-[#c49943] text-white shadow-md shadow-[#d4a853]/30"
                              : "bg-white hover:bg-[#1a5f4a]/5 text-[#1a5f4a] border border-[#1a5f4a]/20 shadow-sm"
                          }`}
                        >
                          {checkingIn === contact.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2
                              className={`mr-2 h-4 w-4 ${
                                contact.status === Status.OVERDUE
                                  ? "text-white"
                                  : "text-[#1a5f4a]"
                              }`}
                            />
                          )}
                          Log Check-in
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-[#1a5f4a]/40 hover:text-[#1a5f4a] transition-colors"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl p-1.5 shadow-xl ring-1 ring-[#1a5f4a]/10 border-0"
                          >
                            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1a5f4a]/50">
                              Relationship Care
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#1a5f4a]/10" />
                            <DropdownMenuItem
                              className="rounded-md cursor-pointer px-2 py-2 font-medium text-[#1a5f4a] focus:bg-[#1a5f4a]/5"
                              onClick={() => setEditingContact(contact)}
                            >
                              Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-md cursor-pointer px-2 py-2 font-medium text-[#1a5f4a] focus:bg-[#1a5f4a]/5"
                              onClick={() => setEditingContact(contact)}
                            >
                              <Clock className="mr-2 h-4 w-4" /> Change Cadence
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-md cursor-pointer px-2 py-2 font-medium text-[#1a5f4a] focus:bg-[#1a5f4a]/5"
                              onClick={() => setReminderContact(contact)}
                            >
                              <Bell className="mr-2 h-4 w-4" /> Set Reminder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#1a5f4a]/10" />
                            <DropdownMenuItem
                              className="rounded-md cursor-pointer px-2 py-2 font-semibold text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => handleDelete(contact.id)}
                            >
                              Delete Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <EditContactDialog
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
        contact={editingContact}
        onContactUpdated={fetchContacts}
      />

      <SetReminderDialog
        open={!!reminderContact}
        onOpenChange={(open) => !open && setReminderContact(null)}
        contact={reminderContact}
        onReminderSet={fetchContacts}
      />
    </div>
  );
}
