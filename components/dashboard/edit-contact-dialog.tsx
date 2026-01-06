"use client";

import { useState, useEffect } from "react";
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

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  targetFrequency: number;
  varianceBuffer: number;
}

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onContactUpdated: () => void;
}

export function EditContactDialog({
  open,
  onOpenChange,
  contact,
  onContactUpdated,
}: EditContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [targetFrequency, setTargetFrequency] = useState("30");

  // Reset form when contact changes
  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setEmail(contact.email);
      setCompany(contact.company || "");
      setTargetFrequency(String(contact.targetFrequency));
      setError(null);
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: company || null,
          targetFrequency: parseInt(targetFrequency, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update contact");
      }

      onOpenChange(false);
      onContactUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-[#1a5f4a]/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[#1a5f4a]">Edit Contact</DialogTitle>
            <DialogDescription className="text-[#1a5f4a]/60">
              Update contact information and cadence settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-[#1a5f4a]">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                required
                className="border-[#1a5f4a]/20 focus-visible:ring-[#1a5f4a]/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="text-[#1a5f4a]">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@acme.com"
                required
                className="border-[#1a5f4a]/20 focus-visible:ring-[#1a5f4a]/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company" className="text-[#1a5f4a]">Company</Label>
              <Input
                id="edit-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="border-[#1a5f4a]/20 focus-visible:ring-[#1a5f4a]/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-frequency" className="text-[#1a5f4a]">Target Frequency (days)</Label>
              <Input
                id="edit-frequency"
                type="number"
                min="1"
                max="365"
                value={targetFrequency}
                onChange={(e) => setTargetFrequency(e.target.value)}
                className="border-[#1a5f4a]/20 focus-visible:ring-[#1a5f4a]/30"
              />
              <p className="text-xs text-[#1a5f4a]/50">
                How often you want to stay in touch
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#1a5f4a]/20 text-[#1a5f4a] hover:bg-[#1a5f4a]/5"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#1a5f4a] hover:bg-[#164a3a]">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
