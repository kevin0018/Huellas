import { useTranslation } from '../../i18n/hooks/hook';
import { Link } from "react-router-dom";
import { type Pet } from "../../modules/pet/domain/Pet";
import { petTypeTranslationKeys } from "../../features/pets/petPresentation";
import { getPetImageUrl } from "./petImage";

export function PetAvatarGrid({ pets }: { pets: Pet[] }) {
  const { translate } = useTranslation();
  if (!pets.length) return <p className="text-sm text-[var(--color-ink-soft)]">{translate('emptyPetGrid')}</p>;

  return (
    <ul className="pet-grid grid gap-3" aria-label={translate('yourPets')}>
      {pets.map((pet) => (
        <li key={pet.id}>
          <Link
            to={`/pets/${pet.id}`}
            aria-label={translate('openPetProfile', { pet: pet.name })}
            className="pet-card-link grid min-h-20 grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-ink)] shadow-[var(--shadow-card)] no-underline"
          >
            <span className="size-16 overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-paper-2)]" aria-hidden="true">
              <img
                src={getPetImageUrl(pet)}
                alt=""
                className="size-full object-cover"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold text-[var(--color-ink)]">{pet.name}</span>
              <span className="mt-1 block text-sm text-[var(--color-ink-soft)]">{translate(petTypeTranslationKeys[pet.type])}</span>
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
