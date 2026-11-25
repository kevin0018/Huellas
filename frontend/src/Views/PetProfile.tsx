/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 · genre: playful · macrostructure: Split Studio · theme: Huellas · enrichment: existing pet avatar · nav/footer: preserved · contrast: pass (40–41) · slop: pass (42–57) */
import { messageFromError, translateMessage, type LocalizedMessage } from '../i18n/message';
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
          setError(messageFromError(caught, 'loadPetError'));
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
      <main className="care-page">
        <div className="care-shell">
          <header className="care-hero care-hero--pet">
            <div className="care-hero__copy">
              <nav aria-label={translate('breadcrumbs')}>
                <Link
                  className="care-hero__back"
                  to="/user-home"
                >
                  <ArrowLeftIcon className="size-4" />
                  {translate('yourPets')}
                </Link>
              </nav>

              <h1 className="care-hero__title">
                {pet?.name || translate('petProfile')}
              </h1>
              <p className="care-hero__description">
                {pet
                  ? `${translate(petTypeTranslationKeys[pet.type])} · ${pet.race || translate('unrecordedBreed')} · ${translate(petSexTranslationKeys[pet.sex])}`
                  : translate('petProfileDescription')}
              </p>
            </div>

            {pet && (
              <span aria-hidden="true" className="care-hero__portrait">
                <img alt="" className="size-full object-cover" height="128" src={getPetImageUrl(pet)} width="128" />
              </span>
            )}
          </header>

          <div>
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
                <div className="grid gap-8">
                  <section aria-labelledby="pet-actions-title" className="care-profile-links">
                    <div>
                      <h2 className="care-section-title" id="pet-actions-title">{translate('petActionsTitle')}</h2>
                      <p className="care-section-description">{translate('petHealthBookDescription')}</p>
                    </div>
                    <div className="care-profile-links__actions">
                      <Link className="ui-button no-underline" to={`/pets/${pet.id}/health`}>{translate('openHealthBook')}</Link>
                      <Link className="ui-button ui-button--secondary no-underline" to={`/procedures-view/${pet.id}`}>{translate('viewProcedures')}</Link>
                      <Link className="ui-button ui-button--secondary no-underline" to={`/pets/${pet.id}/edit`}>{translate('editPetDetails')}</Link>
                    </div>
                  </section>
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

                    <aside aria-label={translate('healthNotes')}>
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
