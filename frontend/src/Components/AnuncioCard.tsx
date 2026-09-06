import type { FC, ReactNode } from "react";
import { postCategoryTranslationKeys } from "../features/volunteering/postPresentation";
import { useTranslation } from "../i18n/hooks/hook";
import type { PostCategory } from "../modules/posts/domain/types";

// Icono por categoría (igual que antes)
function categoryIcon(category: PostCategory): ReactNode {
  switch (category) {
    case "WALKING_EXERCISE":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h4l3-8 2 6h5M5 12l-2 7h4l2-7M9 12l2 7h4l-1-4" />
        </svg>
      );
    case "PET_SITTING":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5M9 21v-6h6v6" />
        </svg>
      );
    case "VET_TRANSPORT":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h3l2-3h6l2 3h3M7 16v2m10-2v2M12 3v3m0 0h3m-3 0H9" />
        </svg>
      );
    case "FOSTER_CARE":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-7 9 7M5 10.5V21h14V10.5M12 13l2 2-2 2-2-2 2-2z" />
        </svg>
      );
    case "TRAINING_BEHAVIOR":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M8 20l2-6h4l2 6M10 10h4M12 4v6" />
        </svg>
      );
    case "SHELTER_SUPPORT":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 6v9a3 3 0 01-3 3H6a3 3 0 01-3-3V9l9-6z" />
        </svg>
      );
    case "GROOMING_HYGIENE":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h10M8 14h8M9 18h6M12 3v3M6 6h12" />
        </svg>
      );
    case "MEDICAL_SUPPORT":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8M4 12a8 8 0 1016 0A8 8 0 004 12z" />
        </svg>
      );
    case "ADOPTION_REHOMING":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 11c-2 0-3.5 1.5-3.5 3.5S6 18 8 18s3.5-1.5 3.5-3.5S10 11 8 11zm8 0c-2 0-3.5 1.5-3.5 3.5S14 18 16 18s3.5-1.5 3.5-3.5S18 11 16 11z" />
        </svg>
      );
    case "LOST_AND_FOUND":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 016 6c0 4.5-6 12-6 12S6 13.5 6 9a6 6 0 016-6z" />
          <circle cx="12" cy="9" r="2" />
        </svg>
      );
    case "GENERAL":
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ui-text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
  }
}

export interface AnuncioCardProps {
  title: string;
  author: string;
  description: string;
  category: PostCategory;
  /** Botón de chat (opcional). Si no se pasa, no se muestra */
  onOpenChat?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

const AnuncioCard: FC<AnuncioCardProps> = ({
  title,
  author,
  description,
  category,
  onOpenChat,
  onDelete,
}) => {
  const { translate } = useTranslation();

  return (
    <article className="post-card">
      <div className="post-card__category">
        <span className="post-card__category-icon" aria-hidden="true">
          {categoryIcon(category)}
        </span>
        <span>{translate(postCategoryTranslationKeys[category])}</span>
      </div>

      <header>
        <h2 className="post-card__title">{title}</h2>
        <p className="post-card__author">{translate('publishedBy', { author })}</p>
      </header>

      <p className="post-card__description">{description}</p>

      {(onOpenChat || onDelete) && (
        <footer className="post-card__actions">
          {onOpenChat ? (
            <button
              type="button"
              onClick={onOpenChat}
              className="ui-action ui-action--primary gap-2 px-3 py-2"
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.6"
                className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 8h10M7 12h6M21 12a9 9 0 10-3.1 6.8L21 21l-1.2-3.4A8.97 8.97 0 0021 12z" />
              </svg>
              {translate('contactAction')}
            </button>
          ) : <span />}

          {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ui-action ui-action--secondary gap-2 px-3 py-2"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-9 4h12m-1 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7m3 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
            </svg>
            {translate('delete')}
          </button>
          )}
        </footer>
      )}
    </article>
  );
};

export default AnuncioCard;
