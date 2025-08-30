import type { FC, ReactNode } from "react";
import type { PostCategory } from "../modules/posts/domain/types";

// Icono por categoría (igual que antes)
function categoryIcon(category: PostCategory): ReactNode {
  switch (category) {
    case "WALKING_EXERCISE":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h4l3-8 2 6h5M5 12l-2 7h4l2-7M9 12l2 7h4l-1-4" />
        </svg>
      );
    case "PET_SITTING":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5M9 21v-6h6v6" />
        </svg>
      );
    case "VET_TRANSPORT":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h3l2-3h6l2 3h3M7 16v2m10-2v2M12 3v3m0 0h3m-3 0H9" />
        </svg>
      );
    case "FOSTER_CARE":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-7 9 7M5 10.5V21h14V10.5M12 13l2 2-2 2-2-2 2-2z" />
        </svg>
      );
    case "TRAINING_BEHAVIOR":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M8 20l2-6h4l2 6M10 10h4M12 4v6" />
        </svg>
      );
    case "SHELTER_SUPPORT":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 6v9a3 3 0 01-3 3H6a3 3 0 01-3-3V9l9-6z" />
        </svg>
      );
    case "GROOMING_HYGIENE":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h10M8 14h8M9 18h6M12 3v3M6 6h12" />
        </svg>
      );
    case "MEDICAL_SUPPORT":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8M4 12a8 8 0 1016 0A8 8 0 004 12z" />
        </svg>
      );
    case "ADOPTION_REHOMING":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 11c-2 0-3.5 1.5-3.5 3.5S6 18 8 18s3.5-1.5 3.5-3.5S10 11 8 11zm8 0c-2 0-3.5 1.5-3.5 3.5S14 18 16 18s3.5-1.5 3.5-3.5S18 11 16 11z" />
        </svg>
      );
    case "LOST_AND_FOUND":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a6 6 0 016 6c0 4.5-6 12-6 12S6 13.5 6 9a6 6 0 016-6z" />
          <circle cx="12" cy="9" r="2" />
        </svg>
      );
    case "GENERAL":
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#51344D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
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
}

const AnuncioCard: FC<AnuncioCardProps> = ({
  title,
  author,
  description,
  category,
  onOpenChat,
}) => {
  return (
    <div className="bg-[#FDF2DE] border-2 border-[#BCAAA4] rounded-2xl p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl ">
      {/* Cabecera con icono y título */}
      <div className="flex items-center gap-3 bg-[#BCAAA4] p-2 rounded-lg">
        <div className="bg-white rounded-full p-1 flex items-center justify-center w-10 h-10">
          {categoryIcon(category)}
        </div>
        <h3 className="text-white text-lg">{title}</h3>
      </div>

      {/* Línea de autor + botón de chat (a la derecha) */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-left font-semibold text-[#51344D] truncate">{author}</p>

        {onOpenChat && (
          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex items-center justify-center rounded-lg border border-[#BCAAA4] bg-white p-2 hover:bg-[#FDF2DE] transition"
            aria-label="Abrir chat"
            title="Abrir chat"
          >
            {/* Burbuja de chat (solo icono para que quepa en la misma línea) */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.6"
              className="w-5 h-5 text-[#51344D]">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 8h10M7 12h6M21 12a9 9 0 10-3.1 6.8L21 21l-1.2-3.4A8.97 8.97 0 0021 12z" />
            </svg>
            <span className="sr-only">Abrir chat</span>
          </button>
        )}
      </div>

      {/* Descripción */}
      <div className="mt-2 p-3 w-full h-40 bg-white border border-gray-300 rounded-lg overflow-y-auto">
        <p className="text-gray-600 text-left">{description}</p>
      </div>
    </div>
  );
};

export default AnuncioCard;
