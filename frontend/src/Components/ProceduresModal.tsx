import React, { useState } from 'react';
import type { PetProcedureData } from '../Views/ProceduresView';

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModalSubmit: (status: string, procedureId: number, checkupId?: number, checkupDate?: string, checkupNotes?: string) => void;
  procedure: PetProcedureData;
}

const statusOptions = ['DONE', 'UPCOMING', 'MISSING'];

const ProcedureModal: React.FC<ProcedureModalProps> = ({ isOpen, onClose, onModalSubmit, procedure }) => {

  const [status, setStatus] = useState(procedure.status);
  const [date, setDate] = useState(procedure.checkupDate);
  const [notes, setNotes] = useState(procedure.checkupNotes);

  // No renderiza nada si el modal no está abierto
  if (!isOpen) return null;

  const handleEditCheckupDate = (newDate: string) => {
    setDate(newDate);
  }

  const handleEditCheckupNotes = (newNotes: string) => {
    setNotes(newNotes);
  }

  const handleStatusChange = (newStatus: PetProcedureData['status']) => {
    setStatus(newStatus);
  }

  const handleSubmit = () => {
    // Llama a la función onSubmit del componente padre con los datos actualizados
    onModalSubmit(status, procedure.id, procedure.checkupId, date, notes);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl text-gray-800">{procedure.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <main className="p-6">
          <p className="mb-4 text-gray-700">{procedure.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de realización</label>
              <input
                type="date"
                className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                value={date ? new Date(date).toISOString().split('T')[0] : ''}
                onChange={(e) => handleEditCheckupDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as PetProcedureData['status'])}
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea rows={3} className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md p-2" placeholder="Añadir notas..." value={notes} onChange={(e) => handleEditCheckupNotes(e.target.value)}></textarea>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t">
            <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="bg-[#51344D] hover:bg-[#A89B9D] transition text-white font-bold py-2 px-4 rounded-lg">
              Guardar Cambios
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProcedureModal;