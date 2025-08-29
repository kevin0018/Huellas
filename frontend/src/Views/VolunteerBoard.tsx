import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";

type AnuncioCardProps = {
  title: string;
  author: string;
  description: string;
  iconSvg: React.ReactNode; // Cambiado de imageUrl a iconSvg
};

function AnuncioCard({ title, author, description, iconSvg }: AnuncioCardProps) {
  return (
    <div className="bg-[#FDF2DE] border-2 border-[#BCAAA4] rounded-2xl p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
      
      <div className="flex items-center gap-3 bg-[#BCAAA4] p-2 rounded-lg">
        <div className="bg-white rounded-full p-1 flex items-center justify-center">
          {iconSvg} {/* Aquí se renderiza el SVG directamente */}
        </div>
        <h3 className=" text-white text-lg">{title}</h3>
      </div>

      <p className="mt-4 text-left font-semibold text-[#51344D]">{author}</p>

      <div className="mt-2 p-3 w-full h-40 bg-white border border-gray-300 rounded-lg overflow-y-auto">
        <p className="text-gray-600 text-left">{description}</p>
      </div>
    </div>
  );
}


// --- Componente principal de la página ---
function VolunteerBoard() {
  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-4 py-8" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] opacity-60 pointer-events-none" aria-hidden="true" />
        
        <div className="relative z-10 w-full max-w-6xl">
          <h1 className="h1 font-caprasimo mb-2 text-5xl text-[#51344D] drop-shadow-lg text-center">
            Tablón de anuncios
          </h1>
          <p className="text-center text-lg text-[#51344D]/80 mb-10">
            Aquí puedes buscar entre los voluntarios más cercanos a ti en Barcelona.
          </p>

          {/* Grid para las tarjetas de anuncios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <AnuncioCard
              title="Paseadora canina en Gràcia"
              author="Elena Rodríguez"
              description="¡Hola! Ofrezco paseos de una hora por las mañanas en el barrio de Gràcia. Tengo experiencia con perros de todas las razas y tamaños. ¡Tu amigo peludo estará en buenas manos!"
              iconSvg={ // SVG para paseador
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#51344D]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.05a7 7 0 11-7 7m7-7a7 7 0 107 7m-7-7v7m0-7H6m4 7h6m-3-3l-3 3m0 0l3 3m-3-3h3m-6 3H6m-4 7h12c1.657 0 3-1.343 3-3V7c0-1.657-1.343-3-3-3H6M4 21v-3" />
                </svg>
              } 
            />
            
            <AnuncioCard
              title="Cuido tu gato en vacaciones"
              author="Marcos Soler"
              description="¿Te vas de viaje? Puedo ir a tu casa a cuidar de tu gato, asegurándome de que tenga comida, agua y mucho cariño. Soy responsable y un gran amante de los felinos."
              iconSvg={ // SVG para cuidador de gatos
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#51344D]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a4.5 4.5 0 00-4.5 4.5V9a4.5 4.5 0 004.5 4.5m-4.5-4.5H12c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5H7.5m4.5-9v-3m0 0v-3m0 3h3m-3 0h-3m3 0V7.5M7.5 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5h9c2.485 0 4.5-2.015 4.5-4.5S16.985 7.5 14.5 7.5h-9z" />
                </svg>
              }
            />

            <AnuncioCard
              title="Voluntario para el refugio"
              author="Sofía Vidal"
              description="Busco ayuda en el refugio local los fines de semana. Necesitamos manos para limpiar, jugar con los cachorros y ayudar en los eventos de adopción. ¡Cualquier ayuda es bienvenida!"
              iconSvg={ // SVG para refugio/comunidad
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#51344D]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.072 60.072 0 00-.416 1.157 60.072 60.072 0 00-.416 1.157 5.998 5.998 0 00.914 3.023A6.003 6.003 0 007.71 18.5c.379.083.757.167 1.134.25A6.002 6.002 0 0012 21.5c.377 0 .755-.083 1.134-.167a6.002 6.002 0 002.404-1.314 6.003 6.003 0 00.914-3.023 60.072 60.072 0 00-.416-1.157 60.072 60.072 0 00-.416-1.157 6.002 6.002 0 00-3.023-2.404C13.243 7.84 12.62 7.5 12 7.5c-.62 0-1.243.34-1.857.914a6.002 6.002 0 00-3.023 2.404zM12 6a9 9 0 100 18A9 9 0 0012 6z" />
                </svg>
              }
            />
            
            {/* --- ANUNCIOS NUEVOS AÑADIDOS CON SVGs --- */}

            <AnuncioCard
              title="Transporte a veterinario"
              author="Javier Moreno"
              description="Dispongo de coche adaptado para transportar mascotas de forma segura a sus citas veterinarias. Si no tienes cómo llevarlo, cuenta conmigo. Zona de Sants-Montjuïc."
              iconSvg={ // SVG para transporte médico
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#51344D]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h8m-9 8h8M5 16h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2zM9 13v-2m-2 2v-2" />
                </svg>
              }
            />

            <AnuncioCard
              title="Casa de acogida temporal"
              author="Isabel Jiménez"
              description="Tengo espacio en mi hogar para ser casa de acogida para perros pequeños o gatos mientras encuentran a su familia definitiva. Colaboro con varias protectoras locales."
              iconSvg={ // SVG para hogar/corazón
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#51344D]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.171-.439 1.612 0L21.75 12M4.5 19.5h15c.621 0 1.125-.504 1.125-1.125v-10.5c0-.621-.504-1.125-1.125-1.125H4.5c-.621 0-1.125.504-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125zM12 17.25V12" />
                </svg>
              }
            />
            
            <AnuncioCard
              title="Adiestramiento básico a domicilio"
              author="David Ruiz"
              description="Soy adiestrador canino y ofrezco sesiones de obediencia básica a domicilio. Ayudo a corregir problemas de comportamiento como tirones de correa o ladridos excesivos."
              iconSvg={ // SVG para adiestramiento
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#51344D]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VolunteerBoard;