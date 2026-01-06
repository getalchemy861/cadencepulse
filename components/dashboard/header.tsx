"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, PhoneOutgoing, RefreshCw, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationsPanel } from "./notifications-panel";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

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

interface HeaderProps {
  onSyncComplete?: () => void;
}

export function Header({ onSyncComplete }: HeaderProps) {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchReminders = useCallback(async () => {
    try {
      const response = await fetch("/api/reminders");
      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders);
        setDueCount(data.dueCount);
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchReminders();
  }, [fetchReminders]);

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        const parts = [`Synced ${data.synced} contacts`];
        if (data.newSuggestions > 0) {
          parts.push(`found ${data.newSuggestions} new suggestions`);
        }
        setSyncMessage(parts.join(", "));
        onSyncComplete?.();
        // Reload page to show new suggestions
        if (data.newSuggestions > 0) {
          window.location.reload();
        }
      } else {
        setSyncMessage(data.error || "Sync failed");
      }
    } catch (error) {
      setSyncMessage("Sync failed");
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#1a5f4a]/10 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1a5f4a] flex items-center justify-center shadow-lg shadow-[#1a5f4a]/20">
          <PhoneOutgoing className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#1a5f4a]">Pulse</h1>
      </div>

      <div className="flex items-center gap-3">
        {syncMessage && (
          <span className="text-sm text-[#1a5f4a]/70 font-medium bg-[#1a5f4a]/5 px-3 py-1.5 rounded-lg">{syncMessage}</span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="h-10 px-4 rounded-xl border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5 hover:border-[#1a5f4a]/30 font-semibold"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Google
        </Button>

        {mounted && (
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-[#1a5f4a]/60 hover:text-[#1a5f4a] hover:bg-[#1a5f4a]/5 relative"
              >
                <Bell className="h-5 w-5" />
                {dueCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#d4a853] text-white text-xs flex items-center justify-center font-bold shadow-md">
                    {dueCount > 9 ? "9+" : dueCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-2xl border-[#1a5f4a]/10 shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a5f4a]/10 bg-[#1a5f4a]/5 rounded-t-2xl">
                <h3 className="font-bold text-sm text-[#1a5f4a]">Reminders</h3>
              </div>
              <NotificationsPanel
                reminders={reminders}
                onRefresh={() => {
                  fetchReminders();
                }}
              />
            </PopoverContent>
          </Popover>
        )}

        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 hover:bg-[#1a5f4a]/5">
                <Avatar className="h-10 w-10 border-2 border-[#1a5f4a]/10 shadow-sm">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-[#1a5f4a] text-white font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#1a5f4a]/10 shadow-xl">
              <div className="flex items-center justify-start gap-2 p-3">
                <div className="flex flex-col space-y-1 leading-none">
                  {session?.user?.name && (
                    <p className="font-bold text-[#1a5f4a]">{session.user.name}</p>
                  )}
                  {session?.user?.email && (
                    <p className="w-[200px] truncate text-sm text-[#1a5f4a]/60">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-[#1a5f4a]/10" />
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg mx-1 text-[#1a5f4a] focus:bg-[#1a5f4a]/5">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg mx-1 mb-1 text-red-600 focus:text-red-700 focus:bg-red-50"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0">
            <Avatar className="h-10 w-10 border-2 border-[#1a5f4a]/10 shadow-sm">
              <AvatarFallback className="bg-[#1a5f4a] text-white font-bold">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  );
}
