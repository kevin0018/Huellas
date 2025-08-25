import React from "react";
import ThemeProvider from "../Components/theme/ThemeProvider";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import { Link } from "react-router-dom";

const UserHome: React.FC = () => {
  return (
    <ThemeProvider>
      <NavBar />
      <div className="bg-dogs-userhome-mobile md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop bg-cover bg-center flex flex-col items-center justify-center dark:bg-dogs-userhome-mobile ">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <h1 className="h1 font-caprasimo mb-4 py-8">Detalles del perfil</h1>

          <img
            src="/media/logotipo.svg"
            alt=""
            className="w-24 md:w-32 lg:w-48 rounded-full bg-white mb-8"
          />

          {/*Sección de formulario para editar tu mascota*/}

          <div className="bg-gray-100  flex items-center justify-center">
            <div className="bg-[#FFFAF0] p-8 rounded-lg shadow-lg w-full max-w-4xl">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center text-left text-[#51344D]">
                {/* Campo nombre de la mascota */}
                <div className="md:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium ">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                    placeholder="Nombre de la mascota"
                  />
                </div>

                {/* Campo Sexo */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium ">Sexo</label>
                  <div className="mt-2 flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sex"
                        value="male"
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm ">Macho</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sex"
                        value="female"
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm ">Hembra</span>
                    </label>
                  </div>
                </div>

                {/* Campo Fecha de Nacimiento */}
                <div>
                  <label
                    htmlFor="fechaNacimiento"
                    className="block text-sm font-medium "
                  >
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    id="fechaNacimiento"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                  />
                </div>

                {/* Campo Raza */}
                <div>
                  <label htmlFor="race" className="block text-sm font-medium ">
                    Raza
                  </label>
                  <input
                    type="text"
                    name="race"
                    id="race"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                    placeholder="Raza de la mascota"
                  />
                </div>

                {/* Campo tipo de animal */}
                <div>
                  <label
                    htmlFor="typeof"
                    className="block text-sm font-medium "
                  >
                    Tipo
                  </label>
                  <select
                    id="size"
                    name="size"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                  >
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="huron">Hurón</option>
                  </select>
                </div>

                {/* Campo tamaño de animal */}
                <div>
                  <label htmlFor="size" className="block text-sm font-medium ">
                    Tamaño
                  </label>
                  <select
                    id="size"
                    name="size"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                  >
                    <option value="grande">Grande</option>
                    <option value="mediano">Mediano</option>
                    <option value="pequeño">Pequeño</option>
                  </select>
                </div>

                {/* Campo código microchip */}
                <div>
                  <label
                    htmlFor="chipCode"
                    className="block text-sm font-medium "
                  >
                    Código Microchip
                  </label>
                  <input
                    type="text"
                    name="codechip"
                    id="codechip"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    placeholder="Código del microchip"
                    required
                  />
                </div>

                {/* Campo tiene pasaporte */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium ">
                    ¿Tiene Pasaporte?
                  </label>
                  <div className="mt-2 flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pasport"
                        value="yes"
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm ">Si</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pasport"
                        value="no"
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm ">No</span>
                    </label>
                  </div>
                </div>

                {/* Campo pasaporte */}
                <div>
                  <label
                    htmlFor="pasportnumber"
                    className="block text-sm font-medium "
                  >
                    Número de Pasaporte
                  </label>
                  <input
                    type="text"
                    name="pasportnumber"
                    id="origin"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    placeholder="Número de pasaporte"
                  />
                </div>

                {/* Campo origen */}
                <div>
                  <label
                    htmlFor="origin"
                    className="block text-sm font-medium "
                  >
                    Origen
                  </label>
                  <input
                    type="text"
                    name="origin"
                    id="origin"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    required
                    placeholder="Origen de la mascota"
                  />
                </div>

                {/* Campo Textarea (Comentarios) */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="comentarios"
                    className="block text-sm font-medium "
                  >
                    Comentarios Adicionales
                  </label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-[#51344D]"
                    placeholder="Escribe aquí cualquier comentario adicional sobre tu mascota"
                  ></textarea>
                </div>

                {/* Botón de Envío */}
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#51344D] hover:bg-[#A89B9D] text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 ease-in-out"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="p-10 flex justify-center">
          <button
            type="button"
            className="
          flex items-center justify-center gap-3  pr-4
          bg-[#51344D] !text-white font-semibold rounded-lg shadow-md
          hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
          transition-colors duration-300 ease-in-out "
          >
            {/* Imagen SVG desde la carpeta 'public' */}
            <img
              src="media/agenda_icon.svg"
              alt="Icono de agenda"
              className="h-10 w-10"
            />

            <Link to="/procedures" className="">Ir a Procedimientos</Link>
          </button>
        </div>
      </div>
      <Footer />
    </ThemeProvider>
  );
};

export default UserHome;