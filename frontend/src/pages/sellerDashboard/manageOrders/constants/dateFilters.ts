export type DateFilterPresetId = 'recent' | 'last_week' | 'last_month' | 'last_year';

export interface DateFilterPreset {
  id: DateFilterPresetId;
  label: string;
  description: string;
  summary: string;
}

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const startOfWeek = (date: Date) => {
  const copy = startOfDay(date);
  const isoWeekday = (copy.getDay() + 6) % 7; // Monday=0
  copy.setDate(copy.getDate() - isoWeekday);
  return copy;
};

export const DATE_FILTER_PRESETS: Record<DateFilterPresetId, DateFilterPreset> = {
  recent: {
    id: 'recent',
    label: 'Recent',
    description: 'Latest orders',
    summary: 'Recent orders',
  },
  last_week: {
    id: 'last_week',
    label: 'Last week',
    description: 'Previous calendar week',
    summary: 'Previous week',
  },
  last_month: {
    id: 'last_month',
    label: 'Last month',
    description: 'Previous month',
    summary: 'Last month',
  },
  last_year: {
    id: 'last_year',
    label: 'Last year',
    description: 'Previous calendar year',
    summary: 'Previous year',
  },
};

export const DATE_FILTER_PRESET_ORDER: DateFilterPresetId[] = [
  'recent',
  'last_week',
  'last_month',
  'last_year',
];

export const DEFAULT_DATE_PRESET: DateFilterPresetId = 'recent';

const PRESET_ALIASES: Record<string, DateFilterPresetId> = {
  recent: 'recent',
  'recent order': 'recent',
  'recent orders': 'recent',
  'last week': 'last_week',
  last_week: 'last_week',
  'past 7 days': 'last_week',
  'last month': 'last_month',
  last_month: 'last_month',
  'previous month': 'last_month',
  'last year': 'last_year',
  last_year: 'last_year',
  'previous 12 months': 'last_year',
};

export const isDateFilterPreset = (value?: string | null): value is DateFilterPresetId =>
  Boolean(value && DATE_FILTER_PRESETS[value as DateFilterPresetId]);

export const resolvePresetIdFromValue = (value?: string | null): DateFilterPresetId | null => {
  if (!value) {
    return DEFAULT_DATE_PRESET;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_DATE_PRESET;
  }
  if (trimmed.startsWith('Custom:') || trimmed.startsWith('Exact:')) {
    return null;
  }
  if (DATE_FILTER_PRESETS[trimmed as DateFilterPresetId]) {
    return trimmed as DateFilterPresetId;
  }
  const alias = PRESET_ALIASES[trimmed.toLowerCase()];
  return alias || null;
};

export const normalizeDateFilterValue = (value?: string | null): string => {
  if (!value) {
    return DEFAULT_DATE_PRESET;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_DATE_PRESET;
  }
  if (trimmed.startsWith('Custom:') || trimmed.startsWith('Exact:')) {
    return trimmed;
  }
  return resolvePresetIdFromValue(trimmed) || DEFAULT_DATE_PRESET;
};

export interface DateRangePayload {
  startDate?: string;
  endDate?: string;
}

export const getDateRangeForPreset = (
  preset: DateFilterPresetId,
  referenceDate: Date = new Date()
): DateRangePayload | null => {

  switch (preset) {
    case 'recent':
      return null;
    case 'last_week': {
      const currentWeekStart = startOfWeek(referenceDate);
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - 7);
      const previousWeekEnd = new Date(currentWeekStart.getTime() - 1);
      return {
        startDate: start.toISOString(),
        endDate: previousWeekEnd.toISOString(),
      };
    }
    case 'last_month': {
      const start = startOfDay(new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1));
      const endOfPreviousMonth = endOfDay(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0));
      return {
        startDate: start.toISOString(),
        endDate: endOfPreviousMonth.toISOString(),
      };
    }
    case 'last_year': {
      const start = startOfDay(new Date(referenceDate.getFullYear() - 1, 0, 1));
      const endOfPreviousYear = endOfDay(new Date(referenceDate.getFullYear() - 1, 11, 31));
      return {
        startDate: start.toISOString(),
        endDate: endOfPreviousYear.toISOString(),
      };
    }
    default:
      return null;
  }
};

