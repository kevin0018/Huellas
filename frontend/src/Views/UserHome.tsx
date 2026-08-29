import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import { PetAvatarGrid } from "../Components/pet/PetAvatarGrid";
import { applicationServices, type ReminderFeed } from "../composition/applicationServices.js";
import { useTranslation } from "../i18n/hooks/hook";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { User } from "../modules/auth/domain/User";
import type { Pet } from "../modules/pet/domain/Pet";
import { AsyncContent } from "../shared/ui/AsyncContent.js";

const { pets: petRepository, reminders: reminderRepository } = applicationServices;

function PawIcon() {
  return <img src="/media/paw_icon.svg" alt="" className="size-5" aria-hidden="true" />;
}

function CalendarIcon() {
  return (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function UserHomeContent() {
  const { translate } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderFeed, setReminderFeed] = useState<ReminderFeed | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [pendingReminderId, setPendingReminderId] = useState<number | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated?.()) {
      navigate("/login");
      return;
    }
    setUser((AuthService.getUser?.() as User) ?? null);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [rows, feed] = await Promise.all([
          petRepository.getUserPets(),
          reminderRepository.list(),
        ]);
        if (!cancelled) {
          setPets(rows);
          setReminderFeed(feed);
        }
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : String(requestError);
        if (!cancelled) {
          if (message.toLowerCase().includes("unauthorized")) {
            navigate("/login");
            return;
          }
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, navigate, reloadVersion]);

  const reloadReminders = async () => setReminderFeed(await reminderRepository.list());

  const reminderAction = async (id: number, action: "postpone" | "complete" | "cancel") => {
    setPendingReminderId(id);
    setActionError(null);
    try {
      await reminderRepository.action(id, action, action === "postpone" ? 7 : undefined);
      await reloadReminders();
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setPendingReminderId(null);
    }
  };

  const updatePreferences = async (enabled: boolean, leadDays: number) => {
    setSavingPreferences(true);
    setActionError(null);
    try {
      await reminderRepository.preferences(enabled, leadDays);
      await reloadReminders();
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setSavingPreferences(false);
    }
  };

  const nextByPet = reminderFeed?.reminders.reduce<typeof reminderFeed.reminders>(
    (items, reminder) => items.some((item) => item.petId === reminder.petId) ? items : [...items, reminder],
    [],
  ) ?? [];
  const urgentCount = nextByPet.filter((reminder) => reminder.notifyNow).length;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] text-[var(--color-ink)]" role="status" aria-live="polite">
        <span className="text-lg">{translate("loading")}</span>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <main className="user-home relative min-h-[calc(100vh-11.25rem)] overflow-hidden bg-[var(--color-paper)] px-[var(--page-gutter)] pb-16 pt-8 text-[var(--color-ink)]">
        <div className="pointer-events-none absolute inset-0 bg-[url('/media/bg_phone_userhome.png')] bg-repeat opacity-20 md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')]" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-[var(--page-max)]">
          <header className="max-w-3xl pb-8 sm:pb-10">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              Tu agenda de cuidados
            </p>
            <h1 className="text-[clamp(2.25rem,8vw,4.25rem)]">
              {translate("hello")}, {user.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
              {translate("homePageSubtitle")}
            </p>
          </header>

          <AsyncContent
            loading={loading}
            error={error}
            empty={false}
            loadingLabel={translate("loading")}
            emptyTitle=""
            onRetry={() => setReloadVersion((current) => current + 1)}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.7fr)] lg:items-start">
              <div className="grid min-w-0 gap-6">
                <section className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-surface)] p-5 text-[var(--color-ink)] shadow-[var(--shadow-card)] sm:p-7" aria-labelledby="now-title">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        <span className="size-2 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
                        Ahora
                      </p>
                      <h2 id="now-title" className="mt-2 text-[clamp(1.55rem,5vw,2.45rem)] text-[var(--color-ink)]">
                        {urgentCount > 0
                          ? `${urgentCount} ${urgentCount === 1 ? "cuidado necesita" : "cuidados necesitan"} tu atención`
                          : "Todo al día por ahora"}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-base">
                        {urgentCount > 0
                          ? "Revisa los avisos activos y deja registrada cada acción cuando la completes."
                          : "Puedes consultar tus citas o revisar la cartilla de cualquier mascota cuando lo necesites."}
                      </p>
                    </div>
                    <Link
                      to="/appointments"
                      className="ui-contrast-action ui-lift inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start whitespace-nowrap rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 font-bold no-underline sm:self-auto"
                    >
                      <CalendarIcon />
                      Ver mis citas
                    </Link>
                  </div>
                </section>

                <section className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-7" aria-labelledby="upcoming-title">
                  <div className="flex flex-col gap-5 border-b border-[var(--color-rule)] pb-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">Próximamente</p>
                      <h2 id="upcoming-title" className="mt-2 text-2xl sm:text-3xl">Siguientes cuidados</h2>
                      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">
                        Una prioridad por mascota, calculada desde sus citas y su plan preventivo.
                      </p>
                    </div>

                    {reminderFeed && (
                      <fieldset className="grid gap-3 text-sm text-[var(--color-ink-soft)]" disabled={savingPreferences}>
                        <legend className="sr-only">Preferencias de recordatorios</legend>
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
                          <input
                            type="checkbox"
                            className="size-5 shrink-0 accent-[var(--color-accent)]"
                            checked={reminderFeed.preferences.enabled}
                            onChange={(event) => void updatePreferences(event.target.checked, reminderFeed.preferences.leadDays)}
                          />
                          Notificaciones en la aplicación
                        </label>
                        <label className="flex min-h-11 items-center gap-2 font-semibold">
                          <span>Avisar con</span>
                          <select
                            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-rule-strong)] bg-[var(--color-surface-raised)] px-3 text-[var(--color-ink)]"
                            value={reminderFeed.preferences.leadDays}
                            onChange={(event) => void updatePreferences(reminderFeed.preferences.enabled, Number(event.target.value))}
                            aria-label="Días de antelación del aviso"
                          >
                            {[7, 14, 30, 60].map((days) => <option key={days} value={days}>{days} días</option>)}
                          </select>
                        </label>
                      </fieldset>
                    )}
                  </div>

                  <div className="mt-5" aria-live="polite">
                    {savingPreferences && <p className="text-sm text-[var(--color-ink-soft)]">Guardando preferencias…</p>}
                    {actionError && <p className="rounded-[var(--radius-control)] border border-[var(--color-error)] p-3 text-sm font-semibold text-[var(--color-error)]" role="alert">{actionError}</p>}
                  </div>

                  {reminderFeed?.preferences.enabled ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {nextByPet.map((reminder) => {
                        const isPending = pendingReminderId === reminder.id;
                        return (
                          <article key={reminder.id} className="flex min-w-0 flex-col rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-surface-raised)] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                              {reminder.petName} · {reminder.source === "APPOINTMENT" ? "Cita" : "Prevención"}
                            </p>
                            <h3 className="mt-2 text-xl">{reminder.title}</h3>
                            <time className="mt-2 text-sm font-semibold text-[var(--color-ink-soft)]" dateTime={reminder.dueAt}>
                              {new Date(reminder.dueAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                            </time>
                            {reminder.notifyNow && (
                              <span className="mt-3 w-fit rounded-[var(--radius-pill)] border border-[var(--color-warning)] px-3 py-1 text-xs font-bold text-[var(--color-warning)]">
                                Aviso activo
                              </span>
                            )}
                            <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                              <button type="button" disabled={pendingReminderId !== null} onClick={() => void reminderAction(reminder.id, "complete")} className="ui-contrast-action min-h-11 whitespace-nowrap rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-2 text-sm font-bold disabled:cursor-wait disabled:opacity-60">
                                {isPending ? "Actualizando…" : "Completar"}
                              </button>
                              <button type="button" disabled={pendingReminderId !== null} onClick={() => void reminderAction(reminder.id, "postpone")} className="min-h-11 whitespace-nowrap rounded-[var(--radius-control)] border border-[var(--color-warning)] px-3 py-2 text-sm font-bold text-[var(--color-warning)] disabled:cursor-wait disabled:opacity-60">
                                Posponer 7 días
                              </button>
                              <Link to={`/pets/${reminder.petId}/health`} className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[var(--radius-control)] border border-[var(--color-accent)] px-3 py-2 text-sm font-bold text-[var(--color-accent)] no-underline">
                                Abrir cartilla
                              </Link>
                              <button type="button" disabled={pendingReminderId !== null} onClick={() => void reminderAction(reminder.id, "cancel")} className="min-h-11 whitespace-nowrap rounded-[var(--radius-control)] px-3 py-2 text-sm font-bold text-[var(--color-error)] underline decoration-current underline-offset-4 disabled:cursor-wait disabled:opacity-60">
                                Cancelar aviso
                              </button>
                            </div>
                          </article>
                        );
                      })}
                      {nextByPet.length === 0 && (
                        <p className="md:col-span-2 rounded-[var(--radius-control)] border border-dashed border-[var(--color-rule-strong)] p-5 text-sm text-[var(--color-ink-soft)]" role="status">
                          No hay acciones pendientes. Cuando haya una cita o cuidado próximo, aparecerá aquí.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-5 rounded-[var(--radius-control)] border border-dashed border-[var(--color-rule-strong)] p-5 text-sm text-[var(--color-ink-soft)]" role="status">
                      Los recordatorios están pausados. Activa las notificaciones para ver aquí las próximas prioridades.
                    </p>
                  )}
                </section>
              </div>

              <aside className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-7" aria-labelledby="pets-title">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">Mascotas</p>
                <h2 id="pets-title" className="mt-2 text-2xl sm:text-3xl">Tu familia</h2>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  Entra en cada perfil para consultar su cartilla y sus datos de salud.
                </p>

                <div className="mt-6">
                  {pets.length > 0 ? (
                    <PetAvatarGrid pets={pets} />
                  ) : (
                    <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--color-rule-strong)] p-5" role="status">
                      <h3 className="text-lg">Todavía no tienes mascotas</h3>
                      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                        Añade la primera para empezar a gestionar su cartilla.
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  to="/pet-register"
                  className="ui-contrast-action ui-lift ui-hover-accent-fill mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 font-bold no-underline"
                >
                  <PawIcon />
                  Añadir mascota
                </Link>
              </aside>
            </div>
          </AsyncContent>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function UserHome() {
  return <UserHomeContent />;
}
