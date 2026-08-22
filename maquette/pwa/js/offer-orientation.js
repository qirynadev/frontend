/**
 * Textes des 4 prestations de l'offre candidature (`offre-orientation.html`),
 * variantes par domaine d'étude (query `?domaine=`).
 */
export const OFFER_FEATURES_BY_DOMAINE = {
  architecture: {
    projet: "Construisez un portfolio et un projet créatif aligné avec les exigences des écoles d'architecture.",
    aptitude: "Préparation aux concours, épreuves graphiques et tests d'aptitude spatial.",
    dossier: "Optimisation de votre book, lettres de motivation et pièces graphiques pour vos candidatures.",
    entretien: "Simulation d'oral de concours et présentation de projet devant un jury.",
  },
  management: {
    projet: "Clarifiez votre projet professionnel et vos ambitions dans le management et la finance.",
    aptitude: "Préparation au Tage Mage, GMAT et autres tests d'admission des grandes écoles de commerce.",
    dossier: "Rédaction et relecture de CV, lettres et essays pour un dossier MBA / grande école convaincant.",
    entretien: "Entraînements aux oraux de motivation, assessment et entretiens en anglais.",
  },
  ingenierie: {
    projet: "Définissez un projet d'ingénieur cohérent avec votre filière et vos objectifs de carrière.",
    aptitude: "Préparation aux concours, tests scientifiques et épreuves de classement.",
    dossier: "Structuration du dossier Parcoursup / candidatures et valorisation de votre profil scientifique.",
    entretien: "Simulation d'entretien technique et oral de motivation devant un jury d'école d'ingénieurs.",
  },
  medecine: {
    projet: "Affinez votre projet d'études de santé et vos choix de spécialisation.",
    aptitude: "Préparation aux épreuves classantes, QCM et concours d'accès aux études de santé.",
    dossier: "Optimisation du dossier candidature, lettres de motivation et relevés pour PASS / LAS.",
    entretien: "Simulation d'entretien de motivation et mise en situation pour les oraux d'admission.",
  },
  "sciences-politiques": {
    projet: "Construisez un projet académique et professionnel en sciences politiques ou relations internationales.",
    aptitude: "Préparation aux tests d'aptitude, concours et épreuves d'admission des IEP / Sciences Po.",
    dossier: "Rédaction et relecture de dossiers, dissertations et lettres pour vos candidatures.",
    entretien: "Simulation d'oral de concours et entretien de motivation sur l'actualité et votre projet.",
  },
  sciences: {
    projet: "Clarifiez votre orientation scientifique et vos objectifs de recherche ou d'insertion pro.",
    aptitude: "Préparation aux tests scientifiques, concours et épreuves d'admission des filières sélectives.",
    dossier: "Optimisation du dossier candidature, CV académique et lettres pour vos vœux.",
    entretien: "Simulation d'entretien de motivation et présentation de votre parcours scientifique.",
  },
};

const DEFAULT_DOMAINE = "architecture";

export function applyOfferFeaturesByDomaine(domaine, root = document) {
  const features =
    OFFER_FEATURES_BY_DOMAINE[domaine] ||
    OFFER_FEATURES_BY_DOMAINE[DEFAULT_DOMAINE];

  root.querySelectorAll("[data-oo-features] [data-oo-feature]").forEach((item) => {
    const key = item.getAttribute("data-oo-feature");
    const descEl = item.querySelector(".oo-feature-desc");
    if (descEl && features[key]) {
      descEl.textContent = features[key];
    }
  });
}
