export type FormulaType = {
  id: string;
  lang: string;
  title: string;
  type: "course" | "living" | "profilage";
  description: string;
  status: boolean;
  created_at: string;
  items: any[];
  icon: string;
  badge?: string | null;
  accent?: string | null;
  listings_count?: number | null;
  interval_label?: string | null;
  amount: string;
  nbr_hours: string;
  stripe_product_id: string;
  evaluation_id: string;
};

export type SchoolSheetType = {
  id: string;
  title: string;
  slug: string;
  lang: string;
  description: string;
  status: string;
  created_at: string;
  picture: string;
  country: any;
  schools: SchoolType[];
  nbr_schools: number;
};

export type SchoolType = {
  id: string;
  title: string;
  slug: string;
  presentation: string;
  city: string;
  formations: any[];
  details: any[];
  lang: string;
  strengths: string;
  status: string;
  logo: string;
  image: string;
  founded_year: number | null;
  student_count: number | null;
  created_at: string;
  country: any;
};

export type ForeinLanguageType = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
};

export type CostOfLivingType = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
};

export type OfferType = {
  id: string;
  model_id: string;
  title: string;
  hero_title: string;
  badge_label: string | null;
  slug: string;
  type: string;
  description: string;
  cta_text: string;
  items: Array<{ title: string; description: string; icon: string | null; included: boolean }>;
  icon: string;
  hero_image: string | null;
  amount: number;
  payment_type: "unique" | "subscription";
  trust_badges: Array<{ label: string; icon: string | null }>;
  nbr_hours?: string;
  created_at: string;
  //headCoach: CoachType;
  //deputyCoach: CoachType;
  mentors: MentorType[];
  area: AreaType;
  stripe_product_id: string;
};

export type Optional<T> = {
  [K in keyof T]?: T[K];
};

export type test = {
  id: any;
};

export type TagType = {
  libelle: string;
  slud: string;
  code: string;
  image: string;
  link?: string;
};

export type AccordionType = {
  id: number | string;
  title: string;
  description: string;
  expanded: boolean;
};

export type MenuType = {
  destinations: MenuChildType[];
  living: MenuChildType[];
  courses: MenuChildType[];
  mba: any;
  profiling?: any;
};

export type MenuChildType = {
  menu: string;
  sub_menus: {
    id: string;
    title: string;
    slug: string;
  };
};

export type HomDataType = {
  id: string;
  lang: string;
  title: string;
  description: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  slides: { description: string; image: string; author: string }[];
  steps: { description: string; image: string; title: string }[];
  schools: { title: string; subtitle: string; mobile: string };
  coaches: { title: string; subtitle: string; mobile: string };
  mentors: { title: string; subtitle: string; mobile: string };
  languages: { title: string; subtitle: string; mobile: string };
  offers: { title: string; subtitle: string; mobile: string };
};

export type PageType = {
  id: string;
  lang: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  created_at: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
};

export type BannerType = {
  id: string;
  title: string;
  description?: string;
  picture: string | null;
  url: string | null;
  lang: string;
  click_count?: number;
  view_count?: number;
};

export type PartnerType = {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  created_at: string;
};

export type CoachType = {
  id: string;
  last_name: string;
  first_name: string;
  full_name: string;
  role: string;
  lc_country_id: number;
  country: object;
  country_flag: string;
  sex: string;
  photo: string;
  created_at: any;
  biography: string;
  interests: string;
  items: any[];
  offer: OfferType;
  public_profils: PublicProfilType;
};

export type PublicProfilType = {
  school_logo: string;
  school_name: string;
};

export type MentorType = {
  id: string;
  last_name: string;
  first_name: string;
  full_name: string;
  slug: string;
  phone: string;
  role: string;
  address: string;
  lc_country_id: number;
  lang: string;
  country: object;
  country_flag: string;
  city: string;
  sex: string;
  birthday: string;
  birthday_formatted: string;
  photo: string;
  created_at: any;
  biography: string;
  interests: string;
  items: any[];
  experiences: {
    logo: string;
    title: string;
    company: string;
    description: string;
    start_at: string;
    end_at: string;
    actual: number | boolean;
    duration: string;
    period: string;
  }[];
  formations: {
    logo: string;
    title: string;
    diploma: string;
    start_at: string;
    end_at: string;
    actual: number | boolean;
    duration: string;
    period: string;
  }[];
  public_profils: {
    logo: any;
    name: any;
    area_id: any;
    area_name: any;
  }[];
};

export type TeacherType = {
  id: string;
  last_name: string;
  first_name: string;
  full_name: string;
  slug: string;
  phone: string;
  role: string;
  address: string;
  lc_country_id: number;
  lang: string;
  country: object;
  country_flag: string;
  city: string;
  sex: string;
  birthday: string;
  birthday_formatted: string;
  photo: string;
  created_at: any;
  biography: string;
  interests: string;
  ideal_for: string[];
  materials: string[];
  rating: number | null;
  reviews_count: number;
  experience_years: number | null;
  is_favorite: boolean;
  items: any[];
  experiences: {
    logo: string;
    title: string;
    company: string;
    description: string;
    start_at: string;
    end_at: string;
    actual: number | boolean;
    duration: string;
    period: string;
  }[];
  formations: {
    logo: string;
    title: string;
    diploma: string;
    start_at: string;
    end_at: string;
    actual: number | boolean;
    duration: string;
    period: string;
  }[];
};

export type CourseType = {
  id: string;
  language: string;
  country_flag: string;
  slug: string;
  title: string;
  lang: string;
  description: string;
  levels: { name: string; description: string }[];
  status: boolean;
  picture: string;
  created_at: string;
  formulas: string;
  formulas_ids: string;
};

export type AreaType = {
  id: string;
  title: string;
  slug: string;
  lang: string;
  description: string;
  status: string;
  icon: string;
  created_at: string;
  nbr_schools: string;
  nbr_mentors: string;
  offer: OfferType;
};

export type LivingType = {
  id: string;
  country: any;
  country_flag?: string | null;
  title: string;
  slug: string;
  lang: string;
  description: string;
  hero_tagline?: string | null;
  deposit_label?: string | null;
  lease_duration_label?: string | null;
  charges_label?: string | null;
  average_rent_label?: string | null;
  status: boolean;
  picture: string;
  expenses: ExpenseType[];
  formulas: FormulaType[];
  created_at: string;
};

export type ExpenseType = {
  id: string;
  title: string;
  description: string;
  lang: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

export type OfferType = {
  id: string;
  title: string;
  description: string;
  items: Array<{ title: string; description: string }>;
  icon: string;
  headCoach: string;
  deputyCoach: string;
  amount: string;
  area: AreaType;
  created_at: string;
};

export interface PaginatedData {
  current_page: number;
  data: SchoolType[] | MentorType[] | TeacherType[] | any[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    active: boolean;
    label: string;
    url: string;
  }[];
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export type ProfilageType = {
  id: string;
  lang: string;
  title: string;
  picture: string;
  description: string;
  categories: { title: string; slug: string; description: string; icon: string }[];
};

export type OrderType = {
  id: string;
  user: any;
  offer: OfferType | FormulaType;
  service_id: string;
  service: AreaType | CourseType | LivingType;
  service_type: string;
  profile_id: string;
  profile: TeacherType | CoachType | MentorType;
  amount: number;
  status: string;
  status_value: string;
  status_color: string;
  can_retry_payment: boolean;
  created_at: string;
  mentalo: any;
  options: any;
  associated_service: CourseType | AreaType | LivingType;
  transaction?: { confirmed: boolean } & Record<string, any>;
};

export type MessageType = {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  type: "message" | "notification";
  read_at: string | null;
  sender: UserType | null;
  receiver: UserType | null;
  text: string;
  image: string;
  attachment: string;
  created_date: string;
  created_time: string;
};

export type UserType = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  is_online?: boolean;
  profile?: any;
};
