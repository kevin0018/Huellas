import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";

import { CreateVolunteerPostCommand } from "../modules/posts/application/commands/CreateVolunteerPostCommand";
import { CreateVolunteerPostCommandHandler } from "../modules/posts/application/commands/CreateVolunteerPostCommandHandler";
import type { PostCategory } from "../modules/posts/domain/types";

const createPostHandler = new CreateVolunteerPostCommandHandler();

// Opciones de categoría para el select
const CATEGORY_LABEL: Record<PostCategory, string> = {
  GENERAL: "General",
  PET_SITTING: "Cuidado en casa",
  WALKING_EXERCISE: "Paseos y ejercicio",
  VET_TRANSPORT: "Transporte a veterinario",
  FOSTER_CARE: "Casa de acogida",
  TRAINING_BEHAVIOR: "Adiestramiento y conducta",
  SHELTER_SUPPORT: "Apoyo a protectoras",
  GROOMING_HYGIENE: "Higiene y peluquería",
  MEDICAL_SUPPORT: "Soporte médico",
  ADOPTION_REHOMING: "Adopción / Reubicación",
  LOST_AND_FOUND: "Mascotas perdidas",
};

function VolunteerBoard() {
  const navigate = useNavigate();

  // Estado de envío/mensajes
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Estado local para controles nuevos
  const [category, setCategory] = useState<PostCategory>("GENERAL");
  const [expiresAt, setExpiresAt] = useState<string>("");

  // Hoy en formato YYYY-MM-DD para limitar el datepicker (no fechas pasadas)
  const todayStr = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, []);

  // Submit del formulario (evita GET con querystring y hace POST a la API)
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOk(false);

    try {
      const form = e.currentTarget;
      const data = new FormData(form);

      const title = String(data.get("title") || "").trim();
      const content = String(data.get("comentarios") || "").trim();

      if (!title || !content) {
        setError("Título y descripción son obligatorios.");
        setSubmitting(false);
        return;
      }

      const expiresIso = expiresAt ? new Date(expiresAt).toISOString() : null;

      const cmd = new CreateVolunteerPostCommand(title, content, category, expiresIso);
      await createPostHandler.execute(cmd);

      setOk(true);
      navigate("/volunteer-board");
    } catch (err: any) {
      console.error("[VolunteerHome] create post error:", err);
      const msg =
        typeof err?.message === "string" && err.message.includes("403")
          ? "Necesitas activar tu perfil de voluntario para publicar."
          : err?.message || "Error al crear el anuncio";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <NavBar />
      <div
        className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        {/* Responsive background with dogs */}
        <div
          className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none"
          aria-hidden="true"
        />

        {/* Content overlay */}
        <div className="relative z-10 w-full flex flex-col items-center max-w-4xl py-4 3xl:max-w-[50%] ">
          {/* Go back */}
          <div className="w-full text-left mx-auto mt-8">
            <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
          </div>

          <h1 className="h1 font-caprasimo mb-8 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">
            Hola, voluntarix
          </h1>

          <div className="bg-[#FDF2DE]/90 dark:bg-[#51344D]/90 border-[#BCAAA4] border-2 rounded-lg shadow-lg p-6 w-full mx-auto text-center themed-card-invL">
            <p className="lead text-[--huellas-eggplant]/80 dark:text-[#FDF2DE] text-center mb-8 px-4">
              Aquí tienes todo lo que necesitas para empezar a ayudar.
            </p>

            {/* Mensajes de estado */}
            {error && <div className="mb-4 text-red-700 font-semibold">{error}</div>}
            {ok && <div className="mb-4 text-green-700 font-semibold">¡Anuncio creado!</div>}

            <div className="flex flex-col md:flex-row lg:flex-row items-center justify-center gap-4 mt-8 3xl:gap-10">
              {/* Formulario simplificado con layout de grid */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-[#51344D]" onSubmit={onSubmit}>
                {/* Título */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Título del anuncio
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                    required
                    placeholder="Título del anuncio"
                  />
                </div>

                {/* Nombre (UI informativa; no se envía) */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Apellidos (UI informativa; no se envía) */}
                <div>
                  <label htmlFor="apellidos" className="block text-sm font-medium">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    id="apellidos"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                    placeholder="Tus apellidos"
                  />
                </div>

                {/* Email (UI informativa; no se envía) */}
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                    placeholder="tu.correo@ejemplo.com"
                  />
                </div>

                {/* Teléfono (UI informativa; no se envía) */}
                <div className="md:col-span-2">
                  <label htmlFor="number" className="block text-sm font-medium">Número de teléfono</label>
                  <input
                    type="number"
                    name="number"
                    id="number"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                    placeholder="Tu número de teléfono"
                  />
                </div>

                {/* Categoría (nuevo) */}
                <div className="md:col-span-2">
                  <label htmlFor="category" className="block text-sm font-medium">Categoría</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PostCategory)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  >
                    {Object.keys(CATEGORY_LABEL).map((key) => {
                      const k = key as PostCategory;
                      return (
                        <option key={k} value={k}>
                          {CATEGORY_LABEL[k]}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Expiración (opcional) */}
                <div className="md:col-span-2">
                  <label htmlFor="expires" className="block text-sm font-medium">Expira (opcional)</label>
                  <input
                    id="expires"
                    type="date"
                    min={todayStr}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                  />
                </div>

                {/* Comentarios → content */}
                <div className="md:col-span-2">
                  <label htmlFor="comentarios" className="block text-sm font-medium">Comentarios</label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                    placeholder="Escribe aquí tu mensaje..."
                  ></textarea>
                </div>

                {/* Botón enviar */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#6a4f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#51344D] transition-colors duration-300 disabled:opacity-60"
                  >
                    {submitting ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>

              {/* CTA lateral */}
              <div className="flex flex-col gap-4 p-4">
                <button
                  type="button"
                  className=" flex items-center justify-center gap-3  p-4 bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-300 ease-in-out cursor-pointer "
                  onClick={() => navigate("/volunteer-board")}
                >
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