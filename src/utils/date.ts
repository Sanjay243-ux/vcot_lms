export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatFullDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatShortDate(isoDate);
}

export type DeadlineUrgency = 'completed' | 'overdue' | 'due_soon' | 'upcoming';

export function getDeadlineInfo(
  dueDateIso: string,
  status: 'pending' | 'completed'
): { label: string; urgency: DeadlineUrgency } {
  if (status === 'completed') {
    return { label: `Due ${formatShortDate(dueDateIso)}`, urgency: 'completed' };
  }

  const due = new Date(dueDateIso);
  if (Number.isNaN(due.getTime())) {
    return { label: 'No due date', urgency: 'upcoming' };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const daysDiff = Math.round((startOfDue - startOfToday) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      label: overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`,
      urgency: 'overdue',
    };
  }
  if (daysDiff === 0) {
    return { label: 'Due today', urgency: 'due_soon' };
  }
  if (daysDiff === 1) {
    return { label: 'Due tomorrow', urgency: 'due_soon' };
  }
  if (daysDiff <= 3) {
    return { label: `Due in ${daysDiff} days`, urgency: 'due_soon' };
  }
  return { label: `Due ${formatShortDate(dueDateIso)}`, urgency: 'upcoming' };
}

export function getInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

