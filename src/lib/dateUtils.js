/**
 * Date & Timezone utilities for Vegas One administrative analytics.
 * Enforces accurate Central Standard Time (CST / CDT - America/Chicago) boundaries.
 */

export function getCSTMonthRange(monthStr) {
  if (!monthStr || monthStr === 'all') return null;

  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return null;

  const lastDay = new Date(year, month, 0).getDate();

  const getOffset = (d) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        timeZoneName: 'longOffset',
      }).formatToParts(d);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      return tzPart ? tzPart.value.replace('GMT', '') : '-05:00';
    } catch {
      return '-05:00';
    }
  };

  const startOffset = getOffset(new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)));
  const endOffset = getOffset(new Date(Date.UTC(year, month - 1, lastDay, 12, 0, 0)));

  const startIso = `${year}-${String(month).padStart(2, '0')}-01T00:00:00.000${startOffset}`;
  const endIso = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999${endOffset}`;

  const startDate = new Date(startIso);
  const endDate = new Date(endIso);

  let label = `${year}-${String(month).padStart(2, '0')}`;
  try {
    label = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Chicago',
    }).format(startDate);
  } catch {}

  return {
    startDate,
    endDate,
    startIso,
    endIso,
    startUtc: startDate.toISOString(),
    endUtc: endDate.toISOString(),
    label,
  };
}

/**
 * Builds a robust MongoDB date range query for CST month boundaries.
 * Matches both native BSON Date objects and ISO strings.
 */
export function buildDateFilterQuery(monthStr, fieldName = 'createdAt') {
  const range = getCSTMonthRange(monthStr);
  if (!range) return {};

  return {
    $or: [
      { [fieldName]: { $gte: range.startDate, $lte: range.endDate } },
      { [fieldName]: { $gte: range.startUtc, $lte: range.endUtc } },
      { [fieldName]: { $gte: range.startIso, $lte: range.endIso } },
    ],
  };
}

/**
 * Generate a list of recent months for UI selectors.
 */
export function getRecentMonthsList(count = 12) {
  const months = [];
  const now = new Date();
  
  // Format current year & month in America/Chicago
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'numeric',
  });
  
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    const label = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Chicago',
    }).format(d);
    months.push({ key, label });
  }

  return months;
}

/**
 * Formats a given Date, timestamp, or ISO string into Central Time (America/Chicago).
 * Output example: "Oct 19, 2026, 6:05 PM CDT" / "CST".
 */
export function formatCSTDateTime(date, includeSeconds = false) {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true,
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return '—';
  }
}

/**
 * Formats a given Date into Central Time date only.
 * Output example: "Oct 19, 2026".
 */
export function formatCSTDate(date) {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return '—';
  }
}
