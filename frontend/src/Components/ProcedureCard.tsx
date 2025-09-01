import type { PetProcedureData } from "../Views/ProceduresView";

interface ProcedureCardProps {
  procedure: PetProcedureData;
  onEdit: (procedure: PetProcedureData) => void;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure, onEdit }) => {
  const getStatusInfo = () => {
    if (procedure.status === 'DONE') return { text: 'Realizado', className: 'bg-green-200 text-green-800' };
    if (procedure.status === 'UPCOMING') return { text: 'Próxima', className: 'bg-blue-200 text-blue-800' };
    return { text: 'Faltante', className: 'bg-red-200 text-red-800' };
  }

  const status = getStatusInfo();

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#A89B9D] border border-[#BCAAA4] dark:border-[#51344D] rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform transform hover:scale-105">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-nunito text-[#51344D] dark:text-[#FDF2DE]">
            {procedure.name}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
            {status.text}
          </span>
        </div>
        <p className="text-sm text-[#51344D] dark:text-gray-300 mb-2 text-left">
          <strong>Edad: </strong> {procedure.age} Semanas
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-200 text-left">
          <strong>Descripción: </strong>{procedure.description}
        </p>
        {procedure.checkupDate && (
          <p className="text-sm text-gray-600 dark:text-gray-200 text-left">
            <strong>Fecha: </strong> {new Date(procedure.checkupDate).toLocaleDateString('es-ES')}
          </p>
        )}
        {procedure.checkupNotes && (
          <p className="text-sm text-gray-600 dark:text-gray-200 text-left">
            <strong>Notas: </strong>{procedure.checkupNotes}
          </p>
        )}
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={() => onEdit(procedure)}
          className="bg-[#51344D] text-white hover:bg-[#9886AD] font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors">
          Actualizar
        </button>
      </div>
    </div>
  );
};

export default ProcedureCard;