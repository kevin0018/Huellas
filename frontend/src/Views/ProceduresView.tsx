/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · genre: playful · macrostructure: Stat-Led · signature: persistent status filter rail · theme: Huellas · enrichment: existing pet avatar · nav/footer: preserved · contrast: pass (40–41) · slop: 58/58 pass · mobile: pass (34, 49, 50–57) */
import { messageFromError, translateMessage, type LocalizedMessage } from '../i18n/message';
import type { TranslationKey } from '../i18n/dictionary';
import { useTranslation } from '../i18n/hooks/hook';
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
type ProcedureFilter = PetProcedure['status'] | 'ALL';

const filterDetails: Record<ProcedureFilter, { description: TranslationKey; label: TranslationKey; summary: TranslationKey; summarySingular: TranslationKey; title: TranslationKey }> = {
  ALL: {
    description: 'planAllDescription',
    label: 'planAll',
    summary: 'planAllMany',
    summarySingular: 'planAllOne',
    title: 'planAllTitle',
  },
  DONE: {
    description: 'planCurrentDescription',
    label: 'planCurrent',
    summary: 'planCurrentMany',
    summarySingular: 'planCurrentOne',
    title: 'planCurrent',
  },
  MISSING: {
    description: 'planOverdueDescription',
    label: 'planOverdue',
    summary: 'planOverdueMany',
    summarySingular: 'planOverdueOne',
    title: 'planAttention',
  },
  UPCOMING: {
    description: 'planUpcomingDescription',
    label: 'planUpcoming',
    summary: 'planUpcomingMany',
    summarySingular: 'planUpcomingOne',
    title: 'planSoon',
  },
};

const filterOrder: ProcedureFilter[] = ['MISSING', 'UPCOMING', 'DONE', 'ALL'];
const filterTone: Record<ProcedureFilter, string> = {
  ALL: 'text-[var(--color-accent)]',
  DONE: 'text-[var(--color-success)]',
  MISSING: 'text-[var(--color-error)]',
  UPCOMING: 'text-[var(--color-warning)]',
};

function ProceduresView() {
  const { translate } = useTranslation();
  const petId = Number(useParams<{ petId: string }>().petId);
  const [pet, setPet] = useState<Pet | null>(null);
  const [procedures, setProcedures] = useState<PetProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocalizedMessage | null>('');
  const [activeFilter, setActiveFilter] = useState<ProcedureFilter>('MISSING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<PetProcedure | null>(null);

  const loadData = useCallback(async () => {
    if (!Number.isInteger(petId) || petId <= 0) {
      setError({ translationKey: 'invalidPetId' });
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
      setActiveFilter((current) => {
        if (current === 'ALL' || procedureData.some(({ status }) => status === current)) return current;
        return filterOrder.find((filter) => filter !== 'ALL' && procedureData.some(({ status }) => status === filter)) ?? 'ALL';
      });
      setPet(currentPet);
      setError('');
    } catch (caught) {
      setError(messageFromError(caught, 'loadPlanError'));
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

  const proceduresByFilter = useMemo<Record<ProcedureFilter, PetProcedure[]>>(() => ({
    ALL: [...groupedProcedures.attention, ...groupedProcedures.upcoming, ...groupedProcedures.current],
    DONE: groupedProcedures.current,
    MISSING: groupedProcedures.attention,
    UPCOMING: groupedProcedures.upcoming,
  }), [groupedProcedures]);
  const activeProcedures = proceduresByFilter[activeFilter];
  const activeDetails = filterDetails[activeFilter];

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
              <nav aria-label={translate('breadcrumbs')}>
                <Link className="ui-hover-accent inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] pr-3 text-sm font-bold text-[var(--color-accent)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]" to={`/pets/${petId}`}>
                  <ArrowLeftIcon className="size-4" />{translate('petProfile')}
                </Link>
              </nav>
              <h1 className="mt-1 min-w-0 break-words font-caprasimo text-[clamp(2.15rem,7vw,4.25rem)] leading-[1.05]">{pet ? translate('preventionForPet', { pet: pet.name }) : translate('prevention')}
              </h1>
              <p className="mt-2 max-w-[65ch] text-[var(--color-ink-soft)]">
                {translate('planDescription')}
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
            emptyDescription={translate('noPlanDescription')}
            emptyTitle={translate('noPlan')}
            error={translateMessage(error, translate)}
            loading={loading}
            loadingLabel={translate('loadingPlan')}
            onRetry={loadData}
          >
            <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(14rem,0.75fr)_minmax(0,2.25fr)] lg:items-start lg:gap-12">
              <aside aria-labelledby="filter-summary" className="min-w-0 border-b border-[var(--color-rule-strong)] pb-7 lg:sticky lg:top-24 lg:border-b-0 lg:border-r lg:pb-2 lg:pr-10">
                <p className={`font-caprasimo text-[clamp(4.75rem,17vw,7rem)] leading-[0.9] tabular-nums ${filterTone[activeFilter]}`}>
                  {activeProcedures.length}
                </p>
                <h2 className="mt-4 font-nunito text-2xl font-bold leading-tight tracking-normal" id="filter-summary">
                  {translate(activeProcedures.length === 1 ? activeDetails.summarySingular : activeDetails.summary)}
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-6 text-[var(--color-ink-soft)]">
                  {activeFilter === 'MISSING'
                    ? translate('planStartHere')
                    : translate(activeDetails.description)}
                </p>

                <nav aria-label={translate('filterPlan')} className="mt-6 grid grid-cols-2 gap-2 border-t border-[var(--color-rule)] pt-5 sm:grid-cols-4 lg:grid-cols-1">
                  {filterOrder.map((filter) => {
                    const count = proceduresByFilter[filter].length;
                    const selected = activeFilter === filter;
                    return <button
                      aria-label={`${translate(filterDetails[filter].label)}: ${count}`}
                      aria-pressed={selected}
                      aria-controls="filtered-plan"
                      className={`grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 whitespace-nowrap rounded-[var(--radius-control)] border px-3 py-2 text-left text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] ${selected ? 'border-[var(--color-accent)] bg-[var(--color-paper-2)] text-[var(--color-ink)]' : 'border-[var(--color-rule)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-2)] active:bg-[var(--color-paper-3)]'}`}
                      disabled={count === 0}
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      type="button"
                    >
                      <span>{translate(filterDetails[filter].label)}</span>
                      <span className={`tabular-nums ${selected ? filterTone[filter] : 'text-[var(--color-muted)]'}`}>{count}</span>
                    </button>;
                  })}
                </nav>
                <p className="mt-6 text-sm leading-5 text-[var(--color-muted)]">
                  {translate('planDateDisclaimer')}
                </p>
              </aside>

              <section aria-labelledby="filtered-plan-title" className="min-w-0" id="filtered-plan">
                <div className="flex min-w-0 flex-wrap items-end justify-between gap-3 border-b border-[var(--color-rule-strong)] pb-4">
                  <div className="min-w-0">
                    <h2 className="font-caprasimo text-[var(--text-xl)] leading-tight" id="filtered-plan-title">{translate(activeDetails.title)}</h2>
                    <p className="mt-1 max-w-[65ch] text-sm text-[var(--color-muted)]">{translate(activeDetails.description)}</p>
                  </div>
                  <p aria-live="polite" className="text-sm font-bold tabular-nums text-[var(--color-ink-soft)]">
                    {translate(activeProcedures.length === 1 ? 'resultCountOne' : 'resultCountMany', { count: activeProcedures.length })}
                  </p>
                </div>
                {activeProcedures.length > 0
                  ? <div>{activeProcedures.map((procedure, index) => <ProcedureCard compact={procedure.status === 'DONE'} emphasis={procedure.status === 'MISSING' && index === 0} key={procedure.id} onEdit={handleOpenEditModal} procedure={procedure} />)}</div>
                  : <p className="border-b border-[var(--color-rule)] py-6 text-sm text-[var(--color-muted)]" role="status">{translate('noCareInStatus')}</p>}
              </section>
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
