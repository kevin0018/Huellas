import React, { useState } from 'react';

interface ProceduresModalProps {
    onClose: () => void;
}

const proceduresData = [
    { key: 'innerdes', timeframe: '0-2 semanas', nombre: 'Desparasitación Interna', descripcion: 'Tratamiento para eliminar parásitos intestinales como gusanos redondos y tenias.' },
    { key: 'extdes', timeframe: '2-6 semanas', nombre: 'Desparasitación Externa', descripcion: 'Aplicación de pipeta o collar para proteger contra pulgas, garrapatas y piojos.' },
    { key: 'multivac1', timeframe: '6-8 semanas', nombre: 'Vacuna Polivalente (1ª dosis)', descripcion: 'Primera dosis que protege contra moquillo, parvovirus, hepatitis infecciosa y leptospirosis.' },
    { key: 'kennelvac', timeframe: '8-10 semanas', nombre: 'Vacuna Tos de las Perreras', descripcion: 'Protege contra la traqueobronquitis infecciosa canina, muy contagiosa en lugares con muchos perros.' },
    { key: 'multivac2', timeframe: '10 semanas', nombre: 'Vacuna Polivalente (2ª dosis)', descripcion: 'Segundo refuerzo de la vacuna polivalente para asegurar una correcta inmunización.' },
    { key: 'rabidvac', timeframe: '12 semanas', nombre: 'Vacuna Antirrábica', descripcion: 'Vacunación esencial y a menudo obligatoria para la protección contra la rabia.' },
    { key: 'multivac3', timeframe: '16 semanas', nombre: 'Vacuna Polivalente (3ª dosis)', descripcion: 'Último refuerzo del ciclo de vacunación inicial para garantizar la máxima protección.' },
];
const statusOptions = ['Pendiente', 'Realizado', 'Cancelado'];

const ProceduresModal: React.FC<ProceduresModalProps> = ({ onClose }) => {
    type ProcedureState = { [key: string]: { status: string; notes: string; date: string; } };
    const [proceduresState, setProceduresState] = useState<ProcedureState>(() => {
        const initialState: ProcedureState = {};
        proceduresData.forEach(proc => {
            initialState[proc.key] = { status: 'Pendiente', notes: '', date: '' };
        });
        return initialState;
    });
    const [openProcedureKey, setOpenProcedureKey] = useState<string | null>(null);
    const handleStateChange = (key: string, field: 'status' | 'notes' | 'date', value: string) => {
        setProceduresState(prevState => ({ ...prevState, [key]: { ...prevState[key], [field]: value } }));
    };
    const handleToggle = (key: string) => {
        setOpenProcedureKey(prevKey => (prevKey === key ? null : key));
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-2xl text-gray-800">Plan de Procedimientos</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto">
                    <div className="flex flex-col gap-3 w-full">
                        {proceduresData.map((procedure) => {
                            const isOpen = openProcedureKey === procedure.key;
                            return (
                                <div key={procedure.key} className="border border-[#BCAAA4] rounded-lg shadow-sm bg-[#FDF2DE]">
                                    <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#f9e6c5]" onClick={() => handleToggle(procedure.key)}>
                                        <div className="flex items-center gap-4"><span className="bg-[#c7b9bb] px-3 py-1 text-sm rounded-full">{procedure.timeframe}</span><h3 className="text-lg text-gray-800">{procedure.nombre}</h3></div>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                    </div>
                                    {isOpen && (
                                        <div className="p-4 border-t border-[#d3c6c4] bg-white">
                                            <p className="mb-4 text-gray-700">{procedure.descripcion}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* 1. Fecha */}
                                                <div>
                                                    <label htmlFor={`date-${procedure.key}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                        Fecha de realización
                                                    </label>
                                                    <input
                                                        type="date"
                                                        id={`date-${procedure.key}`}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                                        value={proceduresState[procedure.key]?.date}
                                                        onChange={(e) => handleStateChange(procedure.key, 'date', e.target.value)}
                                                    />
                                                </div>
                                                {/* 2. Estado */}
                                                <div>
                                                    <label htmlFor={`status-select-${procedure.key}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                        Estado
                                                    </label>
                                                    <select
                                                        id={`status-select-${procedure.key}`}
                                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        value={proceduresState[procedure.key]?.status}
                                                        onChange={(e) => handleStateChange(procedure.key, 'status', e.target.value)}
                                                    >
                                                        {statusOptions.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* 3. Notas */}
                                                <div>
                                                     <label htmlFor={`notes-${procedure.key}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                        Notas
                                                    </label>
                                                    <textarea
                                                        id={`notes-${procedure.key}`}
                                                        rows={3}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                                        placeholder="Añadir notas..."
                                                        value={proceduresState[procedure.key]?.notes}
                                                        onChange={(e) => handleStateChange(procedure.key, 'notes', e.target.value)}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
};
export default ProceduresModal;