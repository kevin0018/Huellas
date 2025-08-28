// src/components/ProcedureCard.tsx

type Procedure = {
  key: string;
  timeframe: string;
  nombre: string;
  descripcion: string;
};

type ProcedureState = {
  isCompleted: boolean;
  notes: string;
  date: string;
};

interface ProcedureCardProps {
  procedure: Procedure;
  procedureState: ProcedureState;
  onEdit: (procedure: Procedure) => void;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure, procedureState, onEdit }) => {
  const { nombre, timeframe } = procedure;
  const { isCompleted, date } = procedureState;

  // --- LÓGICA MODIFICADA PARA DETERMINAR EL ESTADO ---
  const getStatusInfo = () => {
    if (isCompleted) {
      return { text: 'Realizado', className: 'bg-green-200 text-green-800' };
    }
    
    // Si no está completado, pero tiene una fecha futura, es "Próxima"
    if (date) {
      const procedureDate = new Date(date);
      const today = new Date();
      // Ajustamos la fecha de hoy a medianoche para una comparación precisa
      today.setHours(0, 0, 0, 0);

      if (procedureDate >= today) {
        return { text: 'Próxima', className: 'bg-blue-200 text-blue-800' };
      }
    }
    
    // Si no se cumplen las condiciones anteriores, es "Faltante"
    return { text: 'Faltante', className: 'bg-red-200 text-red-800' };
  };

  const status = getStatusInfo();

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#A89B9D] border border-[#BCAAA4] dark:border-[#51344D] rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform transform hover:scale-105">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-nunito text-[#51344D] dark:text-[#FDF2DE]">
            {nombre}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
            {status.text}
          </span>
        </div>
        <p className="text-sm text-[#51344D] dark:text-gray-300 mb-2">{timeframe}</p>
        
        {(isCompleted || status.text === 'Próxima') && date && (
          <p className="text-sm text-gray-600 dark:text-gray-200">
            <strong>Fecha:</strong> {new Date(date).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={() => onEdit(procedure)}
          className="bg-[#51344D] text-white hover:bg-[#9886AD] font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
};

export default ProcedureCard;