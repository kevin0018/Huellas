import { useEffect, useMemo, useState } from "react";
import type {
  VolunteerPostListItem,
  VolunteerPostListResult,
  PostCategory,
} from "../domain/types";
import { ApiVolunteerPosts, type ListParams } from "../infra/ApiVolunteerPosts";

export interface UseVolunteerPostsOptions {
  pageSize?: number;
  category?: PostCategory;
  authorId?: number; // ⬅️ NUEVO
}

export function useVolunteerPosts(options: UseVolunteerPostsOptions = {}) {
  const [items, setItems] = useState<VolunteerPostListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = options.pageSize ?? 12;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const api = useMemo(() => new ApiVolunteerPosts(), []);

  async function fetchPage(targetPage: number) {
    try {
      setLoading(true);
      setError(null);

      const params: ListParams = {
        page: targetPage,
        pageSize,
      };

      if (options.category) params.category = options.category;
      if (typeof options.authorId === "number") params.authorId = options.authorId;

      const result: VolunteerPostListResult = await api.list(params);
      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
    } catch (err: any) {
      console.error("[useVolunteerPosts] Error:", err);
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, options.category, options.authorId]);

  return {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    reload: () => fetchPage(page),
    goToPage: (p: number) => fetchPage(p),
  };
}
