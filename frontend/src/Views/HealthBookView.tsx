/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 · genre: playful · macrostructure: Narrative Workflow · theme: Huellas · enrichment: existing pet avatar · nav/footer: preserved · contrast: pass (40–41) · slop: 58/58 pass · mobile: pass (34, 49, 50–57) */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../Components/footer';
import { ArrowLeftIcon } from '../Components/GoBackButton';
import NavBar from '../Components/NavBar';
import { getPetImageUrl } from '../Components/pet/petImage';
import { applicationServices } from '../composition/applicationServices.js';
import { healthEventLabels, healthEventTypes, type HealthEvent, type HealthEventDraft, type HealthEventType } from '../modules/health/HealthEvent.js';
import type { Pet } from '../modules/pet/domain/Pet.js';
import { apiUrl } from '../shared/api/apiConfig.js';
import { AsyncContent } from '../shared/ui/AsyncContent.js';

const repository = applicationServices.healthEvents;
const petRepository = applicationServices.pets;
const dosageTypes = new Set<HealthEventType>(['VACCINATION', 'MEDICATION', 'TREATMENT']);
const summaryOptions = [['identity', 'Identidad'], ['critical', 'Datos críticos'], ['vaccinations', 'Vacunas'], ['events', 'Eventos']] as const;

function localTimestamp(date: string) { return new Date(`${date}T12:00:00`).toISOString(); }
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
const apiUrlForShare = (token: string) => apiUrl(`/shared-health/${encodeURIComponent(token)}`);

export default function HealthBookView() {
  const petId = Number(useParams<{ petId: string }>().petId);
  const [pet, setPet] = useState<Pet | null>(null);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [type, setType] = useState<HealthEventType>('GENERAL_CHECKUP');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [provider, setProvider] = useState('');
  const [result, setResult] = useState('');
  const [dose, setDose] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [summarySections, setSummarySections] = useState<string[]>(['identity', 'critical', 'vaccinations', 'events']);
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [share, setShare] = useState<{ id: number; url: string; expiresAt: string } | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(petId) || petId <= 0) {
      setError('Identificador de mascota inválido');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [healthEvents, currentPet] = await Promise.all([repository.list(petId), petRepository.getPetById(petId)]);
      setEvents(healthEvents);
      setPet(currentPet);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar la cartilla');
    } finally { setLoading(false); }
  }, [petId]);

  useEffect(() => { void load(); }, [load]);

  const groupedEvents = useMemo(() => Array.from([...events]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .reduce<Map<string, HealthEvent[]>>((groups, event) => {
      const year = new Date(event.occurredAt).getFullYear().toString();
      groups.set(year, [...(groups.get(year) || []), event]);
      return groups;
    }, new Map())), [events]);
  const documentCount = useMemo(() => events.reduce((total, event) => total + (event.attachments?.length || 0), 0), [events]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const draft: HealthEventDraft = {
      type, occurredAt: localTimestamp(date), title, notes: notes || null, provider: provider || null,
      result: result || null, dose: dosageTypes.has(type) ? dose || null : null,
      lotNumber: type === 'VACCINATION' ? lotNumber || null : null,
      expiresAt: dosageTypes.has(type) && expiresAt ? localTimestamp(expiresAt) : null,
    };
    try {
      setSaving(true); setError('');
      await repository.create(petId, draft);
      setTitle(''); setNotes(''); setProvider(''); setResult(''); setDose(''); setLotNumber(''); setExpiresAt('');
      setShowForm(false);
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo guardar el evento'); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm('¿Eliminar este evento sanitario y sus documentos? Esta acción no se puede deshacer.')) return;
    try {
      await repository.delete(id);
      setEvents((current) => current.filter((event) => event.id !== id));
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el evento'); }
  };

  const uploadDocument = async (healthEventId: number, file?: File) => {
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera el límite de 5 MB');
      await repository.uploadDocument(petId, healthEventId, file);
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo adjuntar el documento'); }
  };
  const deleteDocument = async (id: number) => {
    try { await repository.deleteDocument(id); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo eliminar el documento'); }
  };
  const toggleSummarySection = (section: string) => setSummarySections((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  const createShare = async () => {
    try {
      setSharing(true); setError('');
      const created = await repository.createShare(petId, summarySections, periodFrom, periodTo);
      setShare({ id: created.id, url: `${window.location.origin}${apiUrlForShare(created.token)}`, expiresAt: created.expiresAt });
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo compartir'); }
    finally { setSharing(false); }
  };

  return <>
    <NavBar />
    <main className="relative min-h-[calc(100dvh-var(--nav-height))] overflow-x-clip bg-[var(--color-paper)] px-[var(--page-gutter)] py-8 text-[var(--color-ink)] sm:py-12">
      <div aria-hidden="true" className="bg-dogs-userhome-mobile pointer-events-none fixed inset-0 bg-repeat opacity-45 dark:opacity-10 md:bg-dogs-userhome-tablet lg:bg-dogs-userhome-desktop" />
      <div className="relative z-10 mx-auto w-full max-w-[var(--page-max)]">
        <header className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--color-rule-strong)] pb-6 sm:gap-6">
          <div className="min-w-0">
            <nav aria-label="Ruta de navegación">
              <Link className="ui-hover-accent inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] pr-3 text-sm font-bold text-[var(--color-accent)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]" to={`/pets/${petId}`}>
                <ArrowLeftIcon className="size-4" /> Perfil de mascota
              </Link>
            </nav>
            <h1 className="mt-1 font-caprasimo text-[clamp(2.15rem,7vw,4.25rem)] leading-[1.05]">Cartilla sanitaria</h1>
            <p className="mt-2 max-w-[65ch] text-[var(--color-ink-soft)]">
              {pet ? `Consultas, vacunas y tratamientos de ${pet.name}, ordenados para entender su evolución.` : 'Consultas, vacunas y tratamientos ordenados para entender su evolución.'}
            </p>
            <button aria-controls="health-event-form" aria-expanded={showForm} className="ui-button mt-5" onClick={() => setShowForm((value) => !value)} type="button">
              <span aria-hidden="true">{showForm ? '×' : '+'}</span>{showForm ? 'Cerrar formulario' : 'Añadir evento'}
            </button>
          </div>
          {pet && <span aria-hidden="true" className="avatar-circle size-20 shrink-0 bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] sm:size-28 lg:size-32">
            <img alt="" className="size-full object-cover" height="128" src={getPetImageUrl(pet)} width="128" />
          </span>}
        </header>

        {showForm && <form className="mt-8 grid gap-5 rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6" id="health-event-form" onSubmit={submit}>
          <div><h2 className="font-nunito text-xl font-bold tracking-normal">Nuevo evento sanitario</h2><p className="mt-1 max-w-[65ch] text-sm text-[var(--color-muted)]">Registra lo esencial ahora; podrás adjuntar documentos cuando el evento esté guardado.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-field"><label className="form-label" htmlFor="health-event-type">Tipo</label><select className="form-control" id="health-event-type" value={type} onChange={(event) => setType(event.target.value as HealthEventType)}>{healthEventTypes.map((value) => <option key={value} value={value}>{healthEventLabels[value]}</option>)}</select></div>
            <div className="form-field"><label className="form-label" htmlFor="health-event-date">Fecha</label><input className="form-control" id="health-event-date" required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
            <div className="form-field sm:col-span-2"><label className="form-label" htmlFor="health-event-title">Título</label><input className="form-control" id="health-event-title" maxLength={120} placeholder="Ej. Revisión anual" required value={title} onChange={(event) => setTitle(event.target.value)} /></div>
            <div className="form-field"><label className="form-label" htmlFor="health-event-provider">Centro o profesional <span className="form-label__optional">(opcional)</span></label><input className="form-control" id="health-event-provider" value={provider} onChange={(event) => setProvider(event.target.value)} /></div>
            <div className="form-field"><label className="form-label" htmlFor="health-event-result">Resultado <span className="form-label__optional">(opcional)</span></label><input className="form-control" id="health-event-result" value={result} onChange={(event) => setResult(event.target.value)} /></div>
            {dosageTypes.has(type) && <div className="form-field"><label className="form-label" htmlFor="health-event-dose">Dosis <span className="form-label__optional">(opcional)</span></label><input className="form-control" id="health-event-dose" value={dose} onChange={(event) => setDose(event.target.value)} /></div>}
            {type === 'VACCINATION' && <div className="form-field"><label className="form-label" htmlFor="health-event-lot">Lote <span className="form-label__optional">(opcional)</span></label><input className="form-control" id="health-event-lot" value={lotNumber} onChange={(event) => setLotNumber(event.target.value)} /></div>}
            {dosageTypes.has(type) && <div className="form-field"><label className="form-label" htmlFor="health-event-expiry">Caducidad o fin <span className="form-label__optional">(opcional)</span></label><input className="form-control" id="health-event-expiry" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></div>}
            <div className="form-field sm:col-span-2"><label className="form-label" htmlFor="health-event-notes">Notas <span className="form-label__optional">(opcional)</span></label><textarea className="form-control" id="health-event-notes" maxLength={5000} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
          </div>
          <div className="flex flex-wrap-reverse justify-end gap-3 border-t border-[var(--color-rule)] pt-5">
            <button className="ui-button ui-button--secondary" disabled={saving} onClick={() => setShowForm(false)} type="button">Cancelar</button>
            <button aria-busy={saving || undefined} className="ui-button" disabled={saving} type="submit">{saving && <span aria-hidden="true" className="ui-spinner" />}{saving ? 'Guardando…' : 'Guardar evento'}</button>
          </div>
        </form>}

        <div className="mt-10 grid min-w-0 gap-10 md:grid-cols-[15rem_minmax(0,1fr)] md:items-start md:gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
          <section aria-labelledby="timeline-title" className="min-w-0 md:col-start-2 md:row-start-1">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-rule-strong)] pb-4">
              <div><h2 className="font-caprasimo text-[var(--text-xl)] leading-tight" id="timeline-title">Historial</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Del evento más reciente al más antiguo.</p></div>
              {!loading && !error && <p className="text-sm font-semibold tabular-nums text-[var(--color-ink-soft)]">{events.length} {events.length === 1 ? 'evento' : 'eventos'} · {documentCount} {documentCount === 1 ? 'documento' : 'documentos'}</p>}
            </div>
            <AsyncContent empty={events.length === 0} emptyDescription="Añade una consulta, vacuna o tratamiento para empezar la cartilla." emptyTitle="Todavía no hay eventos sanitarios" error={error} loading={loading} loadingLabel="Cargando historial…" onRetry={load}>
              <div className="grid gap-10">
                {groupedEvents.map(([year, yearEvents]) => <section aria-labelledby={`health-year-${year}`} className="grid min-w-0 gap-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-6" key={year}>
                  <h3 className="whitespace-nowrap font-caprasimo text-2xl text-[var(--color-accent)] sm:sticky sm:top-24 sm:h-fit" id={`health-year-${year}`}>{year}</h3>
                  <div className="relative grid min-w-0 gap-5 border-l border-[var(--color-rule-strong)] pl-5 sm:pl-7">
                    {yearEvents.map((healthEvent) => <article className="relative min-w-0 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6" key={healthEvent.id}>
                      <span aria-hidden="true" className="absolute -left-[1.625rem] top-7 size-3 rounded-full border-2 border-[var(--color-paper)] bg-[var(--color-accent)] sm:-left-[2.125rem]" />
                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3"><div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">{healthEventLabels[healthEvent.type]}</p>
                        <h4 className="mt-1 break-words font-nunito text-xl font-bold tracking-normal">{healthEvent.title}</h4>
                        <p className="mt-1 text-sm text-[var(--color-muted)]"><time dateTime={healthEvent.occurredAt}>{formatDate(healthEvent.occurredAt)}</time>{' · '}{healthEvent.provider || 'Registrado en casa'}</p>
                      </div><span className={`inline-flex min-h-8 items-center rounded-[var(--radius-pill)] border px-3 text-xs font-bold ${healthEvent.verification === 'VERIFIED' ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-warning)] text-[var(--color-warning)]'}`}>{healthEvent.verification === 'VERIFIED' ? 'Verificado' : 'Dato del propietario'}</span></div>
                      {(healthEvent.result || healthEvent.dose || healthEvent.lotNumber || healthEvent.expiresAt) && <dl className="mt-5 grid gap-x-5 gap-y-3 border-y border-[var(--color-rule)] py-4 text-sm sm:grid-cols-2">
                        {healthEvent.result && <div><dt className="font-bold text-[var(--color-muted)]">Resultado</dt><dd className="mt-1 break-words">{healthEvent.result}</dd></div>}
                        {healthEvent.dose && <div><dt className="font-bold text-[var(--color-muted)]">Dosis</dt><dd className="mt-1 break-words">{healthEvent.dose}</dd></div>}
                        {healthEvent.lotNumber && <div><dt className="font-bold text-[var(--color-muted)]">Lote</dt><dd className="mt-1 break-words">{healthEvent.lotNumber}</dd></div>}
                        {healthEvent.expiresAt && <div><dt className="font-bold text-[var(--color-muted)]">Caducidad o fin</dt><dd className="mt-1">{formatDate(healthEvent.expiresAt)}</dd></div>}
                      </dl>}
                      {healthEvent.notes && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-ink-soft)]">{healthEvent.notes}</p>}
                      <div className="mt-5 border-t border-[var(--color-rule)] pt-5"><p className="text-sm font-bold">Documentos privados</p>
                        {(healthEvent.attachments || []).length > 0 && <ul className="mt-3 grid gap-2">{healthEvent.attachments.map((document) => <li className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-[var(--radius-control)] bg-[var(--color-paper-2)] px-3 py-2" key={document.id}>
                          <button className="ui-hover-accent min-h-11 min-w-0 break-all text-left text-sm font-bold text-[var(--color-accent)]" onClick={() => void repository.downloadDocument(document)} type="button">{document.fileName}</button>
                          <button aria-label={`Eliminar ${document.fileName}`} className="min-h-11 rounded-[var(--radius-control)] px-3 text-sm font-bold text-[var(--color-error)] hover:bg-[var(--color-error-soft)] active:bg-[var(--color-error-soft)]" onClick={() => void deleteDocument(document.id)} type="button">Eliminar</button>
                        </li>)}</ul>}
                        <label className="ui-button ui-button--secondary mt-3 cursor-pointer">Adjuntar imagen o PDF<input accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(input) => { void uploadDocument(healthEvent.id, input.target.files?.[0]); input.target.value = ''; }} type="file" /></label>
                        <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">PDF, JPEG, PNG o WebP · máximo 5 MB · solo visible para el propietario.</p>
                      </div>
                      <button className="mt-4 min-h-11 rounded-[var(--radius-control)] px-2 text-sm font-bold text-[var(--color-error)] hover:bg-[var(--color-error-soft)] active:bg-[var(--color-error-soft)]" onClick={() => void remove(healthEvent.id)} type="button">Eliminar evento</button>
                    </article>)}
                  </div>
                </section>)}
              </div>
            </AsyncContent>
          </section>

          <aside aria-labelledby="summary-title" className="rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] md:col-start-1 md:row-start-1 md:sticky md:top-24">
            <h2 className="font-nunito text-xl font-bold tracking-normal" id="summary-title">Preparar resumen</h2>
            <p className="mt-1 text-sm leading-5 text-[var(--color-muted)]">Elige qué información incluir antes de una consulta o viaje.</p>
            <fieldset className="form-choice-set mt-5"><legend className="form-legend">Secciones</legend><div className="grid gap-2">
              {summaryOptions.map(([value, label]) => <label className="form-choice" key={value}><input checked={summarySections.includes(value)} onChange={() => toggleSummarySection(value)} type="checkbox" />{label}</label>)}
            </div></fieldset>
            <div className="mt-5 grid gap-4">
              <div className="form-field"><label className="form-label" htmlFor="summary-from">Desde <span className="form-label__optional">(opcional)</span></label><input className="form-control" id="summary-from" type="date" value={periodFrom} onChange={(event) => setPeriodFrom(event.target.value)} /></div>
              <div className="form-field"><label className="form-label" htmlFor="summary-to">Hasta <span className="form-label__optional">(opcional)</span></label><input className="form-control" id="summary-to" type="date" value={periodTo} onChange={(event) => setPeriodTo(event.target.value)} /></div>
            </div>
            <div className="mt-5 grid gap-2"><button className="ui-button" disabled={!summarySections.length} onClick={() => void repository.exportSummary(petId, summarySections, periodFrom, periodTo)} type="button">Descargar HTML</button><button aria-busy={sharing || undefined} className="ui-button ui-button--secondary" disabled={!summarySections.length || sharing} onClick={() => void createShare()} type="button">{sharing ? 'Creando enlace…' : 'Enlace por 24 horas'}</button></div>
            <p className="mt-4 text-xs leading-5 text-[var(--color-muted)]">El resumen indica su procedencia y no sustituye una historia clínica veterinaria.</p>
            {share && <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-3 text-sm"><p className="font-bold">Enlace activo</p><a className="ui-hover-accent mt-2 block break-all font-semibold text-[var(--color-accent)]" href={share.url} rel="noreferrer" target="_blank">{share.url}</a><p className="mt-2 text-xs text-[var(--color-muted)]">Caduca: {new Date(share.expiresAt).toLocaleString('es-ES')}</p><button className="mt-2 min-h-11 rounded-[var(--radius-control)] px-2 text-sm font-bold text-[var(--color-error)] hover:bg-[var(--color-error-soft)] active:bg-[var(--color-error-soft)]" onClick={async () => { await repository.revokeShare(share.id); setShare(null); }} type="button">Revocar enlace</button></div>}
          </aside>
        </div>
      </div>
    </main>
    <Footer />
  </>;
}
