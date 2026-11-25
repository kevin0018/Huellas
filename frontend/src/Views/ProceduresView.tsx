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

const filterDetails: Record<ProcedureFilter, { description: TranslationKey; label: TranslationKey; title: TranslationKey }> = {
  ALL: {
    description: 'planAllDescription',
    label: 'planAll',
    title: 'planAllTitle',
  },
  DONE: {
    description: 'planCurrentDescription',
    label: 'planCurrent',
    title: 'planCurrent',
  },
  MISSING: {
    description: 'planOverdueDescription',
    label: 'planOverdue',
    title: 'planAttention',
  },
  UPCOMING: {
    description: 'planUpcomingDescription',
    label: 'planUpcoming',
    title: 'planSoon',
  },
};

const filterOrder: ProcedureFilter[] = ['MISSING', 'UPCOMING', 'DONE', 'ALL'];
const filterSymbol: Record<ProcedureFilter, string> = {
  ALL: '≡',
  DONE: '✓',
  MISSING: '!',
  UPCOMING: '◷',
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
      <main className="care-page">
        <div className="care-shell">
          <header className="care-hero care-hero--pet">
            <div className="care-hero__copy">
              <nav aria-label={translate('breadcrumbs')}>
                <Link className="care-hero__back" to={`/pets/${petId}`}>
                  <ArrowLeftIcon className="size-4" />{translate('petProfile')}
                </Link>
              </nav>
              <h1 className="care-hero__title">{pet ? translate('preventionForPet', { pet: pet.name }) : translate('prevention')}
              </h1>
              <p className="care-hero__description">
                {translate('planDescription')}
              </p>
            </div>
            {pet && (
              <span aria-hidden="true" className="care-hero__portrait">
                <img alt="" className="size-full object-cover" height="128" src={getPetImageUrl(pet)} width="128" />
              </span>
            )}
            <div className="care-hero__actions">
              <Link className="care-hero__link" to={`/pets/${petId}/health`}>{translate('openHealthBook')}</Link>
            </div>
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
            <div className="care-plan">
              <div className="care-plan__overview">
                <nav aria-label={translate('filterPlan')} className="care-plan__filters">
                  {filterOrder.map((filter) => {
                    const count = proceduresByFilter[filter].length;
                    const selected = activeFilter === filter;
                    return <button
                      aria-label={`${translate(filterDetails[filter].label)}: ${count}`}
                      aria-pressed={selected}
                      aria-controls="filtered-plan"
                      className="care-plan-filter"
                      data-status={filter}
                      disabled={count === 0}
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      type="button"
                    >
                      <span aria-hidden="true" className="care-plan-filter__icon">{filterSymbol[filter]}</span>
                      <span className="care-plan-filter__count">{count}</span>
                      <span className="care-plan-filter__label">{translate(filterDetails[filter].label)}</span>
                    </button>;
                  })}
                </nav>
                <p className="care-plan__note">
                  {translate('planDateDisclaimer')}
                </p>
              </div>

              <section aria-labelledby="filtered-plan-title" className="min-w-0" id="filtered-plan">
                <div className="care-section-heading care-plan__heading">
                  <div className="min-w-0">
                    <h2 className="care-section-title" id="filtered-plan-title">{translate(activeDetails.title)}</h2>
                    <p className="care-section-description">{translate(activeDetails.description)}</p>
                  </div>
                  <p aria-live="polite" className="text-sm font-bold tabular-nums text-[var(--color-ink-soft)]">
                    {translate(activeProcedures.length === 1 ? 'resultCountOne' : 'resultCountMany', { count: activeProcedures.length })}
                  </p>
                </div>
                {activeProcedures.length > 0
                  ? <div className="care-plan__entries">{activeProcedures.map((procedure, index) => <ProcedureCard compact={procedure.status === 'DONE'} emphasis={procedure.status === 'MISSING' && index === 0} key={procedure.id} onEdit={handleOpenEditModal} procedure={procedure} />)}</div>
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
