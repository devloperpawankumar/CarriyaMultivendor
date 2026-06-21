export type TrackingEvent = {
  code: string;
  message: string;
  location?: string;
  timestamp: string;
  isCurrent?: boolean;
};

export type TrackingTimeline = {
  events: TrackingEvent[];
  source: 'leopards' | 'fallback';
  lastUpdated: string;
  error?: string;
};

const API_BASE = process.env.REACT_APP_LEOPARDS_API_BASE;
const CLIENT_ID = process.env.REACT_APP_LEOPARDS_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_LEOPARDS_CLIENT_SECRET;

const subHours = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const buildFallbackEvents = (orderId: string): TrackingEvent[] => {
  return [
    {
      code: 'shared',
      message: 'Order details shared with Leopards Courier',
      timestamp: subHours(36),
    },
    {
      code: 'picked_up',
      message: 'Parcel picked up from seller',
      timestamp: subHours(24),
    },
    {
      code: 'in_transit',
      message: 'Package is in transit to destination city',
      timestamp: subHours(12),
    },
    {
      code: 'out_for_delivery',
      message: 'Courier is delivering to customer',
      timestamp: subHours(2),
      isCurrent: true,
    },
  ].map((event, index, arr) => ({
    ...event,
    message: `${event.message}${orderId ? ` · Order ${orderId}` : ''}`,
    isCurrent: index === arr.length - 1,
  }));
};

const normalizeLeopardsEvents = (payload: any): TrackingEvent[] => {
  const rawEvents: any[] =
    payload?.trackingHistory ||
    payload?.history ||
    payload?.data ||
    payload?.response?.trackingHistory ||
    [];

  if (!Array.isArray(rawEvents) || rawEvents.length === 0) return [];

  return rawEvents
    .map((entry: any) => ({
      code: entry.statusCode || entry.code || entry.stage || 'event',
      message: entry.status || entry.message || entry.details || 'Shipment update',
      location: entry.location || entry.city || entry.hub || undefined,
      timestamp: entry.timestamp || entry.datetime || entry.date || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf())
    .map((event, index, arr) => ({
      ...event,
      isCurrent: index === arr.length - 1,
    }));
};

export const fetchLeopardsTracking = async (orderRef: string): Promise<TrackingTimeline> => {
  const fallback = {
    events: buildFallbackEvents(orderRef),
    source: 'fallback' as const,
    lastUpdated: new Date().toISOString(),
  };

  if (!orderRef || !API_BASE || !CLIENT_ID || !CLIENT_SECRET) {
    return fallback;
  }

  try {
    const url = `${API_BASE.replace(/\/$/, '')}/tracking/${encodeURIComponent(orderRef)}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Client-ID': CLIENT_ID,
        'X-Client-Secret': CLIENT_SECRET,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Leopards tracking failed with ${response.status}`);
    }

    const data = await response.json();
    const events = normalizeLeopardsEvents(data);
    if (!events.length) {
      return fallback;
    }

    return {
      events,
      source: 'leopards',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('[LeopardsTracking] Falling back to mock data', error);
    return {
      ...fallback,
      error: error instanceof Error ? error.message : 'Unable to reach Leopards API',
    };
  }
};

