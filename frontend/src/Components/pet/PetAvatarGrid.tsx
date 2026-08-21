import { Link } from "react-router-dom";
import { getPetTypeLabel, type Pet } from "../../modules/pet/domain/Pet";

function getPetImage(type: string, index: number): string {
  const imagesByType: Record<string, string[]> = {
    dog: [
      "/pets/dog1.jpg", "/pets/dog2.jpg", "/pets/dog3.jpg", "/pets/dog4.jpg", "/pets/dog5.jpg",
      "/pets/dog6.jpg", "/pets/dog7.jpg", "/pets/dog8.jpg", "/pets/dog9.jpg",
    ],
    cat: [
      "/pets/cat1.jpg", "/pets/cat2.jpg", "/pets/cat3.jpg", "/pets/cat4.jpg",
      "/pets/cat5.jpg", "/pets/cat6.jpg", "/pets/cat7.jpg", "/pets/cat8.jpg",
    ],
    ferret: ["/pets/ferret1.jpg", "/pets/ferret2.jpg", "/pets/ferret3.jpg"],
  };
  const images = imagesByType[type];

  return images?.[index % images.length] ?? "/pets/default.svg";
}

export function PetAvatarGrid({ pets }: { pets: Pet[] }) {
  if (!pets.length) return <p className="text-sm text-[var(--color-ink-soft)]">Aún no tienes mascotas.</p>;

  return (
    <ul className="pet-grid grid gap-3" aria-label="Tus mascotas">
      {pets.map((pet, index) => (
        <li key={pet.id}>
          <Link
            to={`/pets/${pet.id}`}
            aria-label={`Abrir el perfil de ${pet.name}`}
            className="pet-card-link grid min-h-20 grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-surface-raised)] p-2 no-underline"
          >
            <span className="size-16 overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-paper-2)]" aria-hidden="true">
              <img
                src={getPetImage(pet.type, index)}
                alt=""
                className="size-full object-cover"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold text-[var(--color-ink)]">{pet.name}</span>
              <span className="mt-1 block text-sm text-[var(--color-ink-soft)]">{getPetTypeLabel(pet.type)}</span>
            </span>
            <svg className="pet-card-arrow size-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}
