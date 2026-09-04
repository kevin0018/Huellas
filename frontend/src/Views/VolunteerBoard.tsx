import { messageFromError, translateMessage } from '../i18n/message';
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
import { postCategories, postCategoryTranslationKeys } from '../features/volunteering/postPresentation';
import { useTranslation } from '../i18n/hooks/hook';
import { AsyncContent } from '../shared/ui/AsyncContent';

function excerpt(text: string, max = 240): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function VolunteerBoard() {
  const navigate = useNavigate();
  const { translate } = useTranslation();

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
    const ok = window.confirm(translate('confirmDeletePost'));
    if (!ok) return;
    try {
      await postActions.remove(postId);
      await reload();
    } catch (err: unknown) {
      console.error("[VolunteerBoard] delete error:", err);
      alert(translateMessage(messageFromError(err, 'deletePostError'), translate));
    }
  }

  async function handleOpenChat(postId: number, authorId: number, postTitle: string) {
    if (!currentUserId) {
      alert(translate('loginToMessage'));
      return;
    }

    if (currentUserId === authorId) {
      alert(translate('cannotMessageSelf'));
      return;
    }

    try {
      // Check if conversation already exists for this specific post
      
      const existingConversation = conversations?.find(conv =>
        conv?.participants?.some(p => p?.id === authorId) &&
        conv?.participants?.some(p => p?.id === currentUserId) &&
        conv?.title?.includes(postTitle)
      );

      if (existingConversation) {
        // Conversation exists for this post, go directly to chat
        navigate(`/chat?postId=${postId}&with=${authorId}&conversationId=${existingConversation.id}`);
      } else {
        // Create new conversation specific to this post
        
        const newConversation = await createConversation(
          translate('postConversationTitle', { title: postTitle }),
          [currentUserId, authorId]
        );
        
        // Navigate with the specific conversation ID
        navigate(`/chat?postId=${postId}&with=${authorId}&conversationId=${newConversation?.id || ''}`);
      }
    } catch (error) {
      console.error("Error handling chat:", error);
      alert(translate('chatStartError'));
    }
  }

  return (
    <>
      <NavBar />
      <main className="workspace-page">
        <div className="workspace-shell">
          <header className="workspace-header workspace-header--primary">
            <div className="workspace-header__copy">
              <h1 className="workspace-header__title">{translate('volunteerBoardTitle')}</h1>
              <p className="workspace-header__description">
                {translate('volunteerBoardDescription')}
              </p>
            </div>
            <div className="workspace-header__actions">
              <button
                type="button"
                className="ui-action ui-action--primary px-4 py-3"
                onClick={() => navigate('/volunteer-home')}
              >
                {translate('publishPost')}
              </button>
            </div>
          </header>

          <section aria-label={translate('volunteerPostsRegionLabel')}>
            <div className="board-toolbar">
              <div className="workspace-field">
                <label htmlFor="category" className="workspace-field__label">{translate('category')}</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as PostCategory | "ALL")}
                  className="ui-control"
                >
                  <option value="ALL">{translate('allCategories')}</option>
                  {postCategories.map((category) => (
                    <option key={category} value={category}>
                      {translate(postCategoryTranslationKeys[category])}
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
                  {translate('myPosts')}
                </span>
              </label>
              <p className="board-toolbar__count" aria-live="polite">
                {translate(total === 1 ? 'postCountOne' : 'postCountMany', { count: total })}
              </p>
            </div>

            <AsyncContent
              loading={loading}
              error={error}
              empty={items.length === 0}
              loadingLabel={translate('loadingPosts')}
              emptyTitle={translate(myOnly ? 'noOwnPosts' : 'noPosts')}
              emptyDescription={myOnly
                ? translate('noOwnPostsDescription')
                : translate('noPostsDescription')}
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
                  <nav className="board-pagination" aria-label={translate('paginationLabel')}>
                    <button
                      className="ui-action ui-action--secondary px-4 py-2"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      ← {translate('previous')}
                    </button>
                    <span className="board-pagination__status">
                      {translate('pageOf', { page, pages: Math.ceil(total / pageSize) })}
                    </span>
                    <button
                      className="ui-action ui-action--secondary px-4 py-2"
                      disabled={page >= Math.ceil(total / pageSize)}
                      onClick={() => goToPage(page + 1)}
                    >
                      {translate('next')} →
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
