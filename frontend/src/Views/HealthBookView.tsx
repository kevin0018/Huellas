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
              <button className="mt-4 text-sm font-semibold text-red-700" onClick={() => void remove(event.id)}>Eliminar</button>
            </article>)}
          </div>
        </section>)}
      </div>
    </main>
    <Footer />
  </>;
}
