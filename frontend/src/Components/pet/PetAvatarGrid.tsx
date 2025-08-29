import { Link } from 'react-router-dom';
import type { Pet } from '../../modules/pet/domain/Pet';

export function PetAvatarGrid({ pets }: { pets: Pet[] }) {
  if (!pets.length) return <p className="opacity-80">Aún no tienes mascotas.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {pets.map((p) => (
        <div key={p.id} className="flex flex-col items-center">
          <Link
            to={`/pets/${p.id}`}
            className="avatar-shadow mx-auto transition-transform hover:scale-105"
          >
            <span className="avatar-circle block size-28 md:size-36">
              <img
                src="/media/pfp_sample.svg"
                alt={p.name}
                className="size-full object-contain"
              />
            </span>
          </Link>
          <p className="mt-2 font-semibold">{p.name}</p>
        </div>
      ))}
    </div>
  );
}
