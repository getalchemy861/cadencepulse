"use client";

import { useState } from "react";
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
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  onSyncComplete?: () => void;
}

export function Header({ onSyncComplete }: HeaderProps) {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
          <PhoneOutgoing className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Pulse</h1>
      </div>

      <div className="flex items-center gap-4">
        {syncMessage && (
          <span className="text-sm text-slate-600">{syncMessage}</span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="h-9 px-3"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Google
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-slate-900 relative"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {session?.user?.name && (
                  <p className="font-medium">{session.user.name}</p>
                )}
                {session?.user?.email && (
                  <p className="w-[200px] truncate text-sm text-slate-500">
                    {session.user.email}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
