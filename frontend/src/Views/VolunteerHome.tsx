import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";

import type { PostCategory } from "../modules/posts/domain/types";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { User } from "../modules/auth/domain/User";
import { postActions } from '../features/volunteering/postActions';

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

  // Estado para datos del usuario
  const [user, setUser] = useState<User | null>(null);

  // Get user data on component mount
  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
  }, []);

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

      await postActions.create(title, content, category, expiresIso);

      setOk(true);
      navigate("/volunteer-board");
    } catch (err: unknown) {
      console.error("[VolunteerHome] create post error:", err);
      let msg = "Error al crear el anuncio";
      
      if (err instanceof Error) {
        if (err.message.includes("403")) {
          msg = "Necesitas activar tu perfil de voluntario para publicar.";
        } else {
          msg = err.message;
        }
      }
      
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
            <GoBackButton variant="outline" hideIfNoHistory />
          </div>

          <h1 className="h1 font-caprasimo mb-8 text-4xl md:text-5xl text-[var(--color-ink)] drop-shadow-lg">
            Hola, {user?.name || 'voluntarix'}
          </h1>

          <div className="ui-panel p-6 w-full mx-auto text-center">
            <p className="lead text-center mb-8 px-4 mx-auto">
              Aquí tienes todo lo que necesitas para empezar a ayudar.
            </p>

            {/* Mensajes de estado */}
            {error && <div className="ui-status--error mb-4 rounded-md p-3 font-semibold">{error}</div>}
            {ok && <div className="ui-status--success mb-4 rounded-md p-3 font-semibold">¡Anuncio creado!</div>}

            <div className="flex flex-col md:flex-row lg:flex-row items-center justify-center gap-4 mt-8 3xl:gap-10">
              {/* Formulario simplificado con layout de grid */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-[var(--color-ink)]" onSubmit={onSubmit}>
                {/* Título */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Título del anuncio
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
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
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    placeholder="Tu nombre"
                    value={user?.name || ''}
                    readOnly
                  />
                </div>

                {/* Apellidos (UI informativa; no se envía) */}
                <div>
                  <label htmlFor="apellidos" className="block text-sm font-medium">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    id="apellidos"
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    placeholder="Tus apellidos"
                    value={user?.lastName || ''}
                    readOnly
                  />
                </div>

                {/* Email (UI informativa; no se envía) */}
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    placeholder="tu.correo@ejemplo.com"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>

                {/* Teléfono (UI informativa; no se envía) */}
                <div className="md:col-span-2">
                  <label htmlFor="number" className="block text-sm font-medium">Número de teléfono</label>
                  <input
                    type="number"
                    name="number"
                    id="number"
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
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
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
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
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                  />
                </div>

                {/* Comentarios → content */}
                <div className="md:col-span-2">
                  <label htmlFor="comentarios" className="block text-sm font-medium">Comentarios</label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    required
                    className="ui-control mt-1 block w-full px-3 py-2 shadow-sm"
                    placeholder="Escribe aquí tu mensaje..."
                  ></textarea>
                </div>

                {/* Botón enviar */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ui-action ui-action--primary w-full gap-3 p-3 shadow-md"
                  >
                    {submitting ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>

              {/* CTA lateral */}
              <div className="flex flex-col gap-4 p-4">
                <button
                  type="button"
                  className="ui-action ui-action--primary gap-3 p-4 shadow-md cursor-pointer"
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
