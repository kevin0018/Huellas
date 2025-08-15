/**
 * Internationalization dictionary.
 * `en` is the canonical contract; other locales match its KEYS, not its VALUES.
*/

export const en = {
  huellas: "huellas",
  appDescription: "Huellas is a platform for managing your furry friends' health and wellness, even if you have more than one pet.",
  home: "Home",
  services: "Services",
  aboutUs: "About us",
  contact: "Contact",
  login: "Login",
  welcome: "Welcome to Huellas",
  getStarted: "Get started",
  howToHelp: "How to help us",
  settings: "Settings",
  theme: "Theme",
  language: "Language",
  lightMode: "Light mode",
  darkMode: "Dark mode",
  profile: "Profile",
  favorites: "Favorites",
  name: "Name",
  email: "Email",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  remove: "Remove",
  clearAll: "Remove all",
  vaccine: "Vaccine/s",
  noAppointments: "No upcoming appointments.",
  viewAppointments: "View appointments",
  register: "Register now",
} as const;

/** Translation keys defined in the canonical `en` dictionary. */
export type TranslationKey = keyof typeof en;

// LocaleMap locks keys to TranslationKey but allows any string value
export type LocaleMap = Record<TranslationKey, string>;

export const es: LocaleMap = {
  huellas: "huellas",
  appDescription: "Huellas es una plataforma para gestionar la salud y bienestar de tus peluditos, incluso si tienes más de uno.",
  home: "Inicio",
  services: "Servicios",
  aboutUs: "Sobre Nosotros",
  contact: "Contacto",
  login: "Iniciar sesión",
  welcome: "Bienvenidx a Huellas",
  getStarted: "Empieza ahora",
  howToHelp: "Cómo ayudarnos",
  settings: "Ajustes",
  theme: "Tema",
  language: "Idioma",
  lightMode: "Modo claro",
  darkMode: "Modo oscuro",
  profile: "Perfil",
  favorites: "Favoritos",
  name: "Nombre",
  email: "Correo electrónico",
  edit: "Editar",
  save: "Guardar",
  cancel: "Cancelar",
  remove: "Eliminar",
  clearAll: "Eliminar todo",
  vaccine: "Vacuna/s",
  noAppointments: "No hay citas",
  viewAppointments: "Ver citas",
  register: "Registrar ahora",
};

export const ca: LocaleMap = {
  huellas: "huellas",
  appDescription: "Huellas és una plataforma per gestionar la salut i el benestar dels teus peluts, fins i tot si en tens més d'un.",
  home: "Inici",
  services: "Serveis",
  aboutUs: "Sobre Nosaltres",
  contact: "Contacte",
  login: "Inicia sessió",
  welcome: "Benvingut/da a Huellas",
  getStarted: "Comença ara",
  howToHelp: "Com ens pots ajudar",
  settings: "Configuració",
  theme: "Tema",
  language: "Idioma",
  lightMode: "Mode clar",
  darkMode: "Mode fosc",
  profile: "Perfil",
  favorites: "Favorits",
  name: "Nom",
  email: "Correu electrònic",
  edit: "Edita",
  save: "Desa",
  cancel: "Cancel·la",
  remove: "Elimina",
  clearAll: "Elimina-ho tot",
  vaccine: "Vacunes",
  noAppointments: "No hi ha cites properes.",
  viewAppointments: "Veure cites",
  register: "Registra't ara",
};

export const translations = { en, es, ca } as const;

/** Language codes available in the dictionary. */
export type Language = keyof typeof translations;