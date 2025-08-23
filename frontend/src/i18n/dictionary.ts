/**
 * Internationalization dictionary.
 * en is the canonical contract; other locales match its KEYS, not its VALUES.
*/

export const en = {
  // --- General & UI ---
  home: "Home",
  hello: "Hello",
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
  huellas: "Huellas",
  appDescription:
    "Huellas is an all-in-one platform designed to manage your pets' health and wellness. It centralizes each pet's complete medical history, allowing you to track vaccination dates, deworming, known allergies, and medications. The app also helps you never miss an important appointment with programmable reminders for vet visits or their next dose.",
  aboutUs: "About us",
  contact: "Contact",
  welcome: "Welcome to Huellas",
  getStarted: "Get Started",
  howToHelp: "How You Can Help",
  howToHelpText:
    "We are a non-profit organization, and we rely on your help to continue our work. Here's how you can support us and the animals in our care.",
  supportAnAnimal: "Support a Pet",

  // --- About Us ---
  ourMission: "Our Mission",
  ourMissionText:
    "We know your pets are family. Our purpose is to give you peace of mind, knowing you're caring for them in the best way possible. We turn complex health management—appointments, vaccines, diets—into a simple, intuitive experience, so you can spend less time organizing and more time enjoying every walk, game, and moment together.",
  ourVision: "Our Vision",
  ourVisionText:
    "We dream of a future where every pet lives a longer, healthier, and happier life in a home where they are understood and loved. We aspire to be the platform that strengthens the unbreakable bond between people and their animals, building a global community of informed and empowered owners.",
  meetTheTeam: "Meet the Team",
  meetTheTeamText:
    "The Huellas team is made up of developers and designers but, most importantly, we're pet owners just like you. The idea was born from our own need to better organize our pets' care and feel confident we were doing it right. That's why we built the tool we always wanted for ourselves.",
  meetTheTeamText2:
    "That dedication is reflected in a simple, reliable platform designed to give you peace of mind and more quality time with your pet.",

  // --- Auth / Login / register ---
  login: "Log In",
  register: "Sign Up",
  logout: "Log Out",
  email: "Email",
  password: "Password",
  name: "Name",
  lastName: "Last Name",
  description: "Description",
  owner: "Owner",
  volunteer: "Volunteer",
  registerSuccess: "Registration successful!",
  dontHaveAccount: "Don't have an account?",
  forgotPassword: "Forgot your password?",
  acceptTerms: "I accept the terms",
  readTerms: "Read our T&Cs",
  alreadyHaveAccount: "Already have an account? Log in",

  // --- Error Messages ---
  emailAlreadyExists: "This email is already registered",
  networkError: "Connection error. Please try again",
  registrationError: "Registration failed. Please try again",
  invalidCredentials: "Invalid email or password",
  serverError: "Server error. Please try again later",

  // --- Header & Navigation ---
  pets: "My Pets",
  users: "Users",
  profile: "My Profile",
  settings: "Settings",
  
  // --- Home page ---
  homePageTitle: "Welcome back, {{name}}!",
  homePageSubtitle: "Here’s a look at how your pets are doing today.",
  addPetButton: "Add a New Pet",
  agendaButton: "My Agenda",

  // --- Settings ---
  theme: "Theme",
  language: "Language",
  lightMode: "Light Mode",
  darkMode: "Dark Mode",

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
  vaccine: "Vaccines",
  noAppointments: "No upcoming appointments.",
  viewAppointments: "View Appointments",

  // --- Procedures / Vet schedule ---
  procedures: "Procedures",
  dose: "Dose",
  weeks: "Weeks",
  innerdes: "Internal deworming",
  innerdestext: "First internal deworming, repeat every 2 weeks until 3 months",
  extdes: "External deworming",
  extdestext: "Start of external antiparasitic control",
  multivac: "Multivalent vaccine",
  vaccines1: "Distemper, hepatitis, parvovirus, parainfluenza",
  vaccines2: "Protection against Bordetella and parainfluenza",
  kennelvac: "Kennel cough vaccine",
  rabidVac: "Rabies vaccine",
  rabidText: "Mandatory rabies vaccine (according to local legislation)",
  lastMultiText: "Final puppy booster for full immunity",
  reinforceMulti: "Booster of the multivalent vaccine",
} as const;

/** Translation keys defined in the canonical en dictionary. */
export type TranslationKey = keyof typeof en;

// LocaleMap locks keys to TranslationKey but allows any string value
export type LocaleMap = Record<TranslationKey, string>;

export const es: LocaleMap = {
  // --- General & UI ---
  home: "Inicio",
  hello: "Hola",
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
  huellas: "Huellas",
  appDescription:
    "Huellas es una plataforma integral diseñada para unificar todos los aspectos de la salud y el bienestar de tus compañeros peludos, sin importar cuántos tengas. Centraliza el historial médico completo de cada mascota, permitiéndote registrar y consultar fechas de vacunación, desparasitaciones, alergias conocidas y cualquier medicación actual. Además, la aplicación te ayuda a no olvidar nunca una cita importante gracias a su sistema de recordatorios programables para visitas al veterinario o la próxima dosis de su medicación.",
  aboutUs: "Sobre Nosotros",
  contact: "Contacto",
  welcome: "Bienvenidx a Huellas",
  getStarted: "Empieza ahora",
  howToHelp: "Cómo ayudarnos",
  howToHelpText:
    "Somos una organización sin fines de lucro, pero también necesitamos tu ayuda para seguir adelante. Aquí te mostramos cómo puedes ayudarnos a nosotros y a los peluditos que cuidamos.",
  supportAnAnimal: "Apoya a un peludito",

  // --- About Us ---
  ourMission: "Nuestra Misión",
  ourMissionText:
    "Entendemos que tus compañeros peludos son parte de tu familia, y nuestro propósito es darte la tranquilidad de que estás cuidando de ellos de la mejor manera posible. Transformamos la complejidad de la gestión de su salud —citas, vacunas, dietas— en una experiencia sencilla e intuitiva, para que puedas dedicar menos tiempo a la organización y más a lo que de verdad importa: disfrutar de cada paseo, juego y momento de compañía.",
  ourVision: "Nuestra Visión",
  ourVisionText:
    "Soñamos con un futuro donde cada mascota viva una vida más larga, saludable y feliz en un hogar que la comprende y la cuida con confianza. Aspiramos a ser la plataforma que fortalezca el vínculo inquebrantable entre las personas y sus animales, creando una comunidad global de dueños informados y empoderados.",
  meetTheTeam: "Conoce al Equipo",
  meetTheTeamText:
    "El equipo de Huellas está formado por programadores, diseñadores y, ante todo, dueños de mascotas. La idea nació de nuestra propia necesidad de organizar mejor el cuidado de nuestros compañeros y tener la certeza de estar haciéndolo bien. Por eso, creamos la herramienta que siempre quisimos tener a nuestro alcance.",
  meetTheTeamText2:
    "Nuestra dedicación se traduce en una plataforma sencilla y fiable, pensada para darte seguridad y más tiempo de calidad con tu mascota.",

  // --- Auth / Login / Register ---
  login: "Iniciar Sesión",
  logout: "Cerrar Sesión",
  register: "Regístrate",
  email: "Correo Electrónico",
  password: "Contraseña",
  name: "Nombre",
  lastName: "Apellido",
  description: "Descripción",
  owner: "Titular",
  volunteer: "Voluntario",
  registerSuccess: "¡Registro exitoso!",
  dontHaveAccount: "¿No tienes cuenta?",
  forgotPassword: "¿Has olvidado tu contraseña?",
  acceptTerms: "Acepto los términos",
  readTerms: "Leer Términos y Condiciones",
  alreadyHaveAccount: "¿Ya tienes cuenta? Inicia sesión",

  // --- Error Messages ---
  emailAlreadyExists: "Este correo ya está registrado",
  networkError: "Error de conexión. Inténtalo de nuevo",
  registrationError: "Registro fallido. Inténtalo de nuevo",
  invalidCredentials: "Correo o contraseña incorrectos",
  serverError: "Error del servidor. Inténtalo más tarde",

  // --- Header & Navigation ---
  pets: "Mascotas",
  users: "Usuarios",
  profile: "Mi perfil",
  settings: "Ajustes",

  // --- Home page ---
  homePageTitle: "¡Hola de nuevo, {{name}}!",
  homePageSubtitle: "Aquí tienes todo lo que necesitas para cuidar de tus animales hoy.",
  addPetButton: "Añadir una nueva mascota",
  agendaButton: "Mi agenda",

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

  // --- Procedimientos / Calendario veterinario ---
  procedures: "Procedimientos",
  dose: "Dosis",
  weeks: "Semanas",
  innerdes: "Desparasitación interna",
  innerdestext:
    "Primera desparasitación interna, repetir cada 2 semanas hasta los 3 meses",
  extdes: "Desparasitación externa",
  extdestext: "Inicio del control antiparasitario externo",
  multivac: "Vacuna polivalente",
  vaccines1: "Moquillo, hepatitis, parvovirosis, parainfluenza",
  vaccines2: "Protección contra Bordetella y parainfluenza",
  kennelvac: "Vacuna contra la tos de las perreras",
  rabidVac: "Vacuna antirrábica",
  rabidText: "Vacuna obligatoria contra la rabia (según legislación local)",
  lastMultiText: "Último refuerzo de cachorro para inmunidad completa",
  reinforceMulti: "Refuerzo de la vacuna polivalente",
};

export const ca: LocaleMap = {
  // --- General & UI ---
  home: "Inici",
  hello: "Hola",
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
  huellas: "Huellas",
  appDescription:
    "Huellas és una plataforma integral dissenyada per unificar tots els aspectes de la salut i el benestar dels teus companys peluts, sense importar quants en tinguis. Centralitza l'historial mèdic complet de cada mascota, permetent-te registrar i consultar dates de vacunació, desparasitacions, al·lèrgies conegudes i qualsevol medicació actual. A més, l'aplicació t'ajuda a no oblidar mai una cita important gràcies al seu sistema de recordatoris programables per a visites al veterinari o la pròxima dosi de la seva medicació.",
  aboutUs: "Sobre Nosaltres",
  contact: "Contacte",
  welcome: "Benvingut/da a Huellas",
  getStarted: "Comença ara",
  howToHelp: "Com ens pots ajudar",
  howToHelpText:
    "Som una organització sense ànim de lucre, però també necessitem la teva ajuda per seguir endavant. Aquí et mostrem com pots ajudar-nos a nosaltres i als peluts que cuidem.",
  supportAnAnimal: "Dóna suport a un pelut",
  
  // --- About Us ---
  ourMission: "La Nostra Missió",
  ourMissionText:
    "Entenem que els teus companys peluts són part de la teva família, i el nostre propòsit és donar-te la tranquil·litat que estàs cuidant d'ells de la millor manera possible. Transformem la complexitat de la gestió de la seva salut —cites, vacunes, dietes— en una experiència senzilla i intuïtiva, perquè puguis dedicar menys temps a l'organització i més al que de veritat importa: gaudir de cada passeig, joc i moment de companyia.",
  ourVision: "La Nostra Visió",
  ourVisionText:
    "Somiem amb un futur on cada mascota visqui una vida més llarga, saludable i feliç en una llar que la comprèn i la cuida amb confiança. Aspirem a ser la plataforma que enforteixi el vincle indestructible entre les persones i els seus animals, creant una comunitat global de propietaris informats i empoderats.",
  meetTheTeam: "Coneix l'Equip",
  meetTheTeamText:
    "L'equip de Huellas està format per programadors, dissenyadors i, sobretot, propietaris de mascotes. La idea va néixer de la nostra pròpia necessitat d'organitzar millor la cura dels nostres companys i tenir la certesa d'estar-ho fent bé. Per això, vam crear l'eina que sempre vam voler tenir al nostre abast.",
  meetTheTeamText2:
    "La nostra dedicació es tradueix en una plataforma senzilla i fiable, pensada per donar-te seguretat i més temps de qualitat amb la teva mascota.",

  // --- Auth / Login / Register ---
  login: "Iniciar Sessió",
  logout: "Tancar Sessió",
  email: "Correu Electrònic",
  password: "Contrasenya",
  name: "Nom",
  lastName: "Cognom",
  description: "Descripció",
  owner: "Titular",
  volunteer: "Voluntari",
  registerSuccess: "Registre amb èxit!",
  acceptTerms: "Accepto els termes",
  readTerms: "Llegeix els Termes i Condicions",
  register: "Registrar-se",
  dontHaveAccount: "No tens un compte?",
  forgotPassword: "Has oblidat la teva contrasenya?",
  alreadyHaveAccount: "Ja tens un compte? Inicia sessió",

  // --- Error Messages ---
  emailAlreadyExists: "Aquest correu ja està registrat",
  networkError: "Error de connexió. Torna-ho a intentar",
  registrationError: "Registre fallit. Torna-ho a intentar",
  invalidCredentials: "Correu o contrasenya incorrectes",
  serverError: "Error del servidor. Intenta-ho més tard",

  // --- Header & Navigation ---
  pets: "Mascotes",
  users: "Usuaris",
  profile: "El meu perfil",
  settings: "Configuració",

  // --- Home page ---
  homePageTitle: "Hola de nou, {{name}}!",
  homePageSubtitle: "Aquí tens tot el que necessites per cuidar dels teus animals avui.",
  addPetButton: "Afegir una nova mascota",
  agendaButton: "La meva agenda",

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

  // --- Procediments / Calendari veterinari ---
  procedures: "Procediments",
  dose: "Dosi",
  weeks: "Setmanes",
  innerdes: "Desparasitació interna",
  innerdestext:
    "Primera desparasitació interna, repetir cada 2 setmanes fins als 3 mesos",
  extdes: "Desparasitació externa",
  extdestext: "Inici del control antiparasitari extern",
  multivac: "Vacuna polivalent",
  vaccines1: "Moquill, hepatitis, parvovirosi, parainfluença",
  vaccines2: "Protecció contra Bordetella i parainfluença",
  kennelvac: "Vacuna contra la tos de les perreres",
  rabidVac: "Vacuna antiràbica",
  rabidText: "Vacuna obligatòria contra la ràbia (segons legislació local)",
  lastMultiText: "Últim reforç de cadell per a una immunitat completa",
  reinforceMulti: "Reforç de la vacuna polivalent",
};

export const translations = { en, es, ca } as const;

/** Language codes available in the dictionary. */
export type Language = keyof typeof translations;