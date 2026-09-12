# Parité mobile / desktop — ce qu’il reste à intégrer

Fichier Figma : [Working_Files_Qiryrna](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna) (`cp2QlJNiQY7TzAUHQpFDM9`).

- Page mobile : `43:4` (artboards ~402 px)
- Page desktop : `0:1` · 🖥️ Web (artboards **1728 px**)
- Date du relevé : 2026-09-09

**Comment lire ce document**

| Statut | Signification |
|---|---|
| **Desktop Figma** | Un artboard 1728 px existe et a été porté dans `app/desktop-pages/` |
| **Chrome seul** | La route mobile s’affiche dans le shell desktop (nav + footer), sans maquette 1728 px dédiée |
| **Absent** | Pas d’écran desktop Figma, et pas de vue `desktop-pages/` |
| **Figma only** | Artboard desktop (ou mobile) sans route équivalente dans l’app |

Les noms Figma sont parfois trompeurs (titres copiés d’un autre écran, frame « Langues 2 » qui est du logement). Le mapping ci-dessous s’appuie sur le **contenu unique** de chaque frame.

---

## 1. Synthèse

| | Quantité |
|---|---|
| Routes mobile produit implémentées (hors `/dev`, `/compte` redirect) | **40** |
| Dont un vrai écran desktop Figma branché | **13 routes** (15 artboards, certains partagés) |
| Routes mobile encore en **chrome seul** | **27** |
| Artboards desktop Figma **non portés** | **12** |
| Artboards desktop **sans équivalent mobile** (collecte fiche école, MBA, recherche logement desktop) | **7** |

Le gros du travail restant n’est pas l’accueil ni l’auth : ce sont les **parcours d’achat** (langues, orientation, logement, MBA), **Mon projet** hors hub/admission, **messages** et **réglages**.

---

## 2. Déjà intégré (mobile + desktop Figma)

Ces routes ont un `desktop-pages/*.vue` branché via `shell:hidden` / `hidden shell:block`.

| Parcours | Route mobile | Fichier desktop | Artboard Figma desktop |
|---|---|---|---|
| Accueil | `/` | `desktop-pages/index.vue` | [Home page](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1004-3493) `1004:3493` |
| Connexion | `/connexion` | `desktop-pages/connexion.vue` | [Connexion](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=567-5582) `567:5582` |
| Inscription | `/inscription` | `desktop-pages/inscription.vue` | [Inscription-V2](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=640-6) `640:6` |
| Mot de passe oublié | `/mot-de-passe` | `desktop-pages/mot-de-passe.vue` | [Mot de passe oublié](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=576-38) `576:38` |
| Destination France | `/destinations/france` | `desktop-pages/destination-france.vue` | [Etudier France](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=694-2) `694:2` |
| Destination Chine | `/destinations/chine` | `desktop-pages/destination-chine.vue` | [Etudier Chine](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=631-2) `631:2` |
| Destination Canada | `/destinations/canada` | `desktop-pages/destination-country.vue` | [Etudier Canada](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=282-20) `282:20` |
| Destination Angleterre | `/destinations/angleterre` (alias UK) | idem | [Etudier Angleterre](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=290-396) `290:396` |
| Destination USA | `/destinations/etats-unis` (alias usa) | idem | [Etudier USA](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=292-1289) `292:1289` |
| Liste écoles | `/destinations/[slug]/ecoles` | `desktop-pages/domaines-etudes.vue` | [Domaines d'etudes](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=54-488) `54:488` |
| Fiche école | `/destinations/[slug]/ecoles/[school]` | `desktop-pages/fiche-ecole.vue` | [Fiche ecole](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=8-562) `8:562` |
| Mon projet (hub) | `/mon-projet` | `desktop-pages/mon-projet.vue` | [Mon projet](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=955-1230) `955:1230` |
| Admission | `/mon-projet/admission` | `desktop-pages/mon-projet-admission.vue` | [Mon projet admission](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=955-712) `955:712` + [Documents](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=909-789) `909:789` |

Chrome partagé (pas un écran métier) : `AppDesktopNav` (`1004:3494`) et `AppDesktopFooter` (`1031:2`).

---

## 3. Parcours mobile implémentés — équivalent desktop manquant

C’est la liste opérationnelle de **ce qu’il reste à intégrer** pour que chaque parcours mobile ait un vrai écran desktop.

### 3.1 Écoles / destinations

| Route | Figma mobile | Desktop aujourd’hui | Figma desktop |
|---|---|---|---|
| `/destinations` | [Choix de la Destination d'Étude](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=436-157) `436:157` | Chrome seul (grille mobile dans le shell 1728) | **Aucun** artboard liste pays |
| `/destinations/allemagne` (et tout pays hors FR/CN/CA/UK/US) | même fiche que `437:1077` Domaines d'Étude | Chrome seul (layout mobile) | **Pas** d’« Etudier Allemagne » / Espagne |
| `/destinations/[slug]` (Allemagne, etc.) | [Domaines d'Étude](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=437-1077) `437:1077` | Seulement 5 pays ont un écran 1728 | FR `694:2` · CN `631:2` · CA `282:20` · UK `290:396` · US `292:1289` |

### 3.2 Langues

| Route | Figma mobile | Desktop aujourd’hui | Figma desktop à porter |
|---|---|---|---|
| `/langues` | [Langue d'Apprentissage](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=422-3) `422:3` | Chrome seul | [Langues](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1003-1436) `1003:1436` — landing « Maîtrisez l'anglais… » |
| `/langues/[slug]/objectifs` | [Objectifs](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=808-530) `808:530` | Chrome seul | Pas d’artboard 1728 « objectifs » dédié (étape 1 du stepper de `601:1634`) |
| `/offres/[slug]` (formules Kilimandjaro / Aconcagua / Everest) | [Choisissez votre formule](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=452-865) `452:865` + `maquette/formule.html` | Chrome seul | [Choix de la formule](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=601-1634) `601:1634` |
| `/langues/[slug]/paiement-reussi` | [Langues - Post Payment](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=810-9) `810:9` | Chrome seul | [Succès](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=626-3338) `626:3338` (« Vos réservations sont confirmées ») |

### 3.3 Orientation

| Route | Figma mobile | Desktop aujourd’hui | Figma desktop à porter |
|---|---|---|---|
| `/orientation` | Frame sans nom `424:879` (parcours moi / enfant, CTA « Commencer mon orientation ») | Chrome seul | [Profilage](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=998-555) `998:555` |
| `/orientation/formules` | [Orientation Formules](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=795-1558) `795:1558` | Chrome seul | Pas d’artboard 1728 formules orientation (proche de `601:1634` / offres) |
| `/orientation/paiement-reussi` | [Orientation post paiement](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=795-432) `795:432` | Chrome seul | Pas d’artboard 1728 succès orientation (le `626:3338` Succès est **langues**) |
| `/offres/[slug]` (offre domaine / MBA) | [Offre d'Orientation](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=442-815) `442:815` | Chrome seul | [Offres d'accompagnement](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=341-3720) `341:3720` (**MBA**, pas le bilan orientation) |

### 3.4 Logement

| Route | Figma mobile | Desktop aujourd’hui | Figma desktop à porter |
|---|---|---|---|
| `/logement` | [Logement](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1070-26) `1070:26` | Chrome seul | **Aucun** artboard liste pays logement |
| `/logement/[slug]/decouverte` | [Logement sûr](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1591-2293) `1591:2293` | Chrome seul | [Langues 2](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=898-2) `898:2` — **mal nommé** : stepper « Choix du type de logement / Préférences et budget » |
| `/logement/[slug]` (formules Yukon / Comoé / Volga) | [Offres de Logement](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=452-247) `452:247` | Chrome seul | Pas d’artboard 1728 formules logement distinct (le `601:1634` est langues) |
| `/logement/paiement-reussi` | (maquette HTML `logement-post-paiement.html`, pas d’artboard clairement isolé hors flux) | Chrome seul | Pas d’artboard 1728 |

### 3.5 Mon projet (hors hub + admission)

| Route | Figma mobile | Desktop aujourd’hui | Figma desktop |
|---|---|---|---|
| `/mon-projet/apercu` | (maquette `mon-projet-apercu.html` ; pas d’artboard 402 px isolé sous ce nom) | Chrome seul | **Aucun** — le hub desktop `955:1230` est l’équivalent fonctionnel de `/mon-projet`, pas de `/apercu` |
| `/mon-projet/orientation` | [Mon projet](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=856-447) `856:447` (carte orientation) | Chrome seul | **Aucun** |
| `/mon-projet/logement` | [Mon Projet - Langues 3](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=862-790) `862:790` — **mal nommé** : titre « Ma progression logement » | Chrome seul | **Aucun** |
| `/mon-projet/langues` | [Mon Projet - Langue 1](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=860-4150) `860:4150` + [Langues 2](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=862-241) `862:241` | Chrome seul | **Aucun** |
| `/mon-projet/langues/certification` | [Mon Projet - Langues 4](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=863-1956) `863:1956` | Chrome seul | **Aucun** |
| `/mon-projet/langues/[id]/professeur` | [Mon Projet - Professeur](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=865-2982) `865:2982` | Chrome seul | [Choix de la formule](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=601-2406) `601:2406` — **mal nommé** : « Nos professeurs d'anglais » |
| `/mon-projet/langues/[id]/planifier` | [Créneau Professeur](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=858-3603) `858:3603` | Chrome seul | **Aucun** (le planning est un panneau de `617:662`) |
| `/mon-projet/langues/visio/[planningId]` | Pas d’artboard Figma (appel Zoom) | Chrome seul | **Aucun** |
| Fiche professeur (détail) | Pas de route mobile dédiée (liste + créneau) | — | [Profil du coach](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=617-662) `617:662` |

### 3.6 Messages, compte, réglages, CMS

| Route | Figma mobile | Desktop aujourd’hui | Figma desktop |
|---|---|---|---|
| `/messages` | [Mes messages](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=497-10) `497:10` | Chrome seul | **Aucun** |
| `/reglages` | [Réglages](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1188-1041) `1188:1041` (+ variante `816:622`) | Chrome seul | **Aucun** |
| `/reglages/informations-personnelles` | `1553:1020` | Chrome seul | **Aucun** |
| `/reglages/mot-de-passe` | [Reglages Mot de passe](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=810-3378) `810:3378` | Chrome seul | **Aucun** |
| `/reglages/langues` | [Reglages - Langues](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=810-1076) `810:1076` | Chrome seul | **Aucun** |
| `/reglages/theme` | [Reglages thème](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=810-2999) `810:2999` | Chrome seul | **Aucun** |
| `/reglages/centre-aide` | [Centre d'aide](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1586-1194) `1586:1194` | Chrome seul | **Aucun** |
| `/reglages/contact` | [Envoyer un message](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1572-3457) `1572:3457` + confirmation `1572:3044` | Chrome seul | **Aucun** |
| `/reglages/mentions` | [Informations légales](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1656-1204) `1656:1204` | Chrome seul | **Aucun** |
| `/reglages/mentions-legales` | [Mentions légales](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1659-1287) `1659:1287` | Chrome seul | **Aucun** |
| `/reglages/exercer-mes-droits` | [Exercer mes droits](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1588-1722) `1588:1722` | Chrome seul | **Aucun** |
| `/pages/[slug]` (CGU, cookies, FAQ, privacy) | [Politique de cookies](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1562-1890) `1562:1890` (cookies seulement) | Chrome seul, layout générique | **Aucun** 1728 |
| `/paiement-reussi` | [Paiement réussi](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=516-403) `516:403` | Chrome seul | Proche de `330:2555` (succès **collecte / pay**, pas le même parcours) |
| `/compte` | — | Redirect → `/reglages` | — |

---

## 4. Catalogue Figma desktop → mobile

Tous les artboards 1728 px de la page `0:1`, avec la route mobile correspondante.

| # | Artboard | Node | Correspondance mobile | Porté ? |
|---|---|---|---|---|
| 1 | Home page | `1004:3493` | `/` (`418:2927` home page) | **Oui** |
| 2 | Connexion | `567:5582` | `/connexion` (`442:1105`) | **Oui** |
| 3 | Inscription-V2 | `640:6` | `/inscription` (`453:2167`) | **Oui** |
| 4 | Mot de passe oublié | `576:38` | `/mot-de-passe` (`453:1756`) | **Oui** |
| 5 | Etudier France | `694:2` | `/destinations/france` (`437:1077`) | **Oui** |
| 6 | Etudier Chine | `631:2` | `/destinations/chine` | **Oui** |
| 7 | Etudier Canada | `282:20` | `/destinations/canada` | **Oui** |
| 8 | Etudier Angleterre | `290:396` | `/destinations/angleterre` | **Oui** |
| 9 | Etudier USA | `292:1289` | `/destinations/etats-unis` | **Oui** |
| 10 | Domaines d'etudes | `54:488` | `/destinations/[slug]/ecoles` (`524:2` Liste ecole) | **Oui** |
| 11 | Fiche ecole | `8:562` | `/destinations/[slug]/ecoles/[school]` (`440:160`) | **Oui** |
| 12 | Mon projet | `955:1230` | `/mon-projet` (`470:3`) | **Oui** |
| 13 | Mon projet admission | `955:712` | `/mon-projet/admission` (`856:1251` / `856:2156`) | **Oui** |
| 14 | Mon projet - Admission_Documents | `909:789` | même route, onglet Documents | **Oui** |
| 15 | Langues | `1003:1436` | `/langues` (`422:3`) | **Non** |
| 16 | Choix de la formule (Everest / Aconcagua / Kilimandjaro) | `601:1634` | `/offres/[slug]` langues (`452:865`) | **Non** |
| 17 | Succès (réservations cours) | `626:3338` | `/langues/[slug]/paiement-reussi` (`810:9`) | **Non** |
| 18 | Choix de la formule — en réalité **grille professeurs** | `601:2406` | `/mon-projet/langues/[id]/professeur` (`865:2982`) | **Non** |
| 19 | Profil du coach | `617:662` | pas de fiche prof isolée ; proche de `865:2982` + `858:3603` | **Non** |
| 20 | Profilage | `998:555` | `/orientation` (`424:879`) | **Non** |
| 21 | Offres d'accompagnement (MBA) | `341:3720` | `/offres/[slug]` si offre MBA ; pas d’écran mobile MBA dédié | **Non** |
| 22 | Langues 2 — en réalité **recherche logement** | `898:2` | `/logement/[slug]/decouverte` (`1591:2293`) | **Non** |
| 23 | Collecte d'informations — Infos Générales | `54:5530` | **Pas de route mobile** (parcours post-achat fiche école) | **Non** |
| 24 | Collecte — Projet d'étude | `327:658` | idem | **Non** |
| 25 | Collecte — Documents | `329:1235` | proche de l’onglet documents admission, mais wizard checkout distinct | **Non** |
| 26 | Collecte — succes | `330:2058` | pas de route | **Non** |
| 27 | Collecte — succes pay | `330:2555` | pas de route (proche `/paiement-reussi`) | **Non** |

### 4.1 Artboards desktop sans jumeau mobile

À traiter comme **nouveaux parcours**, pas comme un simple relooking :

1. **Collecte d’informations** (`54:5530` → `327:658` → `329:1235` → succès) — wizard « Parcours Fiche École » après achat d’un accompagnement école. Inexistant dans `app/pages/`.
2. **Offre MBA** (`341:3720`) — landing « Offre unique MBA ». La nav desktop pointe encore MBA vers `/destinations`.
3. **Recherche logement desktop** (`898:2`) — stepper 4 étapes (type / préférences / résultats / …) plus large que « Logement sûr » mobile.
4. **Profil du coach** (`617:662`) — fiche professeur complète (desktop-only aujourd’hui).

---

## 5. Inventaire mobile Figma (page `43:4`) — couverture app

Écrans 402 px dont le contenu est déjà dans `app/pages/` (y compris via un autre nom de frame).

| Frame Figma | Node | Route |
|---|---|---|
| home page | `418:2927` | `/` |
| home page-menu | `551:2` | menu latéral (`AppSideMenu`), pas une route |
| Connexion | `442:1105` | `/connexion` |
| Inscription | `453:2167` | `/inscription` |
| Mot de passe | `453:1756` | `/mot-de-passe` |
| Choix de la Destination d'Étude | `436:157` | `/destinations` |
| Domaines d'Étude | `437:1077` | `/destinations/[slug]` |
| Liste ecole | `524:2` | `/destinations/[slug]/ecoles` |
| École Spéciale d'Architecture | `440:160` | `/destinations/[slug]/ecoles/[school]` |
| Langue d'Apprentissage | `422:3` | `/langues` |
| Objectifs | `808:530` | `/langues/[slug]/objectifs` |
| Choisissez votre formule | `452:865` | `/offres/[slug]` (langues) |
| Langues - Post Payment | `810:9` | `/langues/[slug]/paiement-reussi` |
| *(sans nom)* orientation | `424:879` | `/orientation` |
| Offre d'Orientation | `442:815` | `/offres/[slug]` (domaine) |
| Orientation Formules | `795:1558` | `/orientation/formules` |
| Orientation post paiement | `795:432` | `/orientation/paiement-reussi` |
| Logement | `1070:26` | `/logement` |
| Logement sûr | `1591:2293` | `/logement/[slug]/decouverte` |
| Offres de Logement | `452:247` | `/logement/[slug]` |
| Mon projet | `470:3` | `/mon-projet` |
| Mon projet (détail) | `856:447` | `/mon-projet/orientation` |
| Mon Projet Admission ×2 | `856:1251`, `856:2156` | `/mon-projet/admission` |
| Mon Projet - Langue 1 / 2 | `860:4150`, `862:241` | `/mon-projet/langues` |
| Mon Projet - Langues 3 (logement) | `862:790` | `/mon-projet/logement` |
| Mon Projet - Langues 4 | `863:1956` | `/mon-projet/langues/certification` |
| Mon Projet - Professeur | `865:2982` | `/mon-projet/langues/[id]/professeur` |
| Créneau Professeur | `858:3603` | `/mon-projet/langues/[id]/planifier` |
| Mes messages | `497:10` | `/messages` |
| Paiement réussi | `516:403` | `/paiement-reussi` |
| Réglages (+ variante) | `1188:1041`, `816:622` | `/reglages` |
| Infos perso / MDP / langues / thème | `1553:1020`, `810:3378`, `810:1076`, `810:2999` | `/reglages/*` |
| Centre d'aide / contact / confirmation | `1586:1194`, `1572:3457`, `1572:3044` | `/reglages/centre-aide`, `/reglages/contact` |
| Mentions / légales / droits / cookies | `1656:1204`, `1659:1287`, `1588:1722`, `1562:1890` | `/reglages/mentions*`, `/reglages/exercer-mes-droits`, `/pages/cookies` |
| Menu | `549:841` | overlay, pas une route |
| Onglets | `1715:1177` | composant, pas un écran |

Hors Figma mobile mais dans l’app : visio Zoom (`/mon-projet/langues/visio/[planningId]`), pages CMS génériques, `/dev/*`.

---

## 6. Ordre d’intégration suggéré

Priorité métier (ce que la nav desktop vend déjà, mais qui retombe sur le layout mobile) :

1. **Langues** — landing `1003:1436` → formules `601:1634` → succès `626:3338` → professeurs `601:2406` + fiche `617:662`
2. **Orientation** — profilage `998:555` puis formules / succès (à designer ou à dériver du mobile)
3. **Logement** — liste pays (pas d’artboard : à créer ou à calquer sur destinations) puis `898:2`
4. **Destinations** — grille `/destinations` + fiche Allemagne (pas d’artboard)
5. **MBA** — `341:3720` (aujourd’hui le lien nav envoie vers `/destinations`)
6. **Collecte fiche école** — wizard 5 écrans, nouveau parcours
7. **Mon projet** restant, **messages**, **réglages** — aucun artboard 1728 ; soit on les dessine, soit on assume le chrome seul

---

## 7. Fichiers de référence dans le repo

- Branchement desktop : `app/desktop-pages/README.md`
- Layout 1728 : `docs/desktop-layout.md`
- Vues desktop : `app/desktop-pages/`
- Routes (seules URLs Nuxt) : `app/pages/`
