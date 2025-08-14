import React, { useState } from 'react';

// Definimos el componente usando React.FC (Functional Component)
const Navbar: React.FC = () => {
    // Estado para controlar si el menú está abierto o cerrado
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleMenu = (): void => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-[#BCAAA4] text-white p-4 shadow-md w-full sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <a href="/">
                    <img src="media/logotipo.svg" alt="Logotipo-huellas" className="h-14 w-auto" />
                </a>

                {/* Menú para Desktop */}
                <div className="hidden md:flex space-x-6">
                    <a href="#inicio" className="hover:text-[#51344D]">Inicio</a>
                    <a href="#servicios" className="hover:text-[#51344D]">Servicios</a>
                    <a href="#nosotros" className="hover:text-[#51344D]">Sobre Nosotros</a>
                    <a href="#contacto" className="hover:text-[#51344D]">Contacto</a>
                </div>

                {/* Botón de Hamburguesa para móvil */}
                <div className="md:hidden">
                    <button 
                        onClick={toggleMenu} 
                        aria-label="Toggle Menu" 
                        className="text-[#51344D]" 
                    >
                        {isOpen ? (
                            // Icono de 'X' (Cerrar) usando SVG
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            // Icono de Hamburguesa usando SVG
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Menú desplegable para móvil */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                <div className="flex flex-col items-center space-y-4 pt-4 pb-2">
                    <a href="#inicio" onClick={toggleMenu} className="hover:text-[#51344D]">Inicio</a>
                    <a href="#servicios" onClick={toggleMenu} className="hover:text-[#51344D]">Servicios</a>
                    <a href="#nosotros" onClick={toggleMenu} className="hover:text-[#51344D]">Sobre Nosotros</a>
                    <a href="#contacto" onClick={toggleMenu} className="hover:text-[#51344D]">Contacto</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;