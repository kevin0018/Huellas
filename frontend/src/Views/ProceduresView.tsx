// src/pages/ProceduresView.tsx

import { useState } from 'react';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import GoBackButton from '../Components/GoBackButton.js';
import ProcedureCard from '../Components/ProcedureCard';
import ProcedureModal from '../Components/ProceduresModal';

const proceduresData = [
    { key: 'innerdes', timeframe: '0-2 semanas', nombre: 'Desparasitación Interna', descripcion: 'Tratamiento para eliminar parásitos intestinales.' },
    { key: 'extdes', timeframe: '2-6 semanas', nombre: 'Desparasitación Externa', descripcion: 'Aplicación de pipeta o collar.' },
    { key: 'multivac1', timeframe: '6-8 semanas', nombre: 'Vacuna Polivalente (1ª dosis)', descripcion: 'Primera dosis contra moquillo, parvovirus, etc.' },
    { key: 'kennelvac', timeframe: '8-10 semanas', nombre: 'Vacuna Tos de las Perreras', descripcion: 'Protege contra la traqueobronquitis.' },
    { key: 'multivac2', timeframe: '10 semanas', nombre: 'Vacuna Polivalente (2ª dosis)', descripcion: 'Segundo refuerzo de la vacuna.' },
    { key: 'rabidvac', timeframe: '12 semanas', nombre: 'Vacuna Antirrábica', descripcion: 'Vacunación esencial contra la rabia.' },
    { key: 'multivac3', timeframe: '16 semanas', nombre: 'Vacuna Polivalente (3ª dosis)', descripcion: 'Último refuerzo del ciclo inicial.' },
];

type ProcedureDataState = { isCompleted: boolean; notes: string; date: string; };
type AllProceduresState = { [key: string]: ProcedureDataState };

function ProceduresView() {
  // 1. Este es el estado principal que las tarjetas leen.
  const [proceduresState, setProceduresState] = useState<AllProceduresState>(() => {
    const initialState: AllProceduresState = {};
    proceduresData.forEach(proc => {
      initialState[proc.key] = { isCompleted: false, notes: '', date: '' };
    });
    return initialState;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<typeof proceduresData[0] | null>(null);

  const handleOpenEditModal = (procedure: typeof proceduresData[0]) => {
    setEditingProcedure(procedure);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcedure(null);
  };

  const handleSaveChanges = (key: string, updatedData: ProcedureDataState) => {
    setProceduresState(prevState => ({
      ...prevState,
      [key]: updatedData,
    }));
    handleCloseModal();
    alert(`Cambios guardados para "${proceduresData.find(p => p.key === key)?.nombre}"`);
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#FDF2DE] dark:bg-[#51344D] relative">
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60" aria-hidden="true" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-full text-left mt-2 max-w-6xl xl:max-w-7xl">
              <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-caprasimo mb-4 text-[#51344D] dark:text-[#FDF2DE]">
              Plan de Procedimientos
            </h1>
            <p className="text-lg text-[#928d8e] dark:text-[#BAA9CB] mb-6">
              Consulta y actualiza el estado de los procedimientos de salud de tus mascotas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proceduresData.map((procedure) => (
              // 3. Cada tarjeta recibe el estado actualizado en cada renderizado.
              <ProcedureCard
                key={procedure.key}
                procedure={procedure}
                procedureState={proceduresState[procedure.key]}
                onEdit={() => handleOpenEditModal(procedure)}
              />
            ))}
          </div>
        </div>

        {isModalOpen && editingProcedure && (
            <ProcedureModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                // 4. Se pasa la función de guardado al modal.
                onSubmit={handleSaveChanges}
                procedure={editingProcedure}
                initialState={proceduresState[editingProcedure.key]}
            />
        )}
      </div>
      <Footer />
    </>
  );
}

export default ProceduresView;