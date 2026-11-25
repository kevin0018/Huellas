import { messageFromError, translateMessage, type LocalizedMessage } from '../i18n/message';
import { localeByLanguage } from '../i18n/locale';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Tinta from "../shared/ui/Tinta";
import CareIcon from "../shared/ui/CareIcon";
import Footer from "../Components/footer";
import { PetAvatarGrid } from "../Components/pet/PetAvatarGrid";
import { applicationServices, type ReminderFeed } from "../composition/applicationServices.js";
import { useTranslation } from "../i18n/hooks/hook";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { User } from "../modules/auth/domain/User";
import type { Pet } from "../modules/pet/domain/Pet";
import { AsyncContent } from "../shared/ui/AsyncContent.js";

const { pets: petRepository, reminders: reminderRepository } = applicationServices;

function UserHomeContent() {
  const { translate, currentLanguage } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocalizedMessage | null>(null);
  const [reminderFeed, setReminderFeed] = useState<ReminderFeed | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [pendingReminderId, setPendingReminderId] = useState<number | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [actionError, setActionError] = useState<LocalizedMessage | null>(null);

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
          setError(messageFromError(requestError, 'loadDashboardError'));
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
      setActionError(messageFromError(requestError, 'updateReminderError'));
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
      setActionError(messageFromError(requestError, 'saveReminderPreferencesError'));
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
      <main className="care-page">
        <div className="care-shell">
          <header className="care-hero care-hero--dashboard">
            <div className="care-hero__copy">
              <p className="care-hero__label">{translate('hello')}, {user.name}</p>
              <h1 className="care-hero__title">{translate('careAgenda')}</h1>
              <p className="care-hero__description">{translate('homePageSubtitle')}</p>
            </div>
            <div className="care-hero__companion"><Tinta /></div>
            {!loading && !error && (
              <section className="care-today" aria-labelledby="now-title" data-attention={urgentCount > 0}>
                <p className="care-today__label">
                  <span aria-hidden="true">{urgentCount > 0 ? '!' : '✓'}</span>{translate('now')}
                </p>
                <h2 id="now-title">
                  {urgentCount > 0
                    ? translate(urgentCount === 1 ? 'urgentCareOne' : 'urgentCareMany', { count: urgentCount })
                    : translate('allCareCurrent')}
                </h2>
                <p className="care-today__description">
                  {translate(urgentCount > 0 ? 'urgentCareDescription' : 'currentCareDescription')}
                </p>
                <Link className="care-today__link" to="/appointments">
                  <CareIcon name="calendar" />{translate('myAppointmentsLink')}
                </Link>
              </section>
            )}
          </header>

          <AsyncContent
            loading={loading}
            error={translateMessage(error, translate)}
            empty={false}
            loadingLabel={translate("loading")}
            emptyTitle=""
            onRetry={() => setReloadVersion((current) => current + 1)}
          >
            <div className="care-dashboard">
              <section className="care-family" aria-labelledby="pets-title">
                <div className="care-section-heading">
                  <div>
                    <h2 className="care-section-title" id="pets-title">{translate('yourFamily')}</h2>
                    <p className="care-section-description">{translate('familyDescription')}</p>
                  </div>
                  <Link className="ui-button ui-button--secondary whitespace-nowrap no-underline" to="/pet-register">
                    <CareIcon name="paw" />{translate('addPetTitle')}
                  </Link>
                </div>
                {pets.length > 0 ? <PetAvatarGrid pets={pets} /> : (
                  <div className="care-empty" role="status">
                    <h3 className="text-lg">{translate('noPetsYet')}</h3>
                    <p className="care-section-description">{translate('addFirstPet')}</p>
                  </div>
                )}
              </section>

              <section className="care-agenda" aria-labelledby="upcoming-title">
                <div className="care-section-heading">
                  <div>
                    <h2 id="upcoming-title" className="care-section-title">{translate('upcomingCare')}</h2>
                    <p className="care-section-description">
                      {translate('upcomingCareDescription')}
                    </p>
                  </div>

                  {reminderFeed && (
                    <fieldset className="care-reminder-settings" disabled={savingPreferences}>
                      <legend className="sr-only">{translate('reminderPreferences')}</legend>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
                        <input
                          type="checkbox"
                          className="size-5 shrink-0 accent-[var(--color-accent)]"
                          checked={reminderFeed.preferences.enabled}
                          onChange={(event) => void updatePreferences(event.target.checked, reminderFeed.preferences.leadDays)}
                        />
                        {translate('inAppNotifications')}
                      </label>
                      <label className="flex min-h-11 items-center gap-2 font-semibold">
                        <span>{translate('notifyInAdvance')}</span>
                        <select
                          className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-rule-strong)] bg-[var(--color-surface-raised)] px-3 text-[var(--color-ink)]"
                          value={reminderFeed.preferences.leadDays}
                          onChange={(event) => void updatePreferences(reminderFeed.preferences.enabled, Number(event.target.value))}
                          aria-label={translate('reminderLeadDays')}
                        >
                          {[7, 14, 30, 60].map((days) => <option key={days} value={days}>{translate('dayCount', { count: days })}</option>)}
                        </select>
                      </label>
                    </fieldset>
                  )}
                </div>

                <div className="mt-5" aria-live="polite">
                  {savingPreferences && <p className="text-sm text-[var(--color-ink-soft)]">{translate('savingPreferences')}</p>}
                  {actionError && <p className="rounded-[var(--radius-control)] border border-[var(--color-error)] p-3 text-sm font-semibold text-[var(--color-error)]" role="alert">{translateMessage(actionError, translate)}</p>}
                </div>

                {reminderFeed?.preferences.enabled ? (
                  <div className="care-reminder-list">
                    {nextByPet.map((reminder) => {
                      const isPending = pendingReminderId === reminder.id;
                      return (
                        <article key={reminder.id} className="care-reminder" data-attention={reminder.notifyNow}>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {reminder.petName} · {reminder.source === "APPOINTMENT" ? translate('reminderAppointment') : translate('prevention')}
                          </p>
                          <h3 className="mt-2 text-xl">{reminder.title}</h3>
                          <time className="mt-2 text-sm font-semibold text-[var(--color-ink-soft)]" dateTime={reminder.dueAt}>
                            {new Date(reminder.dueAt).toLocaleDateString(localeByLanguage[currentLanguage], { day: "numeric", month: "long", year: "numeric" })}
                          </time>
                          {reminder.notifyNow && (
                            <span className="care-status mt-3">
                              <span aria-hidden="true">!</span><span>{translate('activeReminder')}</span>
                            </span>
                          )}
                          <div className="care-reminder__actions">
                            <button type="button" disabled={pendingReminderId !== null} onClick={() => void reminderAction(reminder.id, "complete")} className="ui-contrast-action min-h-11 whitespace-nowrap rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-2 text-sm font-bold disabled:cursor-wait disabled:opacity-60">
                              {isPending ? translate('updating') : translate('complete')}
                            </button>
                            <button type="button" disabled={pendingReminderId !== null} onClick={() => void reminderAction(reminder.id, "postpone")} className="min-h-11 whitespace-nowrap rounded-[var(--radius-control)] border border-[var(--color-warning)] px-3 py-2 text-sm font-bold text-[var(--color-warning)] disabled:cursor-wait disabled:opacity-60">
                              {translate('postponeWeek')}
                            </button>
                            <Link to={`/pets/${reminder.petId}/health`} className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[var(--radius-control)] border border-[var(--color-accent)] px-3 py-2 text-sm font-bold text-[var(--color-accent)] no-underline">
                              {translate('openHealthBook')}
                            </Link>
                            <button type="button" disabled={pendingReminderId !== null} onClick={() => void reminderAction(reminder.id, "cancel")} className="min-h-11 whitespace-nowrap rounded-[var(--radius-control)] px-3 py-2 text-sm font-bold text-[var(--color-error)] underline decoration-current underline-offset-4 disabled:cursor-wait disabled:opacity-60">
                              {translate('cancelReminder')}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                    {nextByPet.length === 0 && (
                      <p className="care-empty col-span-full" role="status">
                        {translate('noPendingCare')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="care-empty mt-5" role="status">
                    {translate('remindersPaused')}
                  </p>
                )}
              </section>
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
