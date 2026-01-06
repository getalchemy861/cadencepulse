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
import { ArrowLeft, Undo2, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RejectedContact {
  id: string;
  email: string;
  name: string | null;
  updatedAt: string;
  emailCount: number;
}

export default function SettingsPage() {
  const [rejectedContacts, setRejectedContacts] = useState<RejectedContact[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

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
    fetchRejected();
  }, [fetchRejected]);

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
