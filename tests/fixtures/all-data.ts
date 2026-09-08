/**
 * Extraits **réels** de `GET /all-data` (recette, 12 août 2026).
 *
 * Les valeurs sont reprises telles quelles, y compris leurs défauts : c'est ce
 * qui donne leur valeur aux tests. Notamment :
 * - `title` d'une destination contient une accroche marketing, pas le nom du pays ;
 * - les dates sont au format `JJ/MM/AAAA` ;
 * - `formations` et `details` contiennent une entrée `{ title: null, description: null }` ;
 * - chaque formation réelle n’a que `title` + `description` (pas de `grade` / `duration`) ;
 * - `founded_year` et `student_count` sont `null` pour les 570 écoles ;
 * - `hero_title`, `cta_text`, `badge_label` et `area` sont `null` sur les 8 formules.
 */

export const rawSchool = {
  id: '00cc9b79-4e09-425b-b07a-0b686ac35b3f',
  title: 'Université Clermond Auvergne',
  lc_country_id: 73,
  slug: 'universite-clermond-auvergne',
  presentation: '<p>Issue de la fusion en <strong>2017</strong>, l’université&nbsp;…</p>',
  city: 'Clermont-Ferrand',
  formations: [{ title: null, description: null }],
  details: [{ title: null, description: null }],
  status: true,
  logo: 'https://admin.stage.qiryna.com/storage/photos/schools/logos/uca.png',
  image: 'https://admin.stage.qiryna.com/storage/photos/schools/images/uca.png',
  founded_year: null,
  student_count: null,
  created_at: '13/01/2026',
  country: { name: 'France' },
}

export const rawSchoolWithFormations = {
  ...rawSchool,
  id: '11111111-1111-1111-1111-111111111111',
  title: 'emlyon business school',
  slug: 'emlyon-business-school',
  city: 'Lyon',
  formations: [
    {
      title: 'Global Bachelor of Business Administration',
      description: '<p class="ql-align-justify"><strong>Cible ?</strong>&nbsp;Le lycéen…</p><p>Bachelor international en 4 ans, stages et échanges à l’étranger.</p>',
    },
    { title: null, description: null },
  ],
  details: [{ title: 'Classement', description: '<p>Top 5 en France</p>' }],
}

export const rawDestination = {
  id: '1fbd680c-e54b-484a-a0c1-9a28e5129ac8',
  // ⚠️ accroche marketing, PAS le nom du pays
  title: 'L’excellence universitaire reconnue, accessible et durable',
  slug: 'france',
  lang: null,
  description: '<p class="ql-align-justify">Étudier en France, c’est faire le choix…</p>',
  status: true,
  created_at: '16/08/2024',
  picture: 'https://admin.stage.qiryna.com/storage/photos/schools_files/france.png',
  country: { id: 73, name: 'France', iso_alpha_2: 'FR' },
  schools: [rawSchool, rawSchoolWithFormations],
  nbr_schools: 108,
  stats: [
    { value: '295', label: 'Universités et grandes écoles' },
    { value: '550 000', label: 'Étudiants internationaux' },
    { value: null, label: 'destination d’études dans le monde' },
    { value: '138', label: null },
  ],
}

export const rawOffer = {
  id: '3393e805-e658-43bb-8dc6-642827783561',
  lang: null,
  title: 'Ingénierie',
  slug: 'ingenierie',
  hero_title: null,
  badge_label: null,
  description: '<p>Voluptate dolorem re.</p>',
  cta_text: null,
  status: true,
  created_at: '16/08/2024',
  items: [
    { title: 'Est molestias libero', description: null, icon: null, included: true },
    { title: 'Provident cillum et', description: null, icon: null, included: true },
    { title: null, description: null, icon: null, included: true },
  ],
  icon: 'https://admin.stage.qiryna.com/storage/photos/areas_of_study/ingenierie.png',
  hero_image: null,
  trust_badges: [],
  amount: 490,
  payment_type: 'unique',
  area: null,
  stripe_product_id: 'price_1PfRbBGWy8fsTyFLMy2KPjNW',
  mentors: [
    {
      id: 'c0ffee00-0000-4000-8000-000000000001',
      first_name: 'Awa',
      last_name: 'Diallo',
      full_name: 'Awa Diallo',
      slug: 'awa-diallo',
      role: 'Mentor',
      city: 'Paris',
      photo: 'https://admin.stage.qiryna.com/storage/photos/mentors/awa.png',
      country_flag: 'https://admin.stage.qiryna.com/storage/flags/fr.svg',
    },
  ],
}

export const rawPage = {
  id: '0029970a-4c2d-468c-a52d-326ebe541641',
  title: 'CGU',
  content: '<h2>1. Présentation de la plateforme</h2><p>Qiryna est une plateforme EdTech…</p>',
  slug: 'cgu',
  status: true,
  seo_title: null,
  seo_description: null,
  og_image: null,
  created_at: '19/08/2024',
}

export const rawMenu = {
  destinations: {
    menu: 'Fiche école',
    sub_menus: [
      { id: '1fbd680c-e54b-484a-a0c1-9a28e5129ac8', title: 'France', slug: 'france' },
      { id: '2643adc8-abc3-4258-8853-d195bb8ce3ad', title: 'Chine', slug: 'chine' },
    ],
  },
  courses: {
    menu: 'Langues étrangères',
    sub_menus: [{ id: '0f1a201f-dc42-47ed-a8e6-ca08fb6ca47a', title: 'Français', slug: 'francais', badge: null }],
  },
  living: { menu: 'Hébergement', sub_menus: [] },
  mba: { menu: 'MBA', sub_menus: [{ id: 1, title: 'Afrique', slug: 'afrique' }] },
  // Pas de `sub_menus` : la section existe mais est vide côté API.
  profiling: { menu: 'Profilage' },
}

export const rawSettings = {
  languages: [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
  ],
  site: {
    name: 'Qiryna',
    description: 'La plateforme qui vous accompagne…',
    email: 'contact@qiryna.com',
    phone: '+33623912345',
    stripe_pk_api_key: 'pk_live_51M3VTj',
    ga_id: 'G-JBVXJXX9HQ',
  },
  socials: [
    { name: 'facebook', url: 'https://www.facebook.com/qiryna/' },
    // Casse incohérente côté API.
    { name: 'Instagram', url: 'https://www.instagram.com/qiryna' },
    { name: 'sans-url', url: null },
  ],
}

export const rawHome = {
  id: '231ceabf-90f5-49c3-ad99-3e003961000f',
  lang: null,
  title: 'Qiryna - Elargissez nos horizons',
  description: 'Qiryna vous accompagne à chaque étape…',
  seo_title: 'Qiryna - Elargissez nos horizons',
  seo_description: 'Qiryna vous accompagne à chaque étape de votre parcours académique',
  og_image: 'https://admin.stage.qiryna.com/storage/photos/home_page/seo/background-min.jpg',
  slides: [
    { description: null, author: null, image: 'https://admin.stage.qiryna.com/storage/photos/home_page/slides/main.PNG' },
    // Diapositive sans image : inexploitable, doit disparaître.
    { description: 'orpheline', author: null, image: null },
  ],
  steps: [
    { title: 'Information', description: 'Explorez des ressources clés…', image: 'https://admin.stage.qiryna.com/storage/photos/home_page/steps/information.png' },
    { title: null, description: 'étape sans titre', image: null },
  ],
  schools: { title: 'Focus écoles', subtitle: 'Comparez les écoles…', mobile: 'Focus écoles' },
  coaches: { title: 'Profils des mentors', subtitle: 'Diplômés des meilleures écoles…', mobile: 'Profil des Head coachs' },
  mentors: { title: 'Des brillants mentors', subtitle: 'Faites confiance aux coachs…', mobile: '' },
  languages: { title: 'Langues étrangères', subtitle: 'Améliorez votre niveau…', mobile: 'Apprenez avec les natifs' },
  offers: { title: 'Formules de coaching', subtitle: 'Une approche adaptée…', mobile: 'Formules de coaching adaptées' },
}

/** Extrait réel de `GET /courses` (langue « Anglais »). */
export const rawCourse = {
  id: 'f38db26d-c699-4b4c-ba79-92769e974f3c',
  // ⚠️ `language` porte le nom, `title` une accroche éditoriale.
  language: 'Anglais',
  slug: 'anglais',
  title: 'Apprendre l’anglais',
  lang: 'fr',
  country_code: 'GB',
  country_flag: 'https://admin.stage.qiryna.com/vendor/blade-flags/country-gb.svg',
  picture: 'https://admin.stage.qiryna.com/storage/photos/courses/anglais.jpeg',
  description: '<p class="ql-align-justify">Lorem ipsum dolor sit amet…</p>',
  status: true,
  // `badge` existe mais vaut null pour les quatre langues du catalogue.
  badge: null,
  created_at: '17/08/2024',
  levels: [
    { name: 'Beginner', description: '<p>Lorem ipsum…</p>' },
    { name: 'Intermediate', description: '<p>Lorem ipsum…</p>' },
    // Niveau sans nom : inexploitable.
    { name: null, description: '<p>orphelin</p>' },
  ],
  // Ordre réel de la réponse : 200, puis 400, puis 300.
  formulas: [
    {
      id: '2d699974-6f09-418c-affb-256deb6ba22c',
      lang: 'fr',
      title: 'Kilimandjaro',
      type: 'course',
      description: '',
      items: [
        { title: 'Test de langue inclus' },
        { title: 'Séances avec un professeur certifié' },
        { title: null },
      ],
      icon: 'https://admin.stage.qiryna.com/storage/photos/formulas/lang-icon.png',
      amount: 200,
      nbr_hours: 10,
      stripe_product_id: 'price_1PfRtZGWy8fsTyFL8S6Efsqu',
    },
    {
      id: '69b84421-4f21-45a5-8678-79d39bf78cd7',
      title: 'Everest',
      description: '',
      items: [{ title: 'Suivi personnalisé' }],
      icon: null,
      amount: 400,
      nbr_hours: 20,
      stripe_product_id: 'price_1PfRtoGWy8fsTyFL8mPjJsHv',
    },
    {
      id: 'ee581e55-57f5-43e1-8a39-52d0edbb330a',
      title: 'Aconcagua',
      description: '',
      items: [{ title: 'Supports pédagogiques inclus' }],
      icon: null,
      amount: 300,
      nbr_hours: 15,
      stripe_product_id: 'price_x',
    },
  ],
}

/** Extrait réel de `GET /profilage`. Aucun prix n'y figure. */
export const rawProfilage = {
  id: 'ac62e64f-6fea-4139-9411-3baeb2972000',
  lang: 'fr',
  title: 'L’avantage d’un bon profilage',
  description: '<p>Lorem ipsum dolor sit amet.</p>',
  picture: 'https://admin.stage.qiryna.com/storage/photos/profilage/profilage.jpeg',
  categories: [
    {
      icon: 'https://admin.stage.qiryna.com/storage/photos/profilage/categories/exec.png',
      title: 'Étudiant',
      slug: 'etudiant',
      description: '<p>Lorem ipsum…</p>',
    },
    {
      icon: null,
      title: 'Professionnel',
      slug: 'professionnel',
      description: '<p>Lorem ipsum…</p>',
    },
    // Catégorie sans titre : inexploitable.
    { icon: null, title: null, slug: '', description: null },
  ],
}
