/**
 * Internationalization dictionary.
 * `en` is the canonical contract; other locales match its KEYS, not its VALUES.
*/

export const en = {
  // --- General & UI ---
  home: "Home",
  loading: "Loading...",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  actions: "Actions",
  search: "Search",

  // --- Auth & Login ---
  login: "Login",
  register: "Register",
  logout: "Logout",
  email: "Email",
  password: "Password",
  name: "Name",
  dontHaveAccount: "Don't have an account? Register",
  alreadyHaveAccount: "Already have an account? Login",

  // --- Header & Navigation ---
  pets: "Pets",
  users: "Users",
  profile: "Profile",

  // --- Animals Page ---
  myPets: "My Pets",
  addPet: "Add Pet",
  editPet: "Edit Pet",
  petName: "Pet's Name",
  species: "Species",
  breed: "Breed",
  age: "Age",
  gender: "Gender",
  confirmDeletePet: "Are you sure you want to delete this pet?",
  noPetsFound: "No pets found. Add a new one to get started!",

  // --- Users Page ---
  userList: "User List",
  addUser: "Add User",
  editUser: "Edit User",
  role: "Role",
  confirmDeleteUser: "Are you sure you want to delete this user?",
  noUsersFound: "No users found.",

} as const;

/** Translation keys defined in the canonical `en` dictionary. */
export type TranslationKey = keyof typeof en;

// LocaleMap locks keys to TranslationKey but allows any string value
export type LocaleMap = Record<TranslationKey, string>;

export const es: LocaleMap = {
   // --- General & UI ---
  home: "Inicio",
  loading: "Cargando...",
  save: "Guardar",
  cancel: "Cancelar",
  delete: "Borrar",
  edit: "Editar",
  actions: "Acciones",
  search: "Buscar",

  // --- Auth & Login ---
  login: "Iniciar Sesión",
  logout: "Cerrar Sesión",
  register: "Registrase",
  email: "Correo Electrónico",
  password: "Contraseña",
  name: "Nombre",
  dontHaveAccount: "¿No tienes cuenta? Regístrate",
  alreadyHaveAccount: "¿Ya tienes cuenta? Inicia sesión",

  // --- Header & Navigation ---
  pets: "Mascotas",
  users: "Usuarios",
  profile: "Perfil",

  // --- Animals Page ---
  myPets: "Mis Mascotas",
  addPet: "Añadir Mascota",
  editPet: "Editar Mascota",
  petName: "Nombre de la Mascota",
  species: "Especie",
  breed: "Raza",
  age: "Edad",
  gender: "Género",
  confirmDeletePet: "¿Estás seguro de que quieres borrar esta mascota?",
  noPetsFound: "No se encontraron mascotas. ¡Añade una nueva para empezar!",

  // --- Users Page ---
  userList: "Lista de Usuarios",
  addUser: "Añadir Usuario",
  editUser: "Editar Usuario",
  role: "Rol",
  confirmDeleteUser: "¿Estás seguro de que quieres borrar este usuario?",
  noUsersFound: "No se encontraron usuarios.",
};

export const ca: LocaleMap = {
  // --- General & UI ---
  home: "Inici",
  loading: "Carregant...",
  save: "Desar",
  cancel: "Cancel·lar",
  delete: "Esborrar",
  edit: "Editar",
  actions: "Accions",
  search: "Cercar",

  // --- Auth & Login ---
  login: "Iniciar Sessió",
  logout: "Tancar Sessió",
  email: "Correu Electrònic",
  password: "Contrasenya",
  name: "Nom",
  register: "Registrar-se",
  dontHaveAccount: "No tens un compte? Registra't",
  alreadyHaveAccount: "Ja tens un compte? Inicia sessió",

  // --- Header & Navigation ---
  pets: "Mascotes",
  users: "Usuaris",
  profile: "Perfil",

  // --- Animals Page ---
  myPets: "Les Meves Mascotes",
  addPet: "Afegir Mascota",
  editPet: "Editar Mascota",
  petName: "Nom de la Mascota",
  species: "Espècie",
  breed: "Raça",
  age: "Edat",
  gender: "Gènere",
  confirmDeletePet: "Estàs segur que vols esborrar aquesta mascota?",
  noPetsFound: "No s'han trobat mascotes. Afegeix-ne una de nova per començar!",

  // --- Users Page ---
  userList: "Llista d'Usuaris",
  addUser: "Afegir Usuari",
  editUser: "Editar Usuari",
  role: "Rol",
  confirmDeleteUser: "Estàs segur que vols esborrar aquest usuari?",
  noUsersFound: "No s'han trobat usuaris.",
};

export const translations = { en, es, ca } as const;

/** Language codes available in the dictionary. */
export type Language = keyof typeof translations;

