import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";





// --- Componente principal de la página ---
function VolunteerBoard() {
  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* Responsive background with dogs */}
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />

        {/* Content overlay */}
        <div className="relative z-10 w-full flex flex-col items-center max-w-4xl py-4 3xl:max-w-[50%] ">
          <h1 className="h1 font-caprasimo mb-4 py-8 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">
            ¡Hola nuevo, voluntario!
          </h1>
          <div className="bg-[#FDF2DE]/90 dark:bg-[#51344D]/90 border-[#BCAAA4] border-2 rounded-lg shadow-lg p-6 w-full mx-auto text-center">
          <p className="lead text-[--huellas-eggplant]/80 dark:text-[#FDF2DE] text-center mb-8 px-4">
            Aquí tienes todo lo que necesitas para empezar a ayudar.
          </p>
            <div className="flex flex-col md:flex-row lg:flex-row items-center justify-center gap-4 mt-8 3xl:gap-10">
              
              

{/* Formulario simplificado con layout de grid */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-[#51344D]">
              
            {/* Campo Titulo del anuncio */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium">Título del anuncio</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  required
                  placeholder="Título del anuncio"
                />
              </div>


              {/* Campo Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  required
                  placeholder="Tu nombre"
                />
              </div>

              {/* Campo Apellidos */}
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium">Apellidos</label>
                <input
                  type="text"
                  name="apellidos"
                  id="apellidos"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  required
                  placeholder="Tus apellidos"
                />
              </div>

              {/* Campo Correo Electrónico */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  required
                  placeholder="tu.correo@ejemplo.com"
                />
              </div>

              {/* Campo Correo Electrónico */}
              <div className="md:col-span-2">
                <label htmlFor="number" className="block text-sm font-medium">Número de teléfono</label>
                <input
                  type="number"
                  name="number"
                  id="number"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  required
                  placeholder="Tu número de teléfono"
                />
              </div>

              {/* Campo Textarea (Comentarios) */}
              <div className="md:col-span-2">
                <label htmlFor="comentarios" className="block text-sm font-medium">Comentarios</label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  placeholder="Escribe aquí tu mensaje..."
                ></textarea>
              </div>
              
              {/* Botón de enviar */}
              <div className="md:col-span-2">
                 <button type="submit" className="w-full flex items-center justify-center gap-3 p-3 bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#6a4f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#51344D] transition-colors duration-300">
                    Enviar
                </button>
              </div>

            </form>

              
              <div className="flex flex-col gap-4 p-4">
                

                <button type="button" className=" flex items-center justify-center gap-3  p-4 bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-300 ease-in-out cursor-pointer ">
                  <img src="media/paw_icon.svg" alt="Icono de añadir mascota" className="h-7 w-7" />
                  Mis anuncios publicados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VolunteerBoard;