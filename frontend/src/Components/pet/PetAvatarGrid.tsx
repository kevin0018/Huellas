import { Link } from 'react-router-dom';
import type { Pet } from '../../modules/pet/domain/Pet';

// Función para obtener imagen aleatoria según tipo
function getPetImage(type: string, index: number): string {
  const dogImages = [
    "/pets/dog1.jpg",
    "/pets/dog2.jpg",
    "/pets/dog3.jpg",
    "/pets/dog4.jpg",
    "/pets/dog5.jpg",
    "/pets/dog6.jpg",
    "/pets/dog7.jpg",
    "/pets/dog8.jpg",
    "/pets/dog9.jpg"
  ];
  const catImages = [
    "/pets/cat1.jpg",
    "/pets/cat2.jpg",
    "/pets/cat3.jpg",
    "/pets/cat4.jpg",
    "/pets/cat5.jpg",
    "/pets/cat6.jpg",
    "/pets/cat7.jpg",
    "/pets/cat8.jpg"
  ];
  const ferretImages = [
    "/pets/ferret1.jpg",
    "/pets/ferret2.jpg",
    "/pets/ferret3.jpg"
  ];

  let images: string[] = [];
  if (type === "dog") images = dogImages;
  else if (type === "cat") images = catImages;
  else if (type === "ferret") images = ferretImages;
  else return "/pets/default.svg";

  // Asigna una imagen según el índice, sin repetir hasta agotar el array
  return images[index % images.length];
}

export function PetAvatarGrid({ pets }: { pets: Pet[] }) {
  if (!pets.length) return <p className="opacity-80">Aún no tienes mascotas.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {pets.map((p, i) => (
        <div key={p.id} className="flex flex-col items-center">
          <Link
            to={`/pets/${p.id}`}
            className="avatar-shadow mx-auto transition-transform hover:scale-105"
          >
            <span className="avatar-circle block size-28 md:size-36">
              <img
                src={getPetImage(p.type, i)}
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
