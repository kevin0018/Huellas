/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 · genre: playful · macrostructure: Split Studio · theme: Huellas · enrichment: existing pet avatar · nav/footer: preserved · contrast: pass (40–41) · slop: pass (42–57) */
import { translateMessage, type LocalizedMessage } from '../i18n/message';
import { localeByLanguage } from '../i18n/locale';
import { useTranslation } from '../i18n/hooks/hook';
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../Components/footer";
import { ArrowLeftIcon } from "../Components/GoBackButton";
import NavBar from "../Components/NavBar";
import { getPetImageUrl } from "../Components/pet/petImage";
import { applicationServices } from "../composition/applicationServices";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { Pet } from "../modules/pet/domain/Pet";
import { petTypeTranslationKeys, petSizeTranslationKeys, petSexTranslationKeys } from "../features/pets/petPresentation";
import { AsyncContent } from "../shared/ui/AsyncContent";

type ProfileDetailProps = {
  label: string;
  value: ReactNode;
};

function ProfileDetail({ label, value }: ProfileDetailProps) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-rule)] py-4 last:border-b-0 sm:grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-5">
      <dt className="text-sm font-bold text-[var(--color-muted)]">{label}</dt>
      <dd className="min-w-0 break-words text-[var(--color-ink)] sm:text-right">{value}</dd>
    </div>
  );
}

type CriticalDetailProps = {
  label: string;
  value?: string | null;
  signalClassName: string;
};

function CriticalDetail({ label, value, signalClassName }: CriticalDetailProps) {
  const { translate } = useTranslation();
  return (
    <div className="min-w-0 py-4 md:px-5 md:first:pl-0 md:last:pr-0 md:not-first:border-l md:not-first:border-[var(--color-rule)]">
      <h3 className="flex items-center gap-2 font-nunito text-sm font-bold tracking-normal text-[var(--color-ink)]">
        <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${signalClassName}`} />
        {label}
      </h3>
      <p className={`mt-2 whitespace-pre-wrap text-sm ${value ? "text-[var(--color-ink-soft)]" : "text-[var(--color-muted)]"}`}>
        {value || translate('notRecorded')}
      </p>
    </div>
  );
}

function formatDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PetProfile() {
  const { translate, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repository = applicationServices.pets;
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocalizedMessage | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const petId = Number(id);
    if (!petId || Number.isNaN(petId)) {
      setError({ translationKey: 'invalidPetId' });
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await repository.getPetById(petId);
        if (!cancelled) setPet(data);
      } catch (caught) {
        if (String(caught instanceof Error ? caught.message : "").toLowerCase().includes("unauthorized")) {
          navigate("/login");
          return;
        }
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : { translationKey: 'loadPetError' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, reloadVersion, repository]);

  const passport = pet?.hasPassport
    ? pet.passportNumber || translate('passportWithoutNumber')
    : translate('no');

  return (
    <>
      <NavBar />
      <main className="relative min-h-[calc(100dvh-var(--nav-height))] bg-[var(--color-paper)] px-[var(--page-gutter)] py-8 text-[var(--color-ink)] sm:py-12">
        <div aria-hidden="true" className="bg-dogs-userhome-mobile pointer-events-none fixed inset-0 bg-repeat opacity-45 dark:opacity-10 md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop" />

        <div className="relative z-10 mx-auto w-full max-w-[var(--page-max)]">
          <header className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--color-rule-strong)] pb-6 sm:gap-5">
            <div className="min-w-0">
              <nav aria-label={translate('breadcrumbs')}>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] pr-3 text-sm font-bold text-[var(--color-accent)] no-underline transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                  to="/user-home"
                >
                  <ArrowLeftIcon className="size-4" />
                  {translate('yourPets')}
                </Link>
              </nav>

              <h1 className="mt-1 font-caprasimo text-[clamp(2.25rem,7vw,4.25rem)] text-[var(--color-ink)]">
                {pet?.name || translate('petProfile')}
              </h1>
              <p className="mt-2 max-w-[65ch] text-[var(--color-ink-soft)]">
                {pet
                  ? `${translate(petTypeTranslationKeys[pet.type])} · ${pet.race || translate('unrecordedBreed')} · ${translate(petSexTranslationKeys[pet.sex])}`
                  : translate('petProfileDescription')}
              </p>
            </div>

            {pet && (
              <span aria-hidden="true" className="avatar-circle size-20 shrink-0 bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] sm:size-28 lg:size-32">
                <img alt="" className="size-full object-cover" height="128" src={getPetImageUrl(pet)} width="128" />
              </span>
            )}
          </header>

          <div className="mt-8">
            <AsyncContent
              empty={!pet}
              emptyDescription={translate('petNotFoundDescription')}
              emptyTitle={translate('petNotFound')}
              error={translateMessage(error, translate)}
              loading={loading}
              loadingLabel={translate('loadingPet')}
              onRetry={() => setReloadVersion((current) => current + 1)}
            >
              {pet && (
                <div className="grid gap-10">
                  <section aria-labelledby="critical-information-title" className="rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface)] px-5 shadow-[var(--shadow-card)] sm:px-6">
                    <div className="pt-5">
                      <h2 className="font-nunito text-xl font-bold tracking-normal" id="critical-information-title">
                        {translate('importantInformation')}
                      </h2>
                      <p className="mt-1 max-w-[65ch] text-sm text-[var(--color-ink-soft)]">
                        {translate('criticalInformationDescription')}
                      </p>
                    </div>

                    <div className="mt-2 divide-y divide-[var(--color-rule)] md:grid md:grid-cols-3 md:divide-y-0">
                      <CriticalDetail label={translate('allergies')} signalClassName="bg-[var(--color-error)]" value={pet.allergies} />
                      <CriticalDetail label={translate('activeMedications')} signalClassName="bg-[var(--color-warning)]" value={pet.activeMedications} />
                      <CriticalDetail label={translate('medicalConditions')} signalClassName="bg-[var(--color-accent)]" value={pet.medicalConditions} />
                    </div>
                  </section>

                  <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,5fr)] lg:items-start">
                    <section aria-labelledby="pet-details-title" className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
                      <h2 className="font-nunito text-2xl font-bold tracking-normal" id="pet-details-title">{translate('petIdentity')}</h2>
                      <p className="mt-1 max-w-[65ch] text-sm text-[var(--color-ink-soft)]">
                        {translate('petIdentityDescription', { pet: pet.name })}
                      </p>

                      <dl className="mt-5 border-t border-[var(--color-rule-strong)]">
                        <ProfileDetail label={translate('healthType')} value={translate(petTypeTranslationKeys[pet.type])} />
                        <ProfileDetail label={translate('breed')} value={pet.race || translate('notRecorded')} />
                        <ProfileDetail label={translate('petSex')} value={translate(petSexTranslationKeys[pet.sex])} />
                        <ProfileDetail label={translate('birthDate')} value={formatDate(pet.birthDate, localeByLanguage[currentLanguage])} />
                        <ProfileDetail label={translate('petSize')} value={translate(petSizeTranslationKeys[pet.size])} />
                        <ProfileDetail label={translate('microchip')} value={pet.microchipCode || translate('notRecorded')} />
                        <ProfileDetail label={translate('passport')} value={passport} />
                        <ProfileDetail label={translate('countryOfOrigin')} value={pet.countryOfOrigin || translate('notRecorded')} />
                      </dl>
                    </section>

                    <aside className="grid gap-8" aria-label={translate('petActionsAndNotes')}>
                      <section className="rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6" aria-labelledby="pet-actions-title">
                        <h2 className="font-nunito text-xl font-bold tracking-normal" id="pet-actions-title">{translate('petActionsTitle')}</h2>
                        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                          {translate('petHealthBookDescription')}
                        </p>

                        <div className="mt-5 grid gap-3">
                          <Link className="ui-button no-underline" to={`/pets/${pet.id}/health`}>
                            {translate('openHealthBook')}
                          </Link>
                          <Link className="ui-button ui-button--secondary no-underline" to={`/procedures-view/${pet.id}`}>
                            {translate('viewProcedures')}
                          </Link>
                          <Link className="ui-button ui-button--secondary no-underline" to={`/pets/${pet.id}/edit`}>
                            {translate('editPetDetails')}
                          </Link>
                        </div>
                      </section>

                      <section className="rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6" aria-labelledby="pet-notes-title">
                        <h2 className="font-nunito text-xl font-bold tracking-normal" id="pet-notes-title">{translate('healthNotes')}</h2>
                        <p className={`mt-3 whitespace-pre-wrap ${pet.notes ? "text-[var(--color-ink-soft)]" : "text-[var(--color-muted)]"}`}>
                          {pet.notes || translate('noPetNotes')}
                        </p>
                      </section>
                    </aside>
                  </div>
                </div>
              )}
            </AsyncContent>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default PetProfile;
