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
  remove: "Remove",
  clearAll: "Remove all",

  // --- Landing & App ---
  huellas: "huellas",
  appDescription:
    "Huellas is a comprehensive platform created to bring together every aspect of your pets’ health and wellbeing, no matter how many you have. It keeps a complete medical record for each animal, so you can log and review vaccination dates, deworming, known allergies, and any current medications. Plus, the app makes sure you never miss an important appointment with programmable reminders for vet visits or upcoming medication doses.",
  aboutUs: "About Us",
  contact: "Contact",
  welcome: "Welcome to Huellas",
  getStarted: "Get Started",
  howToHelp: "How You Can Help",
  howToHelpText: "We’re a non-profit organization, and we need your support to continue our mission. Here’s how you can help us and the pets we care for.",
  supportAnAnimal: "Support a Pet",

  // --- About Us ---
  ourMission: "Our Mission",
  ourMissionText: "We understand that your furry companions are part of your family, and our purpose is to give you the peace of mind that you are taking care of them in the best possible way. We transform the complexity of managing their health—appointments, vaccines, diets—into a simple and intuitive experience, so you can spend less time organizing and more on what truly matters: enjoying every walk, game, and moment of companionship.",
  ourVision: "Our Vision",
  ourVisionText: "We dream of a future where every pet lives a longer, healthier, and happier life in a home that understands and cares for them with confidence. We aspire to be the platform that strengthens the unbreakable bond between people and their animals, creating a global community of informed and empowered owners.",
  meetTheTeam: "Meet the Team",
  meetTheTeamText: "The Huellas team is made up of developers, designers, and above all, pet owners. The idea was born from our own need to better organize the care of our companions and have the certainty that we were doing it right. That's why we created the tool we always wanted to have at our fingertips.",
  meetTheTeamText2: "Our dedication translates into a simple and reliable platform, designed to give you security and more quality time with your pet.",

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
  settings: "Settings",

  // --- Settings ---
  theme: "Theme",
  language: "Language",
  lightMode: "Light mode",
  darkMode: "Dark mode",

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
  vaccine: "Vaccine/s",
  noAppointments: "No upcoming appointments.",
  viewAppointments: "View appointments",

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
  remove: "Eliminar",
  clearAll: "Eliminar todo",

  // --- Landing & App ---
  huellas: "huellas",
  appDescription:
    "Huellas es una plataforma integral diseñada para unificar todos los aspectos de la salud y el bienestar de tus compañeros peludos, sin importar cuántos tengas. Centraliza el historial médico completo de cada mascota, permitiéndote registrar y consultar fechas de vacunación, desparasitaciones, alergias conocidas y cualquier medicación actual. Además, la aplicación te ayuda a no olvidar nunca una cita importante gracias a su sistema de recordatorios programables para visitas al veterinario o la próxima dosis de su medicación.",
  aboutUs: "Sobre Nosotros",
  contact: "Contacto",
  welcome: "Bienvenidx a Huellas",
  getStarted: "Empieza ahora",
  howToHelp: "Cómo ayudarnos",
  howToHelpText: "Somos una organización sin fines de lucro, pero también necesitamos tu ayuda para seguir adelante. Aquí te mostramos cómo puedes ayudarnos a nosotros y a los peluditos que cuidamos.",
  supportAnAnimal: "Apoya a un peludito",

  // --- About Us ---
  ourMission: "Nuestra Misión",
  ourMissionText: "Entendemos que tus compañeros peludos son parte de tu familia, y nuestro propósito es darte la tranquilidad de que estás cuidando de ellos de la mejor manera posible. Transformamos la complejidad de la gestión de su salud —citas, vacunas, dietas— en una experiencia sencilla e intuitiva, para que puedas dedicar menos tiempo a la organización y más a lo que de verdad importa: disfrutar de cada paseo, juego y momento de compañía.",
  ourVision: "Nuestra Visión",
  ourVisionText: "Soñamos con un futuro donde cada mascota viva una vida más larga, saludable y feliz en un hogar que la comprende y la cuida con confianza. Aspiramos a ser la plataforma que fortalezca el vínculo inquebrantable entre las personas y sus animales, creando una comunidad global de dueños informados y empoderados.",
  meetTheTeam: "Conoce al Equipo",
  meetTheTeamText: "El equipo de Huellas está formado por programadores, diseñadores y, ante todo, dueños de mascotas. La idea nació de nuestra propia necesidad de organizar mejor el cuidado de nuestros compañeros y tener la certeza de estar haciéndolo bien. Por eso, creamos la herramienta que siempre quisimos tener a nuestro alcance.",
  meetTheTeamText2: "Nuestra dedicación se traduce en una plataforma sencilla y fiable, pensada para darte seguridad y más tiempo de calidad con tu mascota.",

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
  settings: "Ajustes",

  // --- Settings ---
  theme: "Tema",
  language: "Idioma",
  lightMode: "Modo claro",
  darkMode: "Modo oscuro",

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
  vaccine: "Vacuna/s",
  noAppointments: "No hay citas",
  viewAppointments: "Ver citas",

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
  remove: "Elimina",
  clearAll: "Elimina-ho tot",

  // --- Landing & App ---
  huellas: "huellas",
  appDescription:
    "Huellas és una plataforma integral dissenyada per unificar tots els aspectes de la salut i el benestar dels teus companys peluts, sense importar quants en tinguis. Centralitza l'historial mèdic complet de cada mascota, permetent-te registrar i consultar dates de vacunació, desparasitacions, al·lèrgies conegudes i qualsevol medicació actual. A més, l'aplicació t'ajuda a no oblidar mai una cita important gràcies al seu sistema de recordatoris programables per a visites al veterinari o la pròxima dosi de la seva medicació.",
  aboutUs: "Sobre Nosaltres",
  contact: "Contacte",
  welcome: "Benvingut/da a Huellas",
  getStarted: "Comença ara",
  howToHelp: "Com ens pots ajudar",
  howToHelpText: "Som una organització sense ànim de lucre, però també necessitem la teva ajuda per seguir endavant. Aquí et mostrem com pots ajudar-nos a nosaltres i als peluts que cuidem.",
  supportAnAnimal: "Dóna suport a un pelut",
  
  // --- About Us ---
  ourMission: "La Nostra Missió",
  ourMissionText: "Entenem que els teus companys peluts són part de la teva família, i el nostre propòsit és donar-te la tranquil·litat que estàs cuidant d'ells de la millor manera possible. Transformem la complexitat de la gestió de la seva salut —cites, vacunes, dietes— en una experiència senzilla i intuïtiva, perquè puguis dedicar menys temps a l'organització i més al que de veritat importa: gaudir de cada passeig, joc i moment de companyia.",
  ourVision: "La Nostra Visió",
  ourVisionText: "Somiem amb un futur on cada mascota visqui una vida més llarga, saludable i feliç en una llar que la comprèn i la cuida amb confiança. Aspirem a ser la plataforma que enforteixi el vincle indestructible entre les persones i els seus animals, creant una comunitat global de propietaris informats i empoderats.",
  meetTheTeam: "Coneix l'Equip",
  meetTheTeamText: "L'equip de Huellas està format per programadors, dissenyadors i, sobretot, propietaris de mascotes. La idea va néixer de la nostra pròpia necessitat d'organitzar millor la cura dels nostres companys i tenir la certesa d'estar-ho fent bé. Per això, vam crear l'eina que sempre vam voler tenir al nostre abast.",
  meetTheTeamText2: "La nostra dedicació es tradueix en una plataforma senzilla i fiable, pensada per donar-te seguretat i més temps de qualitat amb la teva mascota.",

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
  settings: "Configuració",

  // --- Settings ---
  theme: "Tema",
  language: "Idioma",
  lightMode: "Mode clar",
  darkMode: "Mode fosc",
  
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
  vaccine: "Vacunes",
  noAppointments: "No hi ha cites properes.",
  viewAppointments: "Veure cites",

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