import { useEffect, useState } from "react";
import ThemeProvider from "../Components/theme/ThemeProvider";
import LanguageProvider from "../i18n/LanguageProvider";
import { useTranslation } from "../i18n/hooks/hook";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { User } from "../modules/auth/domain/User";
import { useNavigate, Link } from "react-router-dom";

function UserHomeContent() {
  const { translate } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user data
    const userData = AuthService.getUser();
    setUser(userData);
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{translate('loading')}</div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center background-primary px-2 sm:px-0 overflow-hidden" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* Responsive background with dogs */}
        <div className="fixed inset-0 z-0 w-full h-full bg-repeat bg-[url('/media/bg_phone_userhome.png')] md:bg-[url('/media/bg_tablet_userhome.png')] lg:bg-[url('/media/bg_desktop_userhome.png')] opacity-60 pointer-events-none select-none" aria-hidden="true" />

        {/* Content overlay */}
        <div className="relative z-10 w-full flex flex-col items-center max-w-4xl py-4 3xl:max-w-[50%] ">
          <h1 className="h1 font-caprasimo mb-4 py-8 text-4xl md:text-5xl text-[#51344D] drop-shadow-lg dark:text-[#FDF2DE]">
            {translate("hello")}, {user.name}!
          </h1>
          <div className="bg-[#FDF2DE]/90 dark:bg-[#51344D]/90 border-[#BCAAA4] border-2 rounded-lg shadow-lg p-6 w-full mx-auto text-center">
          <p className="lead text-[--huellas-eggplant]/80 dark:text-[#FDF2DE] text-justify mb-8 px-4">
            {translate("homePageSubtitle")}
          </p>
            <div className="flex flex-col md:flex-row lg:flex-row items-center justify-center gap-4 mt-8 3xl:gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <img
                    src="/media/pfp_sample.svg"
                    alt=""
                    className="w-24 md:w-32 lg:w-48 rounded-full cursor-pointer hover:scale-105 transform transition duration-300"
                  />
                  <p>Nombre de un perrito</p>
                </div>
                <div>
                  <img
                    src="/media/pfp_sample.svg"
                    alt=""
                    className="w-24 md:w-32 lg:w-48 rounded-full cursor-pointer hover:scale-105 transform transition duration-300"
                  />
                  <p>Nombre de un perrito</p>
                </div>
                <div>
                  <img
                    src="/media/pfp_sample.svg"
                    alt=""
                    className="w-24 md:w-32 lg:w-48 rounded-full cursor-pointer hover:scale-105 transform transition duration-300"
                  />
                  <p>Nombre de un perrito</p>
                </div>
                <div>
                  <img
                    src="/media/pfp_sample.svg"
                    alt=""
                    className="w-24 md:w-32 lg:w-48 rounded-full cursor-pointer hover:scale-105 transform transition duration-300"
                  />
                  <p>Nombre de un perrito</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-4">
                <button type="button" className=" flex items-center justify-center gap-3  p-2 pr-4 bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-300 ease-in-out cursor-pointer ">
                  <img src="media/agenda_icon.svg" alt="Icono de agenda" className="h-10 w-10" />
                  <Link to="/calendar">Mi agenda</Link>
                </button>

                <button type="button" className=" flex items-center justify-center gap-3  p-4 bg-[#51344D] text-white font-semibold rounded-lg shadow-md hover:bg-[#A89B9D] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-300 ease-in-out cursor-pointer ">
                  <img src="media/paw_icon.svg" alt="Icono de añadir mascota" className="h-7 w-7" />
                  <Link to="/pet-register">Añade una nueva mascota</Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default function UserHome() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <UserHomeContent />
      </ThemeProvider>
    </LanguageProvider>
  );
};
