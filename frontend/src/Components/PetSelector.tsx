import type { Pet } from '../modules/pet/domain/Pet.js';
import { getPetTypeLabel } from '../modules/pet/domain/Pet.js';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId?: number;
  onPetSelect: (petId: number) => void;
  loading?: boolean;
  error?: string;
}

function PetSelector({
  pets,
  selectedPetId,
  onPetSelect,
  loading = false,
  error
}: PetSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#51344D] dark:border-[#FDF2DE]"></div>
        <span className="ml-2 text-[#51344D] dark:text-[#FDF2DE]">Cargando mascotas...</span> {/* TODO: Add to translation dictionary */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
        Error: {error} {/* TODO: Add to translation dictionary */}
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-4 text-[#928d8e] dark:text-[#BAA9CB]">
        No tienes mascotas registradas. {/* TODO: Add to translation dictionary */}
        <br />
        <span className="text-sm">Registra una mascota primero para poder crear citas.</span> {/* TODO: Add to translation dictionary */}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#51344D] dark:text-[#FDF2DE] font-caprasimo">
        Selecciona tu mascota: {/* TODO: Add to translation dictionary */}
      </label>
      <select
        value={selectedPetId || ''}
        onChange={(e) => onPetSelect(Number(e.target.value))}
        className="
          w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
          rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D] 
          focus:border-[#51344D] bg-white dark:bg-[#51344D] 
          text-[#51344D] dark:text-[#FDF2DE]
          font-nunito
        "
      >
        <option value="">Selecciona una mascota...</option> {/* TODO: Add to translation dictionary */}
        {pets.map((pet) => (
          <option key={pet.id} value={pet.id}>
            {pet.name} - {getPetTypeLabel(pet.type)} ({pet.race})
          </option>
        ))}
      </select>
    </div>
  );
}

export default PetSelector;
