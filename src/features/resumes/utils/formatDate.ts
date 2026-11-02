/**
 * Formats a date string (e.g. "2023-01", "2023-01-15", "2023") into a clean ATS-friendly string
 * Example: "Jan 2023" or "2023"
 */
export function formatResumeDate(dateStr?: string, isCurrent?: boolean): string {
  if (isCurrent) {
    return 'Present';
  }

  if (!dateStr || dateStr.trim() === '') {
    return '';
  }

  const cleaned = dateStr.trim();

  // If already formatted like "Present", return as-is
  if (cleaned.toLowerCase() === 'present') {
    return 'Present';
  }

  // Handle YYYY format
  if (/^\d{4}$/.test(cleaned)) {
    return cleaned;
  }

  // Handle YYYY-MM or YYYY-MM-DD
  const match = cleaned.match(/^(\d{4})-(\d{1,2})/);
  if (match) {
    const year = match[1];
    const monthNum = parseInt(match[2], 10);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} ${year}`;
    }
    return `${year}`;
  }

  // If standard string or unrecognized, return sanitized trimmed string
  return cleaned;
}

/**
 * Formats a date range for display
 * Example: "Jan 2022 – Present" or "Aug 2018 – May 2022"
 */
export function formatResumeDateRange(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  const start = formatResumeDate(startDate);
  const end = isCurrent ? 'Present' : formatResumeDate(endDate);

  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return start;
  }
  if (end) {
    return end;
  }
  return '';
}
