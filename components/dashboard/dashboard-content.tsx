"use client";

import { useState, useCallback } from "react";
import { ContactList } from "./contact-list";
import { SuggestedContacts } from "./suggested-contacts";

export function DashboardContent() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContactAdded = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <SuggestedContacts onContactAdded={handleContactAdded} />
      <ContactList key={refreshKey} />
    </div>
  );
}
