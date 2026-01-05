import { differenceInDays } from "date-fns";
import { Status } from "@prisma/client";

export interface StatusThresholds {
  healthyMax: number;
  inWindowMax: number;
}

/**
 * Calculate the thresholds for status transitions based on target frequency and variance
 * @param targetFrequency - Target number of days between interactions
 * @param varianceBuffer - Variance percentage (default 0.15 = 15%)
 */
export function getStatusThresholds(
  targetFrequency: number,
  varianceBuffer: number = 0.15
): StatusThresholds {
  // Healthy: < 85% of target (before the window)
  const healthyMax = Math.floor(targetFrequency * (1 - varianceBuffer));
  // In-Window: between 85% and 115% of target
  const inWindowMax = Math.ceil(targetFrequency * (1 + varianceBuffer));

  return { healthyMax, inWindowMax };
}

/**
 * Get the number of days since the last interaction
 */
export function getDaysSinceInteraction(lastInteraction: Date): number {
  return differenceInDays(new Date(), lastInteraction);
}

/**
 * Calculate the current status based on last interaction and target frequency
 * @param lastInteraction - Date of last interaction
 * @param targetFrequency - Target number of days between interactions
 * @param varianceBuffer - Variance percentage (default 0.15 = 15%)
 */
export function calculateStatus(
  lastInteraction: Date,
  targetFrequency: number,
  varianceBuffer: number = 0.15
): Status {
  const daysSince = getDaysSinceInteraction(lastInteraction);
  const { healthyMax, inWindowMax } = getStatusThresholds(
    targetFrequency,
    varianceBuffer
  );

  if (daysSince <= healthyMax) {
    return Status.HEALTHY;
  } else if (daysSince <= inWindowMax) {
    return Status.IN_WINDOW;
  } else {
    return Status.OVERDUE;
  }
}

/**
 * Get a human-readable description of when to reach out
 */
export function getOutreachSuggestion(
  status: Status,
  name: string,
  targetFrequency: number
): string | null {
  switch (status) {
    case Status.IN_WINDOW:
      return `Today is a great day to ping ${name}—you're within your ${targetFrequency}-day window.`;
    case Status.OVERDUE:
      return `Time to reconnect with ${name}! You're past your target cadence.`;
    default:
      return null;
  }
}

/**
 * Format the "last contacted" time in a human-readable way
 */
export function formatLastContacted(lastInteraction: Date): string {
  const days = getDaysSinceInteraction(lastInteraction);

  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(days / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
}
