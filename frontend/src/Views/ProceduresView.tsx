/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 · genre: playful · macrostructure: Stat-Led · theme: Huellas · enrichment: existing pet avatar · nav/footer: preserved · contrast: pass (40–41) · slop: 58/58 pass · mobile: pass (34, 49, 50–57) */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../Components/footer';
import { ArrowLeftIcon } from '../Components/GoBackButton';
import NavBar from '../Components/NavBar';
import ProcedureCard from '../Components/ProcedureCard';
import ProcedureModal from '../Components/ProceduresModal';
import { getPetImageUrl } from '../Components/pet/petImage';
import { applicationServices } from '../composition/applicationServices.js';
import type { Pet } from '../modules/pet/domain/Pet.js';
import type { PetProcedure } from '../modules/pet/domain/PetProcedure.js';
import { AsyncContent } from '../shared/ui/AsyncContent.js';

const { checkups: checkupRepository, pets: petRepository } = applicationServices;

const dateValue = (value?: string | null) => value ? new Date(value).getTime() : null;

function ProceduresView() {
  const petId = Number(useParams<{ petId: string }>().petId);
  const [pet, setPet] = useState<Pet | null>(null);
  const [procedures, setProcedures] = useState<PetProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<PetProcedure | null>(null);

  const loadData = useCallback(async () => {
    if (!Number.isInteger(petId) || petId <= 0) {
      setError('Identificador de mascota inválido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [procedureData, currentPet] = await Promise.all([
        petRepository.getPetProcedures(petId),
        petRepository.getPetById(petId),
      ]);
      setProcedures(procedureData);
      setPet(currentPet);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el plan preventivo');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => { void loadData(); }, [loadData]);

  const groupedProcedures = useMemo(() => ({
    attention: procedures
      .filter(({ status }) => status === 'MISSING')
      .sort((a, b) => (dateValue(a.dueAt) ?? Number.POSITIVE_INFINITY) - (dateValue(b.dueAt) ?? Number.POSITIVE_INFINITY)),
    current: procedures
      .filter(({ status }) => status === 'DONE')
      .sort((a, b) => (dateValue(b.lastOccurredAt) ?? Number.NEGATIVE_INFINITY) - (dateValue(a.lastOccurredAt) ?? Number.NEGATIVE_INFINITY)),
    upcoming: procedures
      .filter(({ status }) => status === 'UPCOMING')
      .sort((a, b) => (dateValue(a.dueAt) ?? Number.POSITIVE_INFINITY) - (dateValue(b.dueAt) ?? Number.POSITIVE_INFINITY)),
  }), [procedures]);

  const needsAttention = groupedProcedures.attention.length;
  const scheduledCount = needsAttention + groupedProcedures.upcoming.length;

  const handleOpenEditModal = (procedure: PetProcedure) => {
    setEditingProcedure(procedure);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcedure(null);
  };

  const onModalSubmit = async (
    procedureId: number,
    checkupId?: number,
    checkupDate?: string,
    checkupNotes?: string,
  ) => {
    if (checkupId) {
      await checkupRepository.update(checkupId, { petId, date: checkupDate, notes: checkupNotes });
    } else {
      await checkupRepository.create(petId, { procedureId, notes: checkupNotes, date: checkupDate });
    }
    await loadData();
  };

  return (
    <>
      <NavBar />
      <main className="relative min-h-[calc(100dvh-var(--nav-height))] overflow-x-clip bg-[var(--color-paper)] px-[var(--page-gutter)] py-8 text-[var(--color-ink)] sm:py-12">
        <div aria-hidden="true" className="bg-dogs-userhome-mobile pointer-events-none fixed inset-0 bg-repeat opacity-40 dark:opacity-10 md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop" />
        <div className="relative z-10 mx-auto w-full max-w-[var(--page-max)]">
          <header className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--color-rule-strong)] pb-6 sm:gap-6">
            <div className="min-w-0">
              <nav aria-label="Ruta de navegación">
                <Link className="ui-hover-accent inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] pr-3 text-sm font-bold text-[var(--color-accent)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]" to={`/pets/${petId}`}>
                  <ArrowLeftIcon className="size-4" /> Perfil de mascota
                </Link>
              </nav>
              <h1 className="mt-1 min-w-0 break-words font-caprasimo text-[clamp(2.15rem,7vw,4.25rem)] leading-[1.05]">
                Prevención{pet ? ` de ${pet.name}` : ''}
              </h1>
              <p className="mt-2 max-w-[65ch] text-[var(--color-ink-soft)]">
                Vacunas, desparasitaciones y revisiones ordenadas por lo que conviene atender primero.
              </p>
            </div>
            {pet && (
              <span aria-hidden="true" className="avatar-circle size-20 shrink-0 bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] sm:size-28 lg:size-32">
                <img alt="" className="size-full object-cover" height="128" src={getPetImageUrl(pet)} width="128" />
              </span>
            )}
          </header>

          <AsyncContent
            empty={procedures.length === 0}
            emptyDescription="El plan se genera según el tipo y la edad de la mascota. Revisa sus datos o inténtalo de nuevo más tarde."
            emptyTitle="Todavía no hay cuidados preventivos"
            error={error}
            loading={loading}
            loadingLabel="Calculando el plan preventivo…"
            onRetry={loadData}
          >
            <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(14rem,0.75fr)_minmax(0,2.25fr)] lg:items-start lg:gap-12">
              <aside aria-labelledby="attention-summary" className="min-w-0 border-b border-[var(--color-rule-strong)] pb-7 lg:sticky lg:top-24 lg:border-b-0 lg:border-r lg:pb-2 lg:pr-10">
                <p className={`font-caprasimo text-[clamp(4.75rem,17vw,7rem)] leading-[0.9] tabular-nums ${needsAttention > 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
                  {needsAttention}
                </p>
                <h2 className="mt-4 font-nunito text-2xl font-bold leading-tight tracking-normal" id="attention-summary">
                  {needsAttention === 1 ? 'cuidado necesita atención' : 'cuidados necesitan atención'}
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-6 text-[var(--color-ink-soft)]">
                  {needsAttention > 0
                    ? 'Empieza por los vencidos. Al registrar su realización, el plan recalcula la próxima fecha.'
                    : 'No hay cuidados vencidos. Puedes revisar lo próximo o corregir un registro anterior.'}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--color-rule)] pt-5 text-sm">
                  <div>
                    <dt className="text-[var(--color-muted)]">En agenda</dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums">{scheduledCount}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted)]">Al día</dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums">{groupedProcedures.current.length}</dd>
                  </div>
                </dl>
                <p className="mt-6 text-sm leading-5 text-[var(--color-muted)]">
                  Las fechas son orientativas y se derivan de los registros de la cartilla. Confirma cualquier pauta con tu veterinario.
                </p>
              </aside>

              <div className="grid min-w-0 gap-10">
                <section aria-labelledby="attention-title" className="min-w-0">
                  <div className="border-b border-[var(--color-rule-strong)] pb-4">
                    <h2 className="font-caprasimo text-[var(--text-xl)] leading-tight" id="attention-title">Necesita atención</h2>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">Cuidados que ya han superado su fecha orientativa.</p>
                  </div>
                  {groupedProcedures.attention.length > 0
                    ? <div>{groupedProcedures.attention.map((procedure, index) => <ProcedureCard emphasis={index === 0} key={procedure.id} onEdit={handleOpenEditModal} procedure={procedure} />)}</div>
                    : <p className="border-b border-[var(--color-rule)] py-6 text-sm font-semibold text-[var(--color-success)]" role="status">Ningún cuidado vencido.</p>}
                </section>

                <section aria-labelledby="upcoming-title" className="min-w-0">
                  <div className="border-b border-[var(--color-rule-strong)] pb-4">
                    <h2 className="font-caprasimo text-[var(--text-xl)] leading-tight" id="upcoming-title">Próximamente</h2>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">Lo siguiente que conviene preparar, de más cercano a más lejano.</p>
                  </div>
                  {groupedProcedures.upcoming.length > 0
                    ? <div>{groupedProcedures.upcoming.map((procedure) => <ProcedureCard key={procedure.id} onEdit={handleOpenEditModal} procedure={procedure} />)}</div>
                    : <p className="border-b border-[var(--color-rule)] py-6 text-sm text-[var(--color-muted)]" role="status">No hay cuidados próximos.</p>}
                </section>

                <section aria-labelledby="current-title" className="min-w-0">
                  <div className="border-b border-[var(--color-rule-strong)] pb-4">
                    <h2 className="font-caprasimo text-[var(--text-xl)] leading-tight" id="current-title">Al día</h2>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">Registros vigentes o cuidados sin una nueva recurrencia pendiente.</p>
                  </div>
                  {groupedProcedures.current.length > 0
                    ? <div>{groupedProcedures.current.map((procedure) => <ProcedureCard compact key={procedure.id} onEdit={handleOpenEditModal} procedure={procedure} />)}</div>
                    : <p className="border-b border-[var(--color-rule)] py-6 text-sm text-[var(--color-muted)]" role="status">Aún no hay cuidados registrados como realizados.</p>}
                </section>
              </div>
            </div>
          </AsyncContent>
        </div>

        {isModalOpen && editingProcedure && (
          <ProcedureModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onModalSubmit={onModalSubmit}
            procedure={editingProcedure}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

export default ProceduresView;
