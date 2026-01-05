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
import { StatusBadge } from "./status-badge";
import { AddContactDialog } from "./add-contact-dialog";
import { Status } from "@prisma/client";
import { formatLastContacted, getOutreachSuggestion } from "@/lib/pulse-logic";

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  targetFrequency: number;
  varianceBuffer: number;
  lastInteraction: string;
  status: Status;
}

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Titles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Relationship Health
          </h2>
          <p className="text-slate-500 text-lg">
            {overdueCount > 0 ? (
              <>
                Check in with{" "}
                <span className="font-semibold text-red-600 underline decoration-red-200 underline-offset-4">
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
      <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 border-0 bg-slate-50 focus-visible:ring-1 focus-visible:ring-blue-100 focus-visible:bg-white transition-all text-base"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 border-dashed px-4 text-slate-600 flex gap-2.5 font-medium"
              >
                <Filter className="h-4 w-4" />
                Status: {statusFilter === "ALL" ? "All" : statusFilter}
                <ChevronDown className="h-4 w-4 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(Status.OVERDUE)}>
                Overdue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(Status.IN_WINDOW)}>
                Due Soon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(Status.HEALTHY)}>
                Healthy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Table */}
      {filteredContacts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500">
            {contacts.length === 0
              ? "No contacts yet. Add your first contact to get started!"
              : "No contacts match your search."}
          </p>
        </Card>
      ) : (
        <Card className="shadow-sm border-slate-200 overflow-hidden bg-white rounded-2xl ring-1 ring-slate-200/50">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="pl-6 h-14 font-semibold text-slate-600">
                  Contact
                </TableHead>
                <TableHead className="h-14 font-semibold text-slate-600">
                  Health Status
                </TableHead>
                <TableHead className="h-14 font-semibold text-slate-600">
                  Last Spoke
                </TableHead>
                <TableHead className="hidden lg:table-cell h-14 font-semibold text-slate-600">
                  Cadence
                </TableHead>
                <TableHead className="text-right pr-6 h-14 font-semibold text-slate-600">
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
                    className="group hover:bg-slate-50/80 border-slate-100 transition-colors"
                  >
                    <TableCell className="pl-6 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                          <AvatarFallback
                            className={`${
                              contact.status === Status.OVERDUE
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-600"
                            } font-bold`}
                          >
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 text-[15px]">
                            {contact.name}
                          </div>
                          <div className="text-sm text-slate-500 font-medium">
                            {contact.company || contact.email}
                          </div>
                          {suggestion && (
                            <div className="text-xs text-amber-600 mt-1">
                              {suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={contact.status} />
                    </TableCell>

                    <TableCell className="text-sm font-semibold text-slate-600">
                      {formatLastContacted(new Date(contact.lastInteraction))}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-slate-500 font-medium text-sm">
                      <span className="inline-flex items-center rounded-lg bg-slate-100/80 px-2.5 py-1 ring-1 ring-inset ring-slate-200/50">
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
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
                              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
                          }`}
                        >
                          {checkingIn === contact.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2
                              className={`mr-2 h-4 w-4 ${
                                contact.status === Status.OVERDUE
                                  ? "text-white"
                                  : "text-emerald-600"
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
                              className="h-9 w-9 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl p-1.5 shadow-xl ring-1 ring-slate-200 border-0"
                          >
                            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                              Relationship Care
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-md cursor-pointer px-2 py-2 font-medium">
                              Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md cursor-pointer px-2 py-2 font-medium">
                              <Clock className="mr-2 h-4 w-4" /> Change Cadence
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
    </div>
  );
}
