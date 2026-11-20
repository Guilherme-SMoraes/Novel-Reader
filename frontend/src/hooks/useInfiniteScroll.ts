import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface UseInfiniteSliceOptions<T> {
  items: T[];
  batchSize?: number;
  initialCount?: number;
  rootMargin?: string;
  resetDeps?: unknown[];
}

export function useInfiniteSlice<T>({
  items,
  batchSize = 20,
  initialCount,
  rootMargin = '300px',
  resetDeps = [],
}: UseInfiniteSliceOptions<T>) {
  const initial = initialCount || batchSize;
  const [visibleCount, setVisibleCount] = useState(initial);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const reset = useCallback(() => {
    setVisibleCount(initial);
  }, [initial]);

  useEffect(() => {
    reset();
  }, [reset, ...resetDeps]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
  }, [batchSize, items.length]);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { rootMargin }
      );

      observerRef.current.observe(node);
    },
    [loadMore, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    visibleCount: Math.min(visibleCount, items.length),
    totalCount: items.length,
    hasMore,
    sentinelRef,
    reset,
  };
}

interface UseInfiniteTriggerOptions {
  onIntersect: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  rootMargin?: string;
}

export function useInfiniteTrigger({
  onIntersect,
  hasMore,
  isLoading = false,
  rootMargin = '200px',
}: UseInfiniteTriggerOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef(onIntersect);
  callbackRef.current = onIntersect;

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || !hasMore || isLoading) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callbackRef.current();
          }
        },
        { rootMargin }
      );

      observerRef.current.observe(node);
    },
    [hasMore, isLoading, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { sentinelRef };
}
