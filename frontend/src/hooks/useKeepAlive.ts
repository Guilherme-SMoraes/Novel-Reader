import { useEffect } from 'react';
import { healthApi } from '../services/api';

const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (well below Render's 15 min limit)

export function useKeepAlive() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const ping = async () => {
      try {
        await healthApi.check();
      } catch {
        // Silent failure for background keep-alive ping
      }
    };

    // Initial ping on mount to ensure server is awake
    ping();

    // Periodic ping every 4 minutes
    timer = setInterval(ping, PING_INTERVAL_MS);

    // Ping on tab focus / visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        ping();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
