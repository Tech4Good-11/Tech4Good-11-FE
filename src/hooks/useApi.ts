import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../apis";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** 재요청 */
  reload: () => void;
}

/**
 * 데이터 페칭 훅 — loading/error/data 상태와 reload 제공.
 * deps 가 바뀌면 자동 재요청. (실제 엔드포인트 전용, mock 폴백 없음)
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetcher 를 deps 로 고정
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    run()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : "오류가 발생했습니다."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [run]);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
