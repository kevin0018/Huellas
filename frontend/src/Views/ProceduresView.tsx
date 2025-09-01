// src/pages/ProceduresView.tsx
import { useEffect, useState } from 'react';
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import GoBackButton from '../Components/GoBackButton.js';
import ProcedureCard from '../Components/ProcedureCard';
import ProcedureModal from '../Components/ProceduresModal';
import { ApiPetRepository } from '../modules/pet/infra/ApiPetRepository.js';
import { useParams } from 'react-router-dom';
import { ApiCheckupRepository } from '../modules/checkup/infra/ApiCheckupRepository.js';

export type PetProcedureData = {
  id: number;
  petType: 'cat' | 'dog' | 'ferret';
  name: string;
  age: number;
  description: string | null;
  status: 'DONE' | 'MISSING' | 'UPCOMING';
  checkupId?: number;
  checkupDate?: string;
  checkupNotes?: string;
}

const checkupRepository = new ApiCheckupRepository();

function ProceduresView() {
  // 1. Este es el estado principal que las tarjetas leen.
  const params = useParams<{ petId: string }>();
  const petId = parseInt(params.petId as string);

  const [procedures, setProcedures] = useState<PetProcedureData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<PetProcedureData | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const petRepository = new ApiPetRepository();
      const proceduresData = await petRepository.getPetProcedures(petId);

      setProcedures(proceduresData);
    } catch (err) {
      console.log(err)
    };
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditModal = (procedure: PetProcedureData) => {
    setEditingProcedure(procedure);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcedure(null);
  };

  const onModalSubmit = async (status: string, procedureId: number, checkupId?: number, checkupDate?: string, checkupNotes?: string) => {
    if (checkupId) {
      await checkupRepository.update(checkupId, { petId, date: checkupDate, notes: checkupNotes })
    } else {
      await checkupRepository.create(petId, { procedureId, notes: checkupNotes, date: checkupDate })
    }

    handleCloseModal();
    await loadData();
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
            {procedures.map((procedure) => (
              // 3. Cada tarjeta recibe el estado actualizado en cada renderizado.
              <ProcedureCard
                key={procedure.id}
                procedure={procedure}
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
            onModalSubmit={onModalSubmit}
            procedure={editingProcedure}
          //initialState={procedures[editingProcedure.id]}
          />
        )}

      </div>
      <Footer />
    </>
  );
}

export default ProceduresView;