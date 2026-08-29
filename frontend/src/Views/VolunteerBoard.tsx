import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import AnuncioCard from "../Components/AnuncioCard";

import { useVolunteerPosts } from "../modules/posts/application/useVolunteerPosts";
import type { PostCategory, VolunteerPostListItem } from "../modules/posts/domain/types";

import { AuthService } from "../modules/auth/infra/AuthService";
import { useChat } from "../modules/chat/application/useChat";
import { postActions } from '../features/volunteering/postActions';
import { AsyncContent } from '../shared/ui/AsyncContent';

const CATEGORY_LABEL: Record<PostCategory, string> = {
  GENERAL: "General",
  PET_SITTING: "Cuidado en casa",
  WALKING_EXERCISE: "Paseos y ejercicio",
  VET_TRANSPORT: "Transporte a veterinario",
  FOSTER_CARE: "Casa de acogida",
  TRAINING_BEHAVIOR: "Adiestramiento y conducta",
  SHELTER_SUPPORT: "Apoyo a protectoras",
  GROOMING_HYGIENE: "Higiene y peluquería",
  MEDICAL_SUPPORT: "Soporte médico",
  ADOPTION_REHOMING: "Adopción / Reubicación",
  LOST_AND_FOUND: "Mascotas perdidas",
};

const CATEGORY_OPTIONS: { value: PostCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "GENERAL", label: CATEGORY_LABEL.GENERAL },
  { value: "PET_SITTING", label: CATEGORY_LABEL.PET_SITTING },
  { value: "WALKING_EXERCISE", label: CATEGORY_LABEL.WALKING_EXERCISE },
  { value: "VET_TRANSPORT", label: CATEGORY_LABEL.VET_TRANSPORT },
  { value: "FOSTER_CARE", label: CATEGORY_LABEL.FOSTER_CARE },
  { value: "TRAINING_BEHAVIOR", label: CATEGORY_LABEL.TRAINING_BEHAVIOR },
  { value: "SHELTER_SUPPORT", label: CATEGORY_LABEL.SHELTER_SUPPORT },
  { value: "GROOMING_HYGIENE", label: CATEGORY_LABEL.GROOMING_HYGIENE },
  { value: "MEDICAL_SUPPORT", label: CATEGORY_LABEL.MEDICAL_SUPPORT },
  { value: "ADOPTION_REHOMING", label: CATEGORY_LABEL.ADOPTION_REHOMING },
  { value: "LOST_AND_FOUND", label: CATEGORY_LABEL.LOST_AND_FOUND },
];

function excerpt(text: string, max = 240): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function VolunteerBoard() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => AuthService.getUser(), []);
  const currentUserId = currentUser?.id ?? null;

  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "ALL">("ALL");
  const [myOnly, setMyOnly] = useState<boolean>(false); // ⬅️ NUEVO

  // Chat functionality
  const { createConversation, conversations } = useChat();

  const {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    goToPage,
    reload,
  } = useVolunteerPosts({
    pageSize: 12,
    category: selectedCategory === "ALL" ? undefined : (selectedCategory as PostCategory),
    authorId: myOnly && currentUserId ? currentUserId : undefined, // ⬅️ NUEVO
  });

  async function handleDelete(postId: number) {
    const ok = window.confirm("¿Seguro que quieres eliminar este anuncio?");
    if (!ok) return;
    try {
      await postActions.remove(postId);
      await reload();
    } catch (err: unknown) {
      console.error("[VolunteerBoard] delete error:", err);
      alert((err as Error)?.message || "No se pudo eliminar el anuncio");
    }
  }

  async function handleOpenChat(postId: number, authorId: number, postTitle: string) {
    if (!currentUserId) {
      alert("Debes iniciar sesión para enviar mensajes");
      return;
    }

    if (currentUserId === authorId) {
      alert("No puedes enviarte mensajes a ti mismo");
      return;
    }

    try {
      // Check if conversation already exists for this specific post
      
      const existingConversation = conversations?.find(conv =>
        conv?.participants?.some(p => p?.id === authorId) &&
        conv?.participants?.some(p => p?.id === currentUserId) &&
        conv?.title?.includes(`Consulta sobre: ${postTitle}`)
      );

      if (existingConversation) {
        // Conversation exists for this post, go directly to chat
        navigate(`/chat?postId=${postId}&with=${authorId}&conversationId=${existingConversation.id}`);
      } else {
        // Create new conversation specific to this post
        
        const newConversation = await createConversation(
          `Consulta sobre: ${postTitle}`,
          [currentUserId, authorId]
        );
        
        // Navigate with the specific conversation ID
        navigate(`/chat?postId=${postId}&with=${authorId}&conversationId=${newConversation?.id || ''}`);
      }
    } catch (error) {
      console.error("Error handling chat:", error);
      alert("Error al iniciar conversación. Inténtalo de nuevo.");
    }
  }

  return (
    <>
      <NavBar />
      <main className="workspace-page">
        <div className="workspace-shell">
          <header className="workspace-header workspace-header--primary">
            <div className="workspace-header__copy">
              <h1 className="workspace-header__title">Tablón de ayuda</h1>
              <p className="workspace-header__description">
                Encuentra personas de la comunidad disponibles para echar una mano en Barcelona.
              </p>
            </div>
            <div className="workspace-header__actions">
              <button
                type="button"
                className="ui-action ui-action--primary px-4 py-3"
                onClick={() => navigate('/volunteer-home')}
              >
                Publicar anuncio
              </button>
            </div>
          </header>

          <section aria-label="Anuncios de voluntariado">
            <div className="board-toolbar">
              <div className="workspace-field">
                <label htmlFor="category" className="workspace-field__label">Categoría</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as PostCategory | "ALL")}
                  className="ui-control"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="board-toolbar__toggle">
                <input
                  type="checkbox"
                  className="board-toolbar__checkbox rounded border-[var(--color-rule-strong)] text-[var(--color-accent)] focus:ring-[var(--color-focus)]"
                  checked={myOnly}
                  onChange={(e) => setMyOnly(e.target.checked)}
                  disabled={!currentUserId}
                />
                <span className={`text-sm ${currentUserId ? "text-[var(--color-ink)]" : "ui-text-muted"}`}>
                  Mis anuncios
                </span>
              </label>
              <p className="board-toolbar__count" aria-live="polite">
                {total} {total === 1 ? 'anuncio' : 'anuncios'}
              </p>
            </div>

            <AsyncContent
              loading={loading}
              error={error}
              empty={items.length === 0}
              loadingLabel="Cargando anuncios…"
              emptyTitle={myOnly ? "Aún no tienes anuncios publicados" : "No hay anuncios disponibles"}
              emptyDescription={myOnly
                ? "Publica un anuncio para que aparezca en esta sección."
                : "Prueba con otra categoría o vuelve más tarde."}
              onRetry={reload}
            >
              <>
                <div className="board-grid">
                  {items.map((post: VolunteerPostListItem) => {
                    const authorName = `${post.author.name} ${post.author.last_name}`.trim();
                    const isAuthor = currentUserId === post.author.id;

                    return (
                      <AnuncioCard
                        key={post.id}
                        title={post.title}
                        author={authorName}
                        description={excerpt(post.content)}
                        category={post.category}
                        onOpenChat={() => handleOpenChat(post.id, post.author.id, post.title)}
                        onDelete={isAuthor ? () => handleDelete(post.id) : undefined}
                      />
                    );
                  })}
                </div>

                {total > pageSize && (
                  <nav className="board-pagination" aria-label="Paginación de anuncios">
                    <button
                      className="ui-action ui-action--secondary px-4 py-2"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      ← Anterior
                    </button>
                    <span className="board-pagination__status">
                      Página {page} de {Math.ceil(total / pageSize)}
                    </span>
                    <button
                      className="ui-action ui-action--secondary px-4 py-2"
                      disabled={page >= Math.ceil(total / pageSize)}
                      onClick={() => goToPage(page + 1)}
                    >
                      Siguiente →
                    </button>
                  </nav>
                )}
              </>
            </AsyncContent>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VolunteerBoard;
