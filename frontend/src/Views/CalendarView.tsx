// src/pages/CalendarView.tsx

import React, { useState } from 'react'; // AÑADIR useState
import NavBar from '../Components/NavBar';
import Footer from '../Components/footer';
import ProceduresModal from '../Views/ProceduresModal';
import GoBackButton from '../Components/GoBackButton';

const CalendarView: React.FC = () => {
    // AÑADIR 1: Estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="w-full min-h-screen flex flex-col bg-[url(/media/bg_desktop_userhome.png)]">
            <NavBar />
            <main className="flex-grow p-6">
                <div className="w-full text-left mt-2 max-w-6xl xl:max-w-7xl 3xl:max-w-[1600px] 3xl:mt-0">
                    <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
                </div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="h1">Mi Agenda</h1>
                    
                    {/* AÑADIR 2: Botón para abrir el modal de procedimientos */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#c7b9bb] hover:bg-[#b0a1a3] text-white py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        Ver Plan de Procedimientos
                    </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <p className="text-gray-700">
                        Un calendario muy chulo iría aquí.
                    </p>
                    
                </div>

            </main>
            <Footer />

            {isModalOpen && <ProceduresModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default CalendarView;