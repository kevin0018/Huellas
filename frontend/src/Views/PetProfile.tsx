/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 · genre: playful · macrostructure: Split Studio · theme: Huellas · enrichment: existing pet avatar · nav/footer: preserved · contrast: pass (40–41) · slop: pass (42–57) */
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";
import NavBar from "../Components/NavBar";
import { applicationServices } from "../composition/applicationServices";
import { AuthService } from "../modules/auth/infra/AuthService";
import {
  getPetSizeLabel,
  getPetTypeLabel,
  getSexLabel,
  type Pet,
} from "../modules/pet/domain/Pet";
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
  return (
    <div className="min-w-0 py-4 md:px-5 md:first:pl-0 md:last:pr-0 md:not-first:border-l md:not-first:border-[var(--color-rule)]">
      <h3 className="flex items-center gap-2 font-nunito text-sm font-bold tracking-normal text-[var(--color-ink)]">
        <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${signalClassName}`} />
        {label}
      </h3>
      <p className={`mt-2 whitespace-pre-wrap text-sm ${value ? "text-[var(--color-ink-soft)]" : "text-[var(--color-muted)]"}`}>
        {value || "Sin registrar"}
      </p>
    </div>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PetProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repository = applicationServices.pets;
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const petId = Number(id);
    if (!petId || Number.isNaN(petId)) {
      setError("Identificador de mascota inválido");
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
          setError(caught instanceof Error ? caught.message : "No se pudo cargar la mascota");
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
    ? pet.passportNumber || "Sí, sin número registrado"
    : "No";

  return (
    <>
      <NavBar />
      <main className="relative min-h-[calc(100dvh-var(--nav-height))] bg-[var(--color-paper)] px-[var(--page-gutter)] py-8 text-[var(--color-ink)] sm:py-12">
        <div aria-hidden="true" className="bg-dogs-userhome-mobile pointer-events-none fixed inset-0 bg-repeat opacity-45 md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop" />

        <div className="relative z-10 mx-auto w-full max-w-[var(--page-max)]">
          <header className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-[var(--color-rule-strong)] pb-6 sm:gap-5">
            <GoBackButton
              className="mt-1 min-h-11 border-[var(--color-rule-strong)] bg-[var(--color-surface-raised)] text-[var(--color-ink)] [&>span]:hidden sm:[&>span]:inline"
              hideIfNoHistory
              variant="outline"
            />

            <div className="flex min-w-0 items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-caprasimo text-[clamp(2.25rem,7vw,4.25rem)] text-[var(--color-ink)]">
                  {pet?.name || "Perfil de mascota"}
                </h1>
                <p className="mt-2 max-w-[65ch] text-[var(--color-ink-soft)]">
                  {pet
                    ? `${getPetTypeLabel(pet.type)} · ${pet.race || "Raza sin registrar"} · ${getSexLabel(pet.sex)}`
                    : "Consulta su identidad, información importante y accesos de salud."}
                </p>
              </div>

              {pet && (
                <span aria-hidden="true" className="avatar-circle size-16 shrink-0 bg-[var(--color-surface-raised)] sm:size-24">
                  <img alt="" className="size-full object-contain" height="96" src="/media/pfp_sample.svg" width="96" />
                </span>
              )}
            </div>
          </header>

          <div className="mt-8">
            <AsyncContent
              empty={!pet}
              emptyDescription="Comprueba el enlace o vuelve a la lista de mascotas."
              emptyTitle="No se encontró la mascota"
              error={error}
              loading={loading}
              loadingLabel="Cargando mascota…"
              onRetry={() => setReloadVersion((current) => current + 1)}
            >
              {pet && (
                <div className="grid gap-10">
                  <section aria-labelledby="critical-information-title" className="border-y border-[var(--color-rule-strong)]">
                    <div className="pt-5">
                      <h2 className="font-nunito text-xl font-bold tracking-normal" id="critical-information-title">
                        Información importante
                      </h2>
                      <p className="mt-1 max-w-[65ch] text-sm text-[var(--color-ink-soft)]">
                        Datos que conviene revisar antes de una consulta o tratamiento.
                      </p>
                    </div>

                    <div className="mt-2 divide-y divide-[var(--color-rule)] md:grid md:grid-cols-3 md:divide-y-0">
                      <CriticalDetail label="Alergias" signalClassName="bg-[var(--color-error)]" value={pet.allergies} />
                      <CriticalDetail label="Medicación activa" signalClassName="bg-[var(--color-warning)]" value={pet.activeMedications} />
                      <CriticalDetail label="Condiciones relevantes" signalClassName="bg-[var(--color-accent)]" value={pet.medicalConditions} />
                    </div>
                  </section>

                  <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,5fr)] lg:items-start">
                    <section aria-labelledby="pet-details-title" className="min-w-0">
                      <h2 className="font-nunito text-2xl font-bold tracking-normal" id="pet-details-title">Ficha de identidad</h2>
                      <p className="mt-1 max-w-[65ch] text-sm text-[var(--color-ink-soft)]">
                        La información básica que identifica a {pet.name}.
                      </p>

                      <dl className="mt-5 border-t border-[var(--color-rule-strong)]">
                        <ProfileDetail label="Tipo" value={getPetTypeLabel(pet.type)} />
                        <ProfileDetail label="Raza" value={pet.race || "Sin registrar"} />
                        <ProfileDetail label="Sexo" value={getSexLabel(pet.sex)} />
                        <ProfileDetail label="Fecha de nacimiento" value={formatDate(pet.birthDate)} />
                        <ProfileDetail label="Tamaño" value={getPetSizeLabel(pet.size)} />
                        <ProfileDetail label="Microchip" value={pet.microchipCode || "Sin registrar"} />
                        <ProfileDetail label="Pasaporte" value={passport} />
                        <ProfileDetail label="País de origen" value={pet.countryOfOrigin || "Sin registrar"} />
                      </dl>
                    </section>

                    <aside className="grid gap-8" aria-label="Acciones y notas de la mascota">
                      <section className="rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6" aria-labelledby="pet-actions-title">
                        <h2 className="font-nunito text-xl font-bold tracking-normal" id="pet-actions-title">Qué quieres consultar</h2>
                        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                          La cartilla reúne su historial sanitario, documentos y próximas acciones.
                        </p>

                        <div className="mt-5 grid gap-3">
                          <Link className="ui-button no-underline" to={`/pets/${pet.id}/health`}>
                            Abrir cartilla
                          </Link>
                          <Link className="ui-button ui-button--secondary no-underline" to={`/procedures-view/${pet.id}`}>
                            Ver procedimientos
                          </Link>
                          <Link className="ui-button ui-button--secondary no-underline" to={`/pets/${pet.id}/edit`}>
                            Editar datos
                          </Link>
                        </div>
                      </section>

                      <section className="border-t border-[var(--color-rule-strong)] pt-5" aria-labelledby="pet-notes-title">
                        <h2 className="font-nunito text-xl font-bold tracking-normal" id="pet-notes-title">Notas</h2>
                        <p className={`mt-3 whitespace-pre-wrap ${pet.notes ? "text-[var(--color-ink-soft)]" : "text-[var(--color-muted)]"}`}>
                          {pet.notes || "Sin notas adicionales."}
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
