import { useTranslation } from '../../i18n/hooks/hook';
import { Link } from "react-router-dom";
import { type Pet } from "../../modules/pet/domain/Pet";
import { petTypeTranslationKeys } from "../../features/pets/petPresentation";
import { getPetImageUrl } from "./petImage";

export function PetAvatarGrid({ pets }: { pets: Pet[] }) {
  const { translate } = useTranslation();
  if (!pets.length) return <p className="text-sm text-[var(--color-ink-soft)]">{translate('emptyPetGrid')}</p>;

  return (
    <ul className="care-pet-grid" aria-label={translate('yourPets')}>
      {pets.map((pet) => (
        <li key={pet.id}>
          <Link
            to={`/pets/${pet.id}`}
            aria-label={translate('openPetProfile', { pet: pet.name })}
            className="pet-card-link care-pet-card"
          >
            <span className="care-pet-card__photo" aria-hidden="true" data-placeholder={!pet.profileImageUrl}>
              <img
                src={getPetImageUrl(pet)}
                alt=""
                height="160"
                width="160"
                loading="lazy"
              />
            </span>
            <span className="care-pet-card__copy">
              <span className="care-pet-card__name">{pet.name}</span>
              <span className="care-pet-card__type">{translate(petTypeTranslationKeys[pet.type])}</span>
            </span>
            <svg className="pet-card-arrow care-pet-card__arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}
