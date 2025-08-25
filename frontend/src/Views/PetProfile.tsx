import React from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import { Link } from "react-router-dom";

type ProfileDetailProps = {
  label: string;
  value: React.ReactNode;
};

const ProfileDetail: React.FC<ProfileDetailProps> = ({ label, value }) => (
  <div className="text-center md:text-left">
    <h3 className="block font-caprasimo text-[#51344D] uppercase tracking-wider">{label}</h3>
    <p className="mt-1 text-base ">{value}</p>
  </div>
);


const PetProfile: React.FC = () => {

  const petData = {
    name: "Rocky",
    sex: "Macho",
    birthDate: "15/05/2021",
    race: "Mestizo",
    type: "Perro",
    size: "Mediano",
    chipCode: "941000012345678",
    hasPassport: true,
    passportNumber: "ESP123456789",
    origin: "Refugio local",
    comments: "Es muy juguetón y le encantan los paseos por la montaña. Se lleva bien con otros perros y niños."
  };

  return (
    <>
     <NavBar />
      <div 
        className="min-h-screen bg-[#FDF6E8] bg-cover bg-center flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
        
      >
        <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-caprasimo mb-6 text-[#51344D]">Perfil de la Mascota</h1>

          {/* Recuadro con el nombre de la mascota */}
          <div className="p-4  mb-8">
            <img src="/media/pfp_sample.svg" alt="" />
          </div>

          {/* Sección de visualización de datos */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
              <ProfileDetail label="Nombre" value={petData.name} />
              <ProfileDetail label="Sexo" value={petData.sex} />
              <ProfileDetail label="Fecha de Nacimiento" value={petData.birthDate} />
              <ProfileDetail label="Raza" value={petData.race} />
              <ProfileDetail label="Tipo" value={petData.type} />
              <ProfileDetail label="Tamaño" value={petData.size} />
              <ProfileDetail label="Código Microchip" value={petData.chipCode} />
              <ProfileDetail label="Pasaporte" value={petData.hasPassport ? petData.passportNumber : "No"} />
              <ProfileDetail label="Origen" value={petData.origin} />
            </div>
            
            {/* Campo de comentarios */}
            <div className="text-center border-t pt-6 mt-6">
               <h3 className="block text-[#51344D] uppercase tracking-wider">Comentarios Adicionales</h3>
               <p className="mt-2 text-base text-gray-700 max-w-2xl mx-auto">{petData.comments}</p>
            </div>
          </div>
        </div>

        <div className="p-10 flex justify-center">
          <button
            type="button"
            className="
              flex items-center justify-center gap-3 py-3 px-6
              bg-[#51344D] text-white font-semibold rounded-lg shadow-md
              hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#51344D]
              transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
            </svg>
             <Link to="/pet-register">Editar perfil de mascota</Link>
            
          </button>
        </div>
      </div>
     <Footer />
    </>
  
  );
};

export default PetProfile;