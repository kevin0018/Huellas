// Views/UserHome.tsx
import { useEffect, useState } from "react";
import ThemeProvider from "../Components/theme/ThemeProvider";
import LanguageProvider from "../i18n/LanguageProvider";
import { useTranslation } from "../i18n/hooks/hook";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { User } from "../modules/auth/domain/User";
import type { Pet } from "../modules/pet/domain/Pet";
import { ApiPetRepository } from "../modules/pet/infra/ApiPetRepository";
import { PetAvatarGrid } from "../Components/pet/PetAvatarGrid";
import { useNavigate, Link } from "react-router-dom";
import { ApiReminderRepository, type ReminderFeed } from '../modules/reminder/ApiReminderRepository.js';

const reminderRepository = new ApiReminderRepository();

function UserHomeContent() {
  const { translate } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderFeed, setReminderFeed] = useState<ReminderFeed | null>(null);

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
      setLoading(true); setError(null);
      try {
        const repo = new ApiPetRepository();
        const [rows, feed] = await Promise.all([repo.getUserPets(), reminderRepository.list()]);
        if (!cancelled) { setPets(rows); setReminderFeed(feed); }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) {
          if (msg.toLowerCase().includes("unauthorized")) {
            navigate("/login"); return;
          }
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, navigate]);

  const reloadReminders = async () => setReminderFeed(await reminderRepository.list());
  const reminderAction = async (id: number, action: 'postpone' | 'complete' | 'cancel') => {
    await reminderRepository.action(id, action, action === 'postpone' ? 7 : undefined);
    await reloadReminders();
  };
  const nextByPet = reminderFeed?.reminders.reduce<typeof reminderFeed.reminders>((items, reminder) =>
    items.some((item) => item.petId === reminder.petId) ? items : [...items, reminder], []) ?? [];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{translate("loading")}</div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden" style={{ minHeight: "calc(100vh - 180px)" }}>
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />

        <div className="relative z-10 w-full flex flex-col items-center max-w-4xl py-4 3xl:max-w-[50%] ">
          <div className="w-full text-left mt-10 max-w-6xl mx-auto xl:max-w-7xl ">
            <GoBackButton variant="outline" hideIfNoHistory className="bg-white" />
          </div>
          <h1 className="h1 font-caprasimo mb-5 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">
            {translate("hello")}, {user.name}
          </h1>

          <div className="bg-[#FDF2DE]/90 dark:bg-[#51344D]/90 border-[#BCAAA4] border-2 rounded-lg shadow-lg p-6 w-full mx-auto text-center my-10 themed-card-invL">
            <p className="lead text-[--huellas-eggplant]/80 dark:text-[#FDF2DE] text-justify mb-8 px-4">
              {translate("homePageSubtitle")}
            </p>

            <div className="flex flex-col md:flex-row lg:flex-row items-center justify-center gap-4 mt-8 3xl:gap-10">
              {/* Pets */}
              <div className="w-full md:w-2/3 lg:w-2/3 flex flex-col items-center">
                {loading && <p>{translate("loading")}</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && <PetAvatarGrid pets={pets} />}

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">

                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 p-4">
                <Link
                  to="/pet-register"
                  className="flex items-center justify-center gap-3 p-2 pr-4 bg-[#51344D] p-4 text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] transition"
                >
                  <img src="media/paw_icon.svg" alt="" className="h-6 w-6" />
                  Añadir mascota
                </Link>
                <Link to="/appointments" className="flex items-center justify-center gap-3 p-2 pr-4  bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] transition">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Mis Citas
                </Link>

              </div>
            </div>

            {reminderFeed && <section className="mt-8 border-t border-[#BCAAA4] pt-6 text-left" aria-labelledby="next-actions-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 id="next-actions-title" className="text-2xl font-bold text-[#51344D] dark:text-[#FDF2DE]">Próximas acciones</h2><p className="text-sm dark:text-white">Una prioridad por mascota, calculada desde citas y prevención.</p></div>
                <div className="flex flex-wrap items-center gap-4 text-sm dark:text-white">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={reminderFeed.preferences.enabled} onChange={async (event) => { await reminderRepository.preferences(event.target.checked, reminderFeed.preferences.leadDays); await reloadReminders(); }} /> Notificaciones en la aplicación</label>
                  <label className="flex items-center gap-2">Avisar con
                    <select className="rounded border bg-white p-1 text-[#51344D]" value={reminderFeed.preferences.leadDays} onChange={async (event) => { await reminderRepository.preferences(reminderFeed.preferences.enabled, Number(event.target.value)); await reloadReminders(); }}>
                      {[7, 14, 30, 60].map((days) => <option key={days} value={days}>{days} días</option>)}
                    </select>
                  </label>
                </div>
              </div>
              {reminderFeed.preferences.enabled && <div className="mt-4 grid gap-3 md:grid-cols-2">
                {nextByPet.map((reminder) => <article key={reminder.id} className="rounded-xl bg-white p-4 text-[#51344D] shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider">{reminder.petName} · {reminder.source === 'APPOINTMENT' ? 'Cita' : 'Prevención'}</p>
                  <h3 className="mt-1 font-bold">{reminder.title}</h3>
                  <p className="text-sm">{new Date(reminder.dueAt).toLocaleDateString('es-ES')}</p>
                  {reminder.notifyNow && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Aviso activo</span>}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                    <button onClick={() => void reminderAction(reminder.id, 'complete')} className="text-green-700">Completar</button>
                    <button onClick={() => void reminderAction(reminder.id, 'postpone')} className="text-amber-700">Posponer 7 días</button>
                    <button onClick={() => void reminderAction(reminder.id, 'cancel')} className="text-red-700">Cancelar</button>
                    <Link to={`/pets/${reminder.petId}/health`}>Abrir cartilla</Link>
                  </div>
                </article>)}
                {nextByPet.length === 0 && <p className="text-sm dark:text-white">No hay acciones pendientes.</p>}
              </div>}
            </section>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function UserHome() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <UserHomeContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
