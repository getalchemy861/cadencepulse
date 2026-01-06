"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Undo2, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RejectedContact {
  id: string;
  email: string;
  name: string | null;
  updatedAt: string;
  emailCount: number;
}

const LOOKBACK_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
];

export default function SettingsPage() {
  const [rejectedContacts, setRejectedContacts] = useState<RejectedContact[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Sync settings state
  const [syncLookbackDays, setSyncLookbackDays] = useState<string>("30");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSyncLookbackDays(String(data.syncLookbackDays));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const fetchRejected = useCallback(async () => {
    try {
      const response = await fetch("/api/suggestions/rejected");
      if (response.ok) {
        const data = await response.json();
        setRejectedContacts(data);
      }
    } catch (error) {
      console.error("Failed to fetch rejected contacts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchRejected();
  }, [fetchSettings, fetchRejected]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncLookbackDays: Number(syncLookbackDays) }),
      });
      if (response.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const response = await fetch(`/api/suggestions/${id}/restore`, {
        method: "POST",
      });
      if (response.ok) {
        setRejectedContacts((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to restore contact:", error);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      <Header />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-slate-500 mt-1">
              Manage your account preferences
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Sync Lookback Period
                  </label>
                  <p className="text-sm text-slate-500 mb-2">
                    How far back to search when syncing with Gmail and Calendar.
                    Longer periods may take more time to sync.
                  </p>
                  {settingsLoading ? (
                    <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-md" />
                  ) : (
                    <Select
                      value={syncLookbackDays}
                      onValueChange={setSyncLookbackDays}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOOKBACK_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings || settingsLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {savingSettings ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : settingsSaved ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {settingsSaved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hidden Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                These contacts were suggested but you chose not to add them.
                They won&apos;t appear in future suggestions unless you restore
                them.
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : rejectedContacts.length === 0 ? (
                <p className="text-center py-8 text-slate-400">
                  No hidden suggestions
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Hidden</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {contact.name || contact.email.split("@")[0]}
                            </div>
                            <div className="text-sm text-slate-500">
                              {contact.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDistanceToNow(new Date(contact.updatedAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(contact.id)}
                            disabled={restoringId === contact.id}
                          >
                            {restoringId === contact.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Undo2 className="h-4 w-4 mr-1" />
                            )}
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
