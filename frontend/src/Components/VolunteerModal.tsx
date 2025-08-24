import { useState } from 'react';

interface VolunteerModalProps {
  isOpen: boolean;
  isCurrentlyVolunteer: boolean;
  onConfirm: (description?: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VolunteerModal({ 
  isOpen, 
  isCurrentlyVolunteer, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}: VolunteerModalProps) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCurrentlyVolunteer && !description.trim()) {
      setError('La descripción es obligatoria para ser voluntario');
      return;
    }

    try {
      setError('');
      await onConfirm(isCurrentlyVolunteer ? undefined : description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    }
  };

  const handleCancel = () => {
    setDescription('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    // TODO: Add translations for volunteer modal text
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div 
        className="fixed inset-0" 
        onClick={handleCancel}
      ></div>
      
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-[#fdf2de]">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#51344D] mb-4">
            {isCurrentlyVolunteer 
              ? '¿Dejar de ser voluntario?' 
              : '¡Conviértete en voluntario!'
            }
          </h3>

          <form onSubmit={handleSubmit}>
            {isCurrentlyVolunteer ? (
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  ¿Estás seguro de que quieres dejar de ser voluntario? 
                  Perderás el acceso a las funciones de voluntario.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  ¡Genial! Cuéntanos un poco sobre ti y tu experiencia con animales.
                </p>
                
                <label htmlFor="volunteer-description" className="block text-sm font-medium text-[#51344D] mb-2">
                  Descripción *
                </label>
                <textarea
                  id="volunteer-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D] focus:border-[#51344D] resize-none"
                  rows={4}
                  placeholder="Ej: Tengo 3 años de experiencia cuidando perros y gatos. Me apasiona ayudar a los animales abandonados..."
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comparte tu experiencia, motivación y cualquier habilidad relevante.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCurrentlyVolunteer 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-[#BCAAA4] hover:bg-[#A89B9D]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  isCurrentlyVolunteer ? 'Sí, dejar de ser voluntario' : '¡Quiero ser voluntario!'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
