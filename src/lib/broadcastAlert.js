// Ultra-fast inter-tab / inter-window event dispatch for Vegas One alerts (0ms latency)
export function broadcastAdminAlert(eventType, payload = {}) {
  if (typeof window === 'undefined') return;
  const eventData = {
    type: eventType,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).slice(2, 8),
    ...payload,
  };

  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('vegas_realtime_channel');
      bc.postMessage(eventData);
      setTimeout(() => {
        try { bc.close(); } catch {}
      }, 500);
    }
  } catch {}

  try {
    localStorage.setItem('vegas_realtime_event', JSON.stringify(eventData));
  } catch {}
}
