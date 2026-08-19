import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../Components/footer';
import GoBackButton from '../Components/GoBackButton';
import NavBar from '../Components/NavBar';
import { ApiHealthEventRepository } from '../modules/health/ApiHealthEventRepository.js';
import {
  healthEventLabels,
  healthEventTypes,
  type HealthEvent,
  type HealthEventDraft,
  type HealthEventType,
} from '../modules/health/HealthEvent.js';

const repository = new ApiHealthEventRepository();
const dosageTypes = new Set<HealthEventType>(['VACCINATION', 'MEDICATION', 'TREATMENT']);

function localTimestamp(date: string): string {
  const value = new Date(`${date}T12:00:00`);
  return value.toISOString();
}

const apiUrlForShare = (token: string) => `${import.meta.env.VITE_API_URL || '/api'}/shared-health/${encodeURIComponent(token)}`;

export default function HealthBookView() {
  const petId = Number(useParams<{ petId: string }>().petId);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<HealthEventType>('GENERAL_CHECKUP');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [provider, setProvider] = useState('');
  const [result, setResult] = useState('');
  const [dose, setDose] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [summarySections, setSummarySections] = useState(['identity', 'critical', 'vaccinations', 'events']);
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [share, setShare] = useState<{ id: number; url: string; expiresAt: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setEvents(await repository.list(petId));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar la cartilla');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => { void load(); }, [load]);

  const groupedEvents = useMemo(() => events.reduce<Record<string, HealthEvent[]>>((groups, event) => {
    const year = new Date(event.occurredAt).getFullYear().toString();
    groups[year] = [...(groups[year] || []), event];
    return groups;
  }, {}), [events]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const draft: HealthEventDraft = {
      type,
      occurredAt: localTimestamp(date),
      title,
      notes: notes || null,
      provider: provider || null,
      result: result || null,
      dose: dosageTypes.has(type) ? dose || null : null,
      lotNumber: type === 'VACCINATION' ? lotNumber || null : null,
      expiresAt: dosageTypes.has(type) && expiresAt ? localTimestamp(expiresAt) : null,
    };
    try {
      await repository.create(petId, draft);
      setTitle(''); setNotes(''); setProvider(''); setResult(''); setDose(''); setLotNumber(''); setExpiresAt('');
      setShowForm(false);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el evento');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('¿Eliminar este evento sanitario?')) return;
    await repository.delete(id);
    setEvents((current) => current.filter((event) => event.id !== id));
  };

  const uploadDocument = async (healthEventId: number, file?: File) => {
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera el límite de 5 MB');
      await repository.uploadDocument(petId, healthEventId, file);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo adjuntar el documento');
    }
  };

  const deleteDocument = async (id: number) => {
    await repository.deleteDocument(id);
    await load();
  };

  const toggleSummarySection = (section: string) => setSummarySections((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  const createShare = async () => {
    try {
      const created = await repository.createShare(petId, summarySections, periodFrom, periodTo);
      setShare({ id: created.id, url: `${window.location.origin}${apiUrlForShare(created.token)}`, expiresAt: created.expiresAt });
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo compartir'); }
  };

  return <>
    <NavBar />
    <main className="min-h-screen bg-[#FDF2DE] dark:bg-[#51344D] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
        <div className="my-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#85647f] dark:text-[#d8c6e8]">Historial y próxima acción</p>
            <h1 className="font-caprasimo text-4xl text-[#51344D] dark:text-[#FDF2DE]">Cartilla sanitaria</h1>
          </div>
          <button className="rounded-lg bg-[#51344D] px-5 py-3 font-semibold text-white" onClick={() => setShowForm((value) => !value)}>
            {showForm ? 'Cerrar' : 'Añadir evento'}
          </button>
        </div>

        <section className="mb-8 rounded-2xl bg-white p-5 shadow-sm" aria-labelledby="summary-title">
          <h2 id="summary-title" className="text-xl font-bold text-[#51344D]">Exportar o compartir resumen</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            {[['identity', 'Identidad'], ['critical', 'Datos críticos'], ['vaccinations', 'Vacunas'], ['events', 'Eventos']].map(([value, label]) => <label key={value} className="flex items-center gap-2"><input type="checkbox" checked={summarySections.includes(value)} onChange={() => toggleSummarySection(value)} />{label}</label>)}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="grid text-sm">Desde<input className="rounded border p-2" type="date" value={periodFrom} onChange={(event) => setPeriodFrom(event.target.value)} /></label>
            <label className="grid text-sm">Hasta<input className="rounded border p-2" type="date" value={periodTo} onChange={(event) => setPeriodTo(event.target.value)} /></label>
            <button disabled={!summarySections.length} className="rounded-lg bg-[#51344D] px-4 py-2 font-semibold text-white disabled:opacity-50" onClick={() => void repository.exportSummary(petId, summarySections, periodFrom, periodTo)}>Descargar HTML</button>
            <button disabled={!summarySections.length} className="rounded-lg border border-[#51344D] px-4 py-2 font-semibold text-[#51344D] disabled:opacity-50" onClick={() => void createShare()}>Enlace por 24 horas</button>
          </div>
          <p className="mt-3 text-xs text-gray-500">El resumen indica su procedencia y no sustituye una historia clínica veterinaria.</p>
          {share && <div className="mt-4 rounded-lg bg-purple-50 p-3 text-sm"><a className="break-all font-semibold text-[#51344D]" href={share.url} target="_blank" rel="noreferrer">{share.url}</a><p>Caduca: {new Date(share.expiresAt).toLocaleString('es-ES')}</p><button className="mt-2 font-semibold text-red-700" onClick={async () => { await repository.revokeShare(share.id); setShare(null); }}>Revocar enlace</button></div>}
        </section>

        {error && <p role="alert" className="mb-5 rounded-lg bg-red-100 p-4 text-red-800">{error}</p>}
        {showForm && <form onSubmit={submit} className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow-md md:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold">Tipo
            <select className="rounded-lg border p-3" value={type} onChange={(event) => setType(event.target.value as HealthEventType)}>
              {healthEventTypes.map((value) => <option key={value} value={value}>{healthEventLabels[value]}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">Fecha
            <input required type="date" className="rounded-lg border p-3" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-semibold md:col-span-2">Título
            <input required maxLength={120} className="rounded-lg border p-3" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">Centro o profesional
            <input className="rounded-lg border p-3" value={provider} onChange={(event) => setProvider(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">Resultado
            <input className="rounded-lg border p-3" value={result} onChange={(event) => setResult(event.target.value)} />
          </label>
          {dosageTypes.has(type) && <label className="grid gap-1 text-sm font-semibold">Dosis
            <input className="rounded-lg border p-3" value={dose} onChange={(event) => setDose(event.target.value)} />
          </label>}
          {type === 'VACCINATION' && <label className="grid gap-1 text-sm font-semibold">Lote
            <input className="rounded-lg border p-3" value={lotNumber} onChange={(event) => setLotNumber(event.target.value)} />
          </label>}
          {dosageTypes.has(type) && <label className="grid gap-1 text-sm font-semibold">Caducidad o fin
            <input type="date" className="rounded-lg border p-3" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </label>}
          <label className="grid gap-1 text-sm font-semibold md:col-span-2">Notas
            <textarea rows={3} maxLength={5000} className="rounded-lg border p-3" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <button className="rounded-lg bg-[#51344D] px-5 py-3 font-semibold text-white md:col-span-2">Guardar evento</button>
        </form>}

        {loading && <p className="text-center text-[#51344D] dark:text-white">Cargando historial…</p>}
        {!loading && events.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-gray-600">Todavía no hay eventos sanitarios.</p>}
        {Object.entries(groupedEvents).map(([year, yearEvents]) => <section key={year} className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-[#51344D] dark:text-[#FDF2DE]">{year}</h2>
          <div className="grid gap-3">
            {yearEvents.map((event) => <article key={event.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#85647f]">{healthEventLabels[event.type]}</p>
                  <h3 className="text-xl font-bold text-[#51344D]">{event.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(event.occurredAt).toLocaleDateString('es-ES')} · {event.provider || 'Registrado en casa'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${event.verification === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {event.verification === 'VERIFIED' ? 'Verificado' : 'Dato del propietario'}
                </span>
              </div>
              {event.result && <p className="mt-3"><strong>Resultado:</strong> {event.result}</p>}
              {event.dose && <p className="mt-1"><strong>Dosis:</strong> {event.dose}</p>}
              {event.lotNumber && <p className="mt-1"><strong>Lote:</strong> {event.lotNumber}</p>}
              {event.notes && <p className="mt-3 whitespace-pre-wrap text-gray-700">{event.notes}</p>}
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-sm font-semibold">Documentos privados</p>
                <div className="flex flex-wrap gap-2">
                  {(event.attachments || []).map((document) => <span key={document.id} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm">
                    <button className="font-semibold text-[#51344D]" onClick={() => void repository.downloadDocument(document)}>{document.fileName}</button>
                    <button aria-label={`Eliminar ${document.fileName}`} className="text-red-700" onClick={() => void deleteDocument(document.id)}>×</button>
                  </span>)}
                </div>
                <label className="mt-3 inline-block cursor-pointer rounded-lg border border-[#51344D] px-3 py-2 text-sm font-semibold text-[#51344D]">
                  Adjuntar imagen o PDF
                  <input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(input) => { void uploadDocument(event.id, input.target.files?.[0]); input.target.value = ''; }} />
                </label>
                <p className="mt-1 text-xs text-gray-500">PDF, JPEG, PNG o WebP · máximo 5 MB · solo visible para el propietario.</p>
              </div>
              <button className="mt-4 text-sm font-semibold text-red-700" onClick={() => void remove(event.id)}>Eliminar</button>
            </article>)}
          </div>
        </section>)}
      </div>
    </main>
    <Footer />
  </>;
}
