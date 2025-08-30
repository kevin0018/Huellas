// Cliente API para Volunteer Posts (listado + creación).
// Usa el token centralizado en AuthService (igual que el resto del módulo de auth).

import type {
  VolunteerPostListResult,
  VolunteerPost,
  PostCategory,
} from "../domain/types";
import { AuthService } from "../../auth/infra/AuthService";

const API_BASE = import.meta.env.VITE_API_URL || ""; // e.g. http://localhost:3000/api

export interface ListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  authorId?: number;
  includeExpired?: boolean;
  includeArchived?: boolean;
  from?: string;
  to?: string;
}

export class ApiVolunteerPosts {
  private readonly baseUrl: string;

  constructor() {
    // En el backend montamos /api/volunteers/posts
    this.baseUrl = `${API_BASE}/volunteers/posts`;
  }

  private getAuthHeaders(): HeadersInit {
    const token = AuthService.getToken();
    if (!token) throw new Error("Not authenticated: missing token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async list(params: ListParams = {}): Promise<VolunteerPostListResult> {
    const url = new URL(this.baseUrl);
    // Defaults de paginación
    url.searchParams.set("page", String(params.page ?? 1));
    url.searchParams.set("pageSize", String(params.pageSize ?? 12));

    // Filtros opcionales
    if (params.status) url.searchParams.set("status", params.status);
    if (params.category) url.searchParams.set("category", params.category);
    if (typeof params.authorId === "number") {
      url.searchParams.set("authorId", String(params.authorId));
    }
    if (typeof params.includeExpired === "boolean") {
      url.searchParams.set("includeExpired", String(params.includeExpired));
    }
    if (typeof params.includeArchived === "boolean") {
      url.searchParams.set("includeArchived", String(params.includeArchived));
    }
    if (params.from) url.searchParams.set("from", params.from);
    if (params.to) url.searchParams.set("to", params.to);

    const resp = await fetch(url.toString(), {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Failed to fetch posts: ${resp.status} ${text}`);
    }

    const data = (await resp.json()) as VolunteerPostListResult;
    return data;
  }

  async create(payload: {
    title: string;
    content: string;
    category: PostCategory;
    expiresAt?: string | null; // ISO string opcional
  }): Promise<VolunteerPost> {
    const resp = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        title: payload.title,
        content: payload.content,
        category: payload.category,
        // Si llega "", lo mandamos como null
        expiresAt: payload.expiresAt ?? null,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Failed to create post: ${resp.status} ${text}`);
    }

    const created = (await resp.json()) as VolunteerPost;
    return created;
  }

    async delete(id: number): Promise<void> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Not authenticated: missing token");

    const resp = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Failed to delete post: ${resp.status} ${text}`);
    }
  }

}