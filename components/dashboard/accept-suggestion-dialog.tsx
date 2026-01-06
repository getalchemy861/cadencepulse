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

interface SuggestedContact {
  id: string;
  email: string;
  name: string | null;
  lastEmailed: string;
  emailCount: number;
}

interface AcceptSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: SuggestedContact;
  onAccepted: () => void;
}

export function AcceptSuggestionDialog({
  open,
  onOpenChange,
  suggestion,
  onAccepted,
}: AcceptSuggestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [targetFrequency, setTargetFrequency] = useState("30");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/suggestions/${suggestion.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company || null,
          targetFrequency: parseInt(targetFrequency, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add contact");
      }

      setCompany("");
      setTargetFrequency("30");
      onAccepted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const displayName = suggestion.name || suggestion.email.split("@")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add {displayName} to Contacts</DialogTitle>
            <DialogDescription>
              Set up tracking for your relationship with{" "}
              <span className="font-medium text-slate-700">
                {suggestion.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Target Frequency (days)</Label>
              <Input
                id="frequency"
                type="number"
                min="1"
                max="365"
                value={targetFrequency}
                onChange={(e) => setTargetFrequency(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                How often you want to stay in touch (default: 30 days)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
