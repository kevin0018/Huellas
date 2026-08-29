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

function VolunteerHome() {
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
      <main className="workspace-page">
        <div className="workspace-shell">
          <header className="workspace-header">
            <GoBackButton hideIfNoHistory fallback="/volunteer-board" />
            <div className="workspace-header__copy">
              <h1 className="workspace-header__title">Publicar una ayuda</h1>
              <p className="workspace-header__description">
                Explica qué necesitas o qué puedes ofrecer para que la persona adecuada lo encuentre rápido.
              </p>
            </div>
            <div className="workspace-header__actions">
              <button
                type="button"
                className="ui-action ui-action--secondary px-4 py-3"
                onClick={() => navigate('/volunteer-board')}
              >
                Ver tablón
              </button>
            </div>
          </header>

          <div className="workspace-layout">
            <aside className="workspace-rail" aria-label="Resumen de publicación">
              <div className="workspace-rail__group composer-summary">
                <div className="composer-summary__person">
                  <span className="composer-summary__avatar" aria-hidden="true">
                    {(user?.name?.[0] || 'H').toUpperCase()}
                  </span>
                  <div>
                    <p className="composer-summary__name">
                      {[user?.name, user?.lastName].filter(Boolean).join(' ') || 'Perfil de Huellas'}
                    </p>
                    <p className="composer-summary__email">{user?.email || 'Sin correo disponible'}</p>
                  </div>
                </div>
              </div>
              <div className="workspace-rail__group">
                <p className="workspace-rail__label">Categoría seleccionada</p>
                <p className="workspace-rail__value">{CATEGORY_LABEL[category]}</p>
              </div>
              <div className="workspace-rail__group">
                <p className="workspace-rail__label">Visibilidad</p>
                <p className="workspace-rail__value">
                  {expiresAt ? `Hasta ${new Date(`${expiresAt}T00:00:00`).toLocaleDateString('es-ES')}` : 'Sin fecha de caducidad'}
                </p>
              </div>
            </aside>

            <section className="workspace-main workspace-section" aria-labelledby="publish-form-title">
              <header className="workspace-section__header">
                <div>
                  <h2 id="publish-form-title" className="workspace-section__title">Datos del anuncio</h2>
                  <p className="workspace-section__description">
                    El título debe permitir entender la necesidad antes de abrir el anuncio.
                  </p>
                </div>
              </header>

              {error && <div className="workspace-alert ui-status--error" role="alert">{error}</div>}
              {ok && <div className="workspace-alert ui-status--success" role="status">¡Anuncio creado!</div>}

              <form className="workspace-form-grid" onSubmit={onSubmit}>
                <div className="workspace-field workspace-field--full">
                  <label htmlFor="title" className="workspace-field__label">Título</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="ui-control"
                    required
                    placeholder="Ej. Necesito ayuda para llevar a Luna al veterinario"
                  />
                </div>

                <div className="workspace-field">
                  <label htmlFor="category" className="workspace-field__label">Categoría</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PostCategory)}
                    className="ui-control"
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

                <div className="workspace-field">
                  <label htmlFor="expires" className="workspace-field__label">Fecha límite <span className="ui-text-muted">(opcional)</span></label>
                  <input
                    id="expires"
                    type="date"
                    min={todayStr}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="ui-control"
                  />
                </div>

                <div className="workspace-field workspace-field--full">
                  <label htmlFor="comentarios" className="workspace-field__label">Descripción</label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    required
                    className="ui-control"
                    placeholder="Incluye la zona, el horario y cualquier detalle importante para poder ayudarte."
                  ></textarea>
                </div>

                <div className="workspace-form-actions">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ui-action ui-action--primary px-5 py-3"
                  >
                    {submitting ? "Publicando…" : "Publicar anuncio"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VolunteerHome;
