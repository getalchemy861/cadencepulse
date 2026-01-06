"use client";

import { useState, useEffect, useCallback } from "react";
import { Lightbulb, X, Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AcceptSuggestionDialog } from "./accept-suggestion-dialog";

interface SuggestedContact {
  id: string;
  email: string;
  name: string | null;
  lastEmailed: string;
  emailCount: number;
}

interface SuggestedContactsProps {
  onContactAdded?: () => void;
}

export function SuggestedContacts({ onContactAdded }: SuggestedContactsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<SuggestedContact | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await fetch("/api/suggestions");
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      const response = await fetch(`/api/suggestions/${id}/reject`, {
        method: "POST",
      });
      if (response.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to reject suggestion:", error);
    } finally {
      setRejectingId(null);
    }
  };

  const handleAcceptClick = (suggestion: SuggestedContact) => {
    setSelectedSuggestion(suggestion);
    setAcceptDialogOpen(true);
  };

  const handleAccepted = () => {
    if (selectedSuggestion) {
      setSuggestions((prev) =>
        prev.filter((s) => s.id !== selectedSuggestion.id)
      );
    }
    setAcceptDialogOpen(false);
    setSelectedSuggestion(null);
    onContactAdded?.();
  };

  if (loading) {
    return null;
  }

  if (suggestions.length === 0) {
    return null;
  }

  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 3);
  const remainingCount = suggestions.length - 3;

  return (
    <>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 mb-1">
                We found {suggestions.length} people you&apos;ve emailed
                recently
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Add them to your contact list to track your relationship health.
              </p>

              <div className="space-y-2">
                {displayedSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">
                        {suggestion.name || suggestion.email.split("@")[0]}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {suggestion.email}
                        {suggestion.emailCount > 1 && (
                          <span className="ml-2 text-blue-600">
                            ({suggestion.emailCount} emails)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(suggestion.id)}
                        disabled={rejectingId === suggestion.id}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                      >
                        {rejectingId === suggestion.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptClick(suggestion)}
                        className="h-8 bg-blue-600 hover:bg-blue-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {remainingCount > 0 && !showAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  View {remainingCount} more
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}

              {showAll && suggestions.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(false)}
                  className="mt-3 text-slate-500 hover:text-slate-700"
                >
                  Show less
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSuggestion && (
        <AcceptSuggestionDialog
          open={acceptDialogOpen}
          onOpenChange={setAcceptDialogOpen}
          suggestion={selectedSuggestion}
          onAccepted={handleAccepted}
        />
      )}
    </>
  );
}
