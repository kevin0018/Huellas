import type { RefObject } from 'react';
import type { Pet } from '../modules/pet/domain/Pet.js';
import { getPetTypeLabel } from '../modules/pet/domain/Pet.js';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId?: number;
  onPetSelect: (petId: number) => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  inputRef?: RefObject<HTMLSelectElement | null>;
}

function PetSelector({
  pets,
  selectedPetId,
  onPetSelect,
  loading = false,
  error,
  disabled = false,
  required = false,
  inputRef,
}: PetSelectorProps) {
  if (loading) {
    return <div aria-live="polite" className="form-help">Cargando mascotas…</div>;
  }

  if (pets.length === 0) {
    return (
      <div className="form-alert" role="status">
        No tienes mascotas registradas. Registra una mascota primero para poder crear citas.
      </div>
    );
  }

  return (
    <div className="form-field">
      <label className="form-label" htmlFor="appointment-pet">Mascota</label>
      <select
        aria-describedby={error ? 'appointment-pet-error' : undefined}
        aria-invalid={Boolean(error) || undefined}
        className="form-control"
        disabled={disabled}
        id="appointment-pet"
        onChange={(event) => onPetSelect(Number(event.target.value))}
        ref={inputRef}
        required={required}
        value={selectedPetId || ''}
      >
        <option value="">Selecciona una mascota...</option>
        {pets.map((pet) => (
          <option key={pet.id} value={pet.id}>
            {pet.name} · {getPetTypeLabel(pet.type)}{pet.race ? ` · ${pet.race}` : ''}
          </option>
        ))}
      </select>
      {disabled && <span className="form-help">La mascota no puede cambiarse al editar una cita.</span>}
      {error && <span className="form-error" id="appointment-pet-error">{error}</span>}
    </div>
  );
}

export default PetSelector;
