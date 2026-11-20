import { useEffect } from 'react';
import { healthApi } from '../services/api';

const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (well below Render's 15 min limit)

export function useKeepAlive() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const ping = async () => {
      try {
        await healthApi.check();
      } catch (pingErr: unknown) {
        console.debug('Background keep-alive ping skipped', pingErr);
      }
    };

    const warmup = async () => {
      let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('server:waking'));
      }, 4000);

      try {
        await healthApi.check();
      } catch (warmupErr: unknown) {
        console.debug('Server warmup check skipped', warmupErr);
      } finally {
        if (timer) clearTimeout(timer);
        window.dispatchEvent(new CustomEvent('server:ready'));
      }
    };

    warmup();

    // Periodic ping every 4 minutes (silent, keeps server active)
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
