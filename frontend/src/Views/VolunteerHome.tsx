import { ApiError } from '../shared/api/response';
import { messageFromError, translateMessage, type LocalizedMessage } from '../i18n/message';
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";

import type { PostCategory } from "../modules/posts/domain/types";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { User } from "../modules/auth/domain/User";
import { postActions } from '../features/volunteering/postActions';
import { postCategories, postCategoryTranslationKeys } from '../features/volunteering/postPresentation';
import { useTranslation } from '../i18n/hooks/hook';
import { localeByLanguage } from '../i18n/locale';

function VolunteerHome() {
  const navigate = useNavigate();
  const { translate, currentLanguage } = useTranslation();

  // Estado de envío/mensajes
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LocalizedMessage | null>(null);
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
        setError({ translationKey: 'titleDescriptionRequired' });
        setSubmitting(false);
        return;
      }

      const expiresIso = expiresAt ? new Date(expiresAt).toISOString() : null;

      await postActions.create(title, content, category, expiresIso);

      setOk(true);
      navigate("/volunteer-board");
    } catch (err: unknown) {
      console.error("[VolunteerHome] create post error:", err);
      setError(err instanceof ApiError && err.status === 403
        ? { translationKey: 'volunteerProfileRequired' }
        : messageFromError(err, 'createPostError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="workspace-page">
        <div className="workspace-shell">
          <header className="workspace-header workspace-header--primary">
            <div className="workspace-header__copy">
              <h1 className="workspace-header__title">{translate('publishHelpTitle')}</h1>
              <p className="workspace-header__description">
                {translate('publishHelpDescription')}
              </p>
            </div>
            <div className="workspace-header__actions">
              <button
                type="button"
                className="ui-action ui-action--secondary px-4 py-3"
                onClick={() => navigate('/volunteer-board')}
              >
                {translate('viewBoard')}
              </button>
            </div>
          </header>

          <div className="workspace-layout">
            <aside className="workspace-rail" aria-label={translate('publicationSummary')}>
              <div className="workspace-rail__group composer-summary">
                <div className="composer-summary__person">
                  <span className="composer-summary__avatar" aria-hidden="true">
                    {(user?.name?.[0] || 'H').toUpperCase()}
                  </span>
                  <div>
                    <p className="composer-summary__name">
                      {[user?.name, user?.lastName].filter(Boolean).join(' ') || translate('huellasProfile')}
                    </p>
                    <p className="composer-summary__email">{user?.email || translate('noEmail')}</p>
                  </div>
                </div>
              </div>
              <div className="workspace-rail__group">
                <p className="workspace-rail__label">{translate('selectedCategory')}</p>
                <p className="workspace-rail__value">{translate(postCategoryTranslationKeys[category])}</p>
              </div>
              <div className="workspace-rail__group">
                <p className="workspace-rail__label">{translate('visibility')}</p>
                <p className="workspace-rail__value">
                  {expiresAt
                    ? translate('visibleUntil', {
                        date: new Intl.DateTimeFormat(localeByLanguage[currentLanguage]).format(
                          new Date(`${expiresAt}T00:00:00`),
                        ),
                      })
                    : translate('noExpiration')}
                </p>
              </div>
            </aside>

            <section className="workspace-main workspace-section" aria-labelledby="publish-form-title">
              <header className="workspace-section__header">
                <div>
                  <h2 id="publish-form-title" className="workspace-section__title">{translate('postDetails')}</h2>
                  <p className="workspace-section__description">
                    {translate('postDetailsDescription')}
                  </p>
                </div>
              </header>

              {error && <div className="workspace-alert ui-status--error" role="alert">{translateMessage(error, translate)}</div>}
              {ok && <div className="workspace-alert ui-status--success" role="status">{translate('postCreated')}</div>}

              <form className="workspace-form-grid" onSubmit={onSubmit}>
                <div className="workspace-field workspace-field--full">
                  <label htmlFor="title" className="workspace-field__label">{translate('title')}</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="ui-control"
                    required
                    placeholder={translate('postTitlePlaceholder')}
                  />
                </div>

                <div className="workspace-field">
                  <label htmlFor="category" className="workspace-field__label">{translate('category')}</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PostCategory)}
                    className="ui-control"
                  >
                    {postCategories.map((value) => (
                      <option key={value} value={value}>
                        {translate(postCategoryTranslationKeys[value])}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="workspace-field">
                  <label htmlFor="expires" className="workspace-field__label">
                    {translate('deadline')} <span className="ui-text-muted">({translate('optional')})</span>
                  </label>
                  <input
                    id="expires"
                    type="date"
                    lang={localeByLanguage[currentLanguage]}
                    min={todayStr}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="ui-control"
                  />
                </div>

                <div className="workspace-field workspace-field--full">
                  <label htmlFor="comentarios" className="workspace-field__label">{translate('description')}</label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    required
                    className="ui-control"
                    placeholder={translate('postDescriptionPlaceholder')}
                  ></textarea>
                </div>

                <div className="workspace-form-actions">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ui-action ui-action--primary px-5 py-3"
                  >
                    {submitting ? translate('publishing') : translate('publishPost')}
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
