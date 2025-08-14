/**
 * Internationalization dictionary.
 * `en` is the canonical contract; other locales match its KEYS, not its VALUES.
*/

export const en = {
  home: "Home",
  courses: "Courses",
  admin: "Admin",
  login: "Login",
  welcome: "Welcome to the course portal",
  courseList: "Course List",
  configuration: "Configuration",
  theme: "Theme",
  language: "Language",
  lightMode: "Light mode",
  darkMode: "Dark mode",
  profile: "Profile",
  favorites: "Favorites",
  progress: "Progress",
  name: "Name",
  email: "Email",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  reset: "Reset to default values",
  myCourses: "My Courses",
  remove: "Remove",
  clearAll: "Remove all",
  noFavorites: "You have no favorite courses.",
  history: "History",
  noRecentCourses: "No recent courses.",
  viewCourses: "View courses",
  viewAgain: "View again",
  clearHistory: "Clear history",
} as const;

/** Translation keys defined in the canonical `en` dictionary. */
export type TranslationKey = keyof typeof en;

// LocaleMap locks keys to TranslationKey but allows any string value
export type LocaleMap = Record<TranslationKey, string>;

export const es: LocaleMap = {
  home: "Inicio",
  courses: "Cursos",
  admin: "Administración",
  login: "Iniciar sesión",
  welcome: "Bienvenido al portal de cursos",
  courseList: "Lista de cursos",
  configuration: "Configuración",
  theme: "Tema",
  language: "Idioma",
  lightMode: "Modo claro",
  darkMode: "Modo oscuro",
  profile: "Perfil",
  favorites: "Favoritos",
  progress: "Progreso",
  name: "Nombre",
  email: "Correo electrónico",
  edit: "Editar",
  save: "Guardar",
  cancel: "Cancelar",
  reset: "Restablecer valores por defecto",
  myCourses: "Mis cursos",
  remove: "Eliminar",
  clearAll: "Eliminar todos",
  noFavorites: "No tienes cursos marcados.",
  history: "Historial",
  noRecentCourses: "No hay cursos recientes.",
  viewCourses: "Ver cursos",
  viewAgain: "Ver de nuevo",
  clearHistory: "Borrar historial",
};

export const translations = { en, es } as const;

/** Language codes available in the dictionary. */
export type Language = keyof typeof translations;

