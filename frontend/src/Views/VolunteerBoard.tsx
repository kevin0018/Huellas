import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";
import AnuncioCard from "../Components/AnuncioCard";

import { useVolunteerPosts } from "../modules/posts/application/useVolunteerPosts";
import type { PostCategory, VolunteerPostListItem } from "../modules/posts/domain/types";

import { AuthService } from "../modules/auth/infra/AuthService";
import { DeleteVolunteerPostCommand } from "../modules/posts/application/commands/DeleteVolunteerPostCommand";
import { DeleteVolunteerPostCommandHandler } from "../modules/posts/application/commands/DeleteVolunteerPostCommandHandler";
import { useChat } from "../modules/chat/application/useChat";

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
      const cmd = new DeleteVolunteerPostCommand(postId);
      const handler = new DeleteVolunteerPostCommandHandler();
      await handler.execute(cmd);
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
      // Check if conversation already exists
      const existingConversation = conversations?.find(conv =>
        conv?.participants?.some(p => p?.id === authorId) &&
        conv?.participants?.some(p => p?.id === currentUserId)
      );

      if (existingConversation) {
        // Conversation exists, go directly to chat
        console.log('✅ Found existing conversation, navigating to chat');
        navigate(`/chat?postId=${postId}&with=${authorId}`);
      } else {
        // Create new conversation first
        console.log('🔄 Creating new conversation for post:', postTitle);
        await createConversation(
          `Consulta sobre: ${postTitle}`,
          [currentUserId, authorId]
        );
        
        // Then navigate to chat
        navigate(`/chat?postId=${postId}&with=${authorId}`);
      }
    } catch (error) {
      console.error("❌ Error handling chat:", error);
      alert("Error al iniciar conversación. Inténtalo de nuevo.");
    }
  }

  return (
    <>
      <NavBar />
      <div
        className="flex flex-col items-center justify-center background-primary px-4 py-8"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        <div
          className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] opacity-60 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-6xl">
          <div className="w-full text-left mx-auto mt-8">
            <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
          </div>

          <h1 className="h1 font-caprasimo mb-2 text-5xl text-[#51344D] drop-shadow-lg text-center">
            Tablón de anuncios
          </h1>
          <p className="text-center text-lg text-[#51344D]/80 mb-6">
            Aquí puedes buscar entre los voluntarios más cercanos a ti en Barcelona.
          </p>

          {/* Filtros compactos: categoría + “Mis anuncios” */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-full sm:w-auto max-w-sm relative">
              <label htmlFor="category" className="sr-only">Filtrar por categoría</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as PostCategory | "ALL")}
                className="block w-full appearance-none rounded-md border border-[#BCAAA4] bg-white py-2 pl-3 pr-10 text-[#51344D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D]"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-[#51344D]/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 011.08 1.04l-4.24 4.53a.75.75 0 01-1.08 0l-4.24-4.53a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#BCAAA4] text-[#51344D] focus:ring-[#51344D]"
                checked={myOnly}
                onChange={(e) => setMyOnly(e.target.checked)}
                disabled={!currentUserId}
              />
              <span className={`text-sm ${currentUserId ? "text-[#51344D]" : "text-[#51344D]/50"}`}>
                Mis anuncios
              </span>
            </label>
          </div>

          {loading && <div className="text-center text-[#51344D] mb-6">Cargando anuncios…</div>}
          {error && <div className="text-center text-red-600 mb-6">Error: {error}</div>}

          {/* Mensaje vacío cuando filtro “Mis anuncios” */}
          {!loading && !error && items.length === 0 && myOnly && (
            <div className="text-center text-[#51344D]/80 mb-8">
              Aún no tienes anuncios publicados.
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading && !error && items.map((post: VolunteerPostListItem) => {
              const authorName = `${post.author.name} ${post.author.last_name}`.trim();
              const isAuthor = currentUserId === post.author.id;

              return (
                <div key={post.id} className="flex flex-col">
                  <AnuncioCard
                    title={post.title}
                    author={authorName}
                    description={excerpt(post.content)}
                    category={post.category}
                    onOpenChat={() => handleOpenChat(post.id, post.author.id, post.title)}
                  />

                  {isAuthor && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#BCAAA4] bg-white px-3 py-2 hover:bg-[#FDF2DE] transition"
                        title="Eliminar anuncio"
                        aria-label="Eliminar anuncio"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-9 4h12m-1 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7m3 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                        </svg>
                        <span className="text-[#51344D]">Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {!loading && !error && total > pageSize && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                className="px-4 py-2 rounded-md border border-[#BCAAA4] bg-white hover:bg-[#FDF2DE] disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                ← Anterior
              </button>
              <span className="text-[#51344D]">
                Página {page} de {Math.ceil(total / pageSize)}
              </span>
              <button
                className="px-4 py-2 rounded-md border border-[#BCAAA4] bg-white hover:bg-[#FDF2DE] disabled:opacity-50"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => goToPage(page + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VolunteerBoard;
