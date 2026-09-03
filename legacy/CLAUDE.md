# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Vue d'ensemble du projet

Qiryna est une application Vue 3 + TypeScript construite avec Vite. C'est une plateforme multilingue (français/anglais) proposant des fonctionnalités d'appels vidéo (Zoom Video SDK), de traitement des paiements (Stripe), et diverses fonctionnalités éducatives/de mentorat incluant des cours, des écoles, des programmes MBA et des systèmes de profilage/évaluation.

## Commandes de développement

### Commandes de base
- `npm install` - Installer les dépendances
- `npm run dev` - Démarrer le serveur de développement avec rechargement à chaud
- `npm run build` - Vérifier les types et construire pour la production (exécute type-check + build-only en parallèle)
- `npm run build-only` - Construire sans vérification des types
- `npm run type-check` - Exécuter la vérification des types TypeScript avec vue-tsc
- `npm run preview` - Prévisualiser le build de production localement

### Notes
- Le processus de build utilise `run-p` (npm-run-all2) pour exécuter la vérification des types et la construction en parallèle
- La vérification des types TypeScript est effectuée avec `vue-tsc --build --force`

## Architecture

### Stack technique
- **Framework** : Vue 3 (Composition API avec `<script setup>`)
- **Outil de build** : Vite 5
- **Langage** : TypeScript
- **Styling** : TailwindCSS + SCSS + Bootstrap 5
- **Gestion d'état** : Pinia avec persistance (pinia-plugin-persistedstate)
- **Routage** : Vue Router 4 avec intégration i18n
- **Bibliothèques UI** : Element Plus, Headless UI
- **Icônes** : Heroicons, Lucide Vue Next, Element Plus Icons

### Internationalisation (i18n)

L'application utilise un **système de routage avec préfixes de locale** où chaque route est dupliquée pour chaque locale supportée (français/anglais).

**Structure des routes :**
- Les routes sont organisées dans les répertoires `src/router/fr/` et `src/router/en/`
- Chaque route a un préfixe de locale dans son nom (ex: `fr.home`, `en.home`)
- Le routeur utilise `Tr.routeMiddleware` pour gérer la détection et le changement de locale
- Utiliser le helper `i18nRoute()` de `src/utils/index.ts` pour générer des objets de route avec la locale

**Système de traduction :**
- Géré via `vue-i18n` avec des fichiers de locale chargés à la demande dans `src/i18n/locales/`
- L'objet `Trans` dans `src/i18n/translation.ts` fournit des utilitaires :
  - `Trans.currentLocale` - Obtenir/définir la locale actuelle
  - `Trans.switchLanguage(locale)` - Changer de langue (charge les messages, met à jour l'attribut lang HTML, persiste dans le store)
  - `Trans.i18nRoute(to)` - Générer un objet de route avec préfixe de locale
- La locale est persistée via SettingStore et auto-détectée depuis les préférences du navigateur

### Gestion d'état (Pinia Stores)

Situés dans `src/stores/`, organisés par domaine :
- `auth` - Authentification, données utilisateur, informations de réunion
- `app` - État global de l'application
- `settings` - Préférences utilisateur incluant la locale
- `payment`, `course`, `school`, `living`, `mba`, `profilage`, `mentalo` - Stores spécifiques par domaine

Tous les stores sont exportés depuis `src/stores/index.ts`. Les stores utilisent `pinia-plugin-persistedstate` pour la persistance automatique.

### Couche de service HTTP

**Architecture :**
- `src/services/UseHttp.ts` - Crée l'instance axios avec les intercepteurs
- `src/services/httpService.ts` - Classe `HttpService` encapsulant les méthodes HTTP

**Fonctionnalités clés :**
- Authentification par token via l'en-tête `Authorization: Bearer`
- En-tête de locale (`lang`) automatiquement ajouté depuis SettingStore
- Gestion automatique des erreurs et normalisation des réponses
- Retourne une structure de réponse cohérente : `{ data, success, status, message }`
- Les erreurs réseau déclenchent l'invalidation du token

**Utilisation :**
```typescript
const http = new HttpService(useToken: boolean = true)
await http.get(uri)
await http.post(uri, formData, config)
await http.patch(uri, formData)
await http.put(uri, formData)
await http.deleted(uri, formData)
```

### Architecture des composants

Les composants suivent les principes du design atomique :
- `src/components/atoms/` - Blocs de base (boutons, cartes, items)
- `src/components/molecules/` - Composants composés (accordéons, menus, pagination)
- `src/components/modals/` - Boîtes de dialogue modales

**Loaders :**
- Situés dans `src/components/atoms/loaders/`
- Inclut des loaders spécialisés : CardLoader, DomaineCardLoader, GlobalLoader, MentorCardLoader, TagLoader

### Système de layouts

Trois layouts principaux dans `src/layout/` :
- `AppLayout.vue` - Layout principal de l'application
- `AuthLayout.vue` - Layout des pages d'authentification
- `ProfilageLayout.vue` - Layout du système d'évaluation/profilage

Les routes sont regroupées par layout dans la configuration du routeur.

### Organisation des pages

Les pages sont organisées par fonctionnalité dans `src/pages/` :
- `Dashboard/` - Tableau de bord principal incluant `Meeting/Call.vue` pour les appels vidéo Zoom
- `Course/`, `School/`, `Mba/`, `Living/` - Pages spécifiques par domaine
- `Login/`, `Register/`, `ForgotPassword/` - Authentification
- `Payment/` - Flux de paiement Stripe
- `Profiling/` - Système d'évaluation/profilage
- `Static/` - Pages CGU, FAQ, mentions légales

### Appels vidéo (Zoom Video SDK)

Implémenté dans `src/pages/Dashboard/Meeting/Call.vue` :
- Utilise `@zoom/videosdk` avec contrôles `VideoQuality`
- Fonctionnalités : mise en sourdine audio/vidéo, partage d'écran, plein écran
- Élément personnalisé `<video-player-container>` enregistré dans la config Vite
- S'intègre avec les données de réunion depuis AuthStore

### Intégrations tierces

- **Paiement** : Stripe via `@vue-stripe/vue-stripe` et `@stripe/stripe-js`
- **Authentification** : Google (`vue3-google-login`), Facebook (`@healerlab/vue3-facebook-login`), LinkedIn (`vue3-linkedin-login`)
- **Calendrier** : FullCalendar avec vues jour/heure/liste
- **Vidéo** : Zoom Video SDK avec UI Toolkit

### Variables d'environnement

Variables d'environnement requises (voir `env.d.ts` pour les types) :
- `VITE_API_BASE_URL` - URL de base de l'API backend
- `VITE_GOOGLE_CLIENT_ID` - ID client OAuth Google
- `VITE_BASE_URL` - URL de base pour l'historique du routeur
- `VITE_DEFAULT_LOCALE` - Locale par défaut (ex: "fr")
- `VITE_SUPPORTED_LOCALES` - Locales supportées séparées par des virgules (ex: "fr,en")

### Alias de chemins

- `@/` - Pointe vers `src/`
- `~bootstrap` - Pointe vers `node_modules/bootstrap`

### Configuration TypeScript

- Utilise les références de projet avec `tsconfig.json`, `tsconfig.app.json` et `tsconfig.node.json`
- Support des types pour les SFC Vue via `vue-tsc`
- Types d'éléments personnalisés déclarés dans `env.d.ts`

## Patterns de développement

### Ajouter de nouvelles routes

1. Créer le composant de page dans `src/pages/`
2. Ajouter la définition de route dans **les deux** répertoires `src/router/fr/modules/` et `src/router/en/modules/`
3. Utiliser des noms avec préfixe de locale (ex: `fr.feature-name`, `en.feature-name`)
4. Pour les routes protégées par authentification, ajouter `meta: { requiresAuth: true }`

### Navigation

Toujours utiliser le helper `i18nRoute()` pour la navigation programmatique :
```typescript
import { i18nRoute } from '@/utils'
router.push(i18nRoute({ name: 'home' }))
```

### Requêtes HTTP

Utiliser la classe `HttpService` pour tous les appels API :
```typescript
import { HttpService } from '@/services/httpService'

const http = new HttpService() // avec token d'auth
const { data, success, message } = await http.get('/api/endpoint')

const httpNoAuth = new HttpService(false) // sans token d'auth
```

### Utilisation des stores

```typescript
import { useAuthStore } from '@/stores'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, token } = storeToRefs(authStore) // refs réactives
```

### Styling

- Le styling principal utilise les classes utilitaires TailwindCSS
- Styles globaux dans `src/main.css` et `src/styles.scss`
- Les composants Element Plus utilisent le thème Element Plus
- Utilitaires Bootstrap disponibles via l'alias `~bootstrap`

## Handoff : implémenter un écran Figma → code (mobile, pixel-fidèle)

Déclencheur : l'utilisateur colle un lien `figma.com/design/...?node-id=...`. Le fichier Figma de référence est **"Working_Files_Qiryrna"** (`fileKey: cp2QlJNiQY7TzAUHQpFDM9`). Les écrans de ce fichier sont des maquettes **mobile app** (frame iPhone avec status bar). Suivre ce process à chaque fois, sans redemander sauf ambiguïté réelle (voir dernière section).

### 1. Récupérer le design

1. Charger la guidance `figma-design-to-code` **avant** tout appel à `get_design_context` (skill si dispo, sinon resource `skill://figma/figma-design-to-code/SKILL.md` du serveur `plugin_figma_figma`).
2. Extraire `fileKey` et `nodeId` de l'URL (`?node-id=442-1105` → `nodeId: "442:1105"`).
3. Appeler `get_design_context` avec `clientFrameworks: "vue"`, `clientLanguages: "typescript"`.
4. Le nom du node (ex. "Connexion", "Mot de passe") indique l'écran visé.

### 1bis. Si le quota Figma MCP est épuisé (fallback capture d'écran)

- Le siège Figma de l'utilisateur (View) est limité à **6 appels `get_design_context`/mois** (pas par jour) — voir erreur "tool call limit for your View seat". Un siège Dev/Full donnerait 200/jour (Professional) au lieu de 6/mois, mais c'est une action d'administration côté compte Figma, pas quelque chose que je peux faire.
- Si le quota est épuisé : ne jamais deviner/fabriquer le design. Demander une **capture d'écran** à la place et construire la page à partir de l'image (moins précis au pixel que `get_design_context`, mais fonctionnel).
- Dès qu'une page construite via capture d'écran est terminée, l'ajouter à la liste **"Pages à repasser via Figma"** ci-dessous, avec son URL Figma (fileKey + node-id) si connue.
- Quand l'accès `get_design_context` est rétabli, reprendre ces pages une par une pour corriger les écarts au pixel près, puis les retirer de la liste.

#### Pages à repasser via Figma (construites via capture d'écran, à revalider au pixel près)

_(vide — les 3 pages construites via capture d'écran ont toutes été recorrigées via `get_design_context` une fois l'accès Figma Dev obtenu :)_

- `src/pages/School/Index.vue` — corrigé via node `437-1077`. Couleurs réelles des cercles d'icônes de stats (`#e8e1fe`/`#def5e3`/`#fdf3e4`/`#fde8eb`) + vraies icônes (images téléchargées, plus de réutilisation des SVG inline desktop), fond du bandeau `#f7f6fc`, taille du titre "Choisissez un domaine d'étude" corrigée (14px).
- `src/pages/School/AreasSchools.vue` — corrigé via node `524-2`. Style des pills de domaine (sélectionné `border-[#8873fe] bg-[#f8f8fd]`), bouton flèche next en cercle blanc avec ombre (au lieu d'un cercle outline), tailles de texte du heading/count, carte école sans bordure (ombre seule, comme Figma). "Année de création"/"X étudiants" restent **volontairement omis** (aucun champ réel équivalent dans `SchoolType`/`SchoolResource.php`, confirmé) ; cœur favoris toujours décoratif.
- `src/pages/School/SchoolPresentation.vue` — corrigé via node `440-160`. Boutons favoris/partager déplacés en overlay sur la photo hero (au lieu d'une rangée séparée en dessous, comme dans le Figma réel), couleur du texte de localisation `#0d1b3e`, carte formation sans bordure (ombre seule), bouton CTA transformé en pill outline (`border-[#450ff2]`) au lieu d'un lien texte inline. Le badge "ÉCOLE / SPÉCIALE / D'ARCHITECTURE / PARIS" du Figma (texte fixe multi-lignes) reste remplacé par le vrai logo de l'école — plus robuste pour un nom d'école dynamique de longueur variable. "Grade Master | X ans" par formation reste omis (confirmé : aucun champ réel dans `formations` JSON).

### 2. Trouver la page cible dans le code

- Chercher dans `src/pages/` la page existante qui correspond fonctionnellement (Login, Register, ForgotPassword, etc.) — pas par ressemblance visuelle, par **fonction** (le design mobile a souvent un layout complètement différent du desktop actuel).
- Si aucune page existante ne correspond et que ce n'est pas évident où le composant doit vivre, **demander** avant d'implémenter (ne pas deviner un nouveau module/route).

### 3. Structure d'intégration

- Ne **jamais** réécrire ou supprimer le layout desktop existant. Ajouter un bloc **mobile séparé** :
  - Nouveau bloc `class="... lg:hidden"` inséré **avant** le panneau desktop, contenant le rendu pixel-fidèle du design Figma.
  - Le panneau desktop existant passe de `flex`/`block` à `hidden lg:flex` (ou `lg:block`), sans autre changement.
- **Ne pas coder la status bar iOS** (heure 9:41, wifi, réseau, batterie) : c'est du chrome OS simulé par la maquette Figma, pas du contenu applicatif.
- **Bottom tab bar** (Accueil / Messages / Orientation / Mon projet / Compte) : ne jamais dupliquer son markup. Réutiliser `<MobileAppBottomNav :active="..." />` (`src/components/molecules/MobileAppBottomNav.vue`). Valeurs possibles de `active` : `home | messages | orientation | project | account`. Si un nouvel écran a une bottom bar différente, étendre ce composant plutôt que d'en créer un autre.
  - Mapping route actuel (approximatif, faute d'équivalent exact pour "Orientation"/"Mon projet") : Accueil→`home`, Messages→`user-messages`, Orientation→`profilage`, Mon projet→`user-evaluations`, Compte→`user-settings`.
- **Couleur d'accent** : les maquettes mobile de ce fichier Figma utilisent un violet (`#582cfd`, `#3b2cf2`, `#4920fc`, `#5825fd`) différent du rouge desktop (`#FC1E3D`). C'est voulu dans le design — le respecter tel quel, ne pas "corriger" vers le rouge.
- **Réutiliser la logique existante** : ne jamais dupliquer les refs/handlers du `<script setup>` de la page (ex. `formValue`, `isLoading`, `onSubmit`, `goToRegister`, `goToLogin`, les stores). Le bloc mobile doit binder les mêmes refs que le bloc desktop.
- **Boutons sociaux** (Google/Facebook/Apple) : réutiliser `FButton.vue` / `GButton.vue` (`src/pages/Login/_Partials/`) avec `variant="stacked"` pour le style icône+texte 2 lignes du mobile, plutôt que de recoder l'auth. Apple n'a pas d'auth réelle → `AButton.vue` (visuel uniquement, `disabled`).

### 4. Assets

- Télécharger directement les URLs `imgXxx` retournées par `get_design_context` (elles expirent sous ~7 jours) :
  ```bash
  curl -sL "<url>" -o tmp && file -b --mime-type tmp   # déduire l'extension (svg/png/jpg) puis renommer
  ```
- Ranger dans `src/assets/images/<nom-ecran>-mobile/` (ex. `login-mobile/`, `forgot-password-mobile/`), sauf les assets d'un composant déjà partagé (ex. icônes de la bottom nav → `src/assets/images/mobile-nav/`, réutilisées, pas re-téléchargées).
- Exclure les assets de status bar (cap/wifi/cellular/battery/vector de batterie).
- Préserver exactement la géométrie de crop donnée par Figma (dimensions/positions en `%` ou `px` du conteneur `overflow-hidden` + l'`<img>` positionné en absolu) — ne pas recadrer "à la main" différemment.

### 5. i18n

- Toujours ajouter les clés dans **fr.json ET en.json**, au même endroit relatif dans les deux fichiers.
- Réutiliser une clé existante si son texte correspond mot pour mot au design (ex. `email-placeholder`, `forgot-email-label`, `or`, `signin-me`, `signup`).
- Sinon créer une clé préfixée par l'écran, ex. `login-mobile-*`, `forgot-mobile-*`. Ne jamais hardcoder du texte visible dans le template.
- **Page mobile-first auto-suffisante (logo, form, bottom nav propres) → vérifier `meta: { hideNav: true, hideFooter: true }` sur sa route** (`src/router/routes.ts`). Sans ça, le `NavBar`/`Footer` globaux (`AppLayout.vue`) s'affichent quand même par-dessus l'écran Figma. Exemple : `signin`/`signup` l'avaient déjà, `password-forgot` ne l'avait pas et laissait passer l'ancien navbar en mobile.
- **Ligne "titre + illustration" (texte à gauche, image à droite) qui déborde/se fait recouvrir** : NE PAS essayer de positionner l'image en `absolute` par-dessus une ligne pleine largeur en devinant des coordonnées — fragile, deux tentatives ont échoué en pratique (le titre finissait quand même recouvert). Utiliser le pattern éprouvé de `ForgotPassword/Index.vue` (référence canonique) : ligne `flex` normale, colonne texte `flex-1` (elle wrap naturellement, pas besoin de `whitespace-nowrap`), colonne image `shrink-0` de taille fixe **avec `overflow-hidden`** — l'`overflow-hidden` est la clé : il empêche physiquement l'image (positionnée en `absolute` à l'intérieur avec un offset négatif pour le cadrage) de déborder de sa boîte, donc elle ne peut jamais manger le texte, quels que soient les chiffres exacts de crop copiés depuis Figma.
- **Timelines/listes à plusieurs colonnes synchronisées (icône | badge numéro | texte) avec des connecteurs verticaux** : ne jamais reproduire littéralement le pattern Figma "3 colonnes globales + `rotate-90` sur une ligne fine (`h-px`) pour simuler un trait vertical". Une image tournée avec `rotate-90` garde sa boîte de layout non tournée (donc quasi 0px de hauteur réservée dans le flux) → les colonnes se désynchronisent et le texte qui wrap différemment qu'en Figma casse l'alignement. À la place : découper en **une ligne flex par étape** (`items-stretch`), avec le connecteur comme `div` `flex-1` (`w-px bg-<couleur-bordure>`) entre l'icône/badge et l'étape suivante — la hauteur s'adapte alors automatiquement à la hauteur réelle du texte, quel que soit le nombre de lignes après retour à la ligne.
- **Rangée de cartes/boutons `flex-1` censés faire la même largeur (ex. les 3 boutons sociaux stacked) qui se déforment** : un flex item garde `min-width: auto` par défaut, donc il refuse de rétrécir sous la largeur intrinsèque de son contenu — le mot le plus long non coupable (ex. "Facebook" vs "Google"/"Apple") force sa carte à être plus large que les autres même avec `flex-1` sur toutes. Toujours ajouter `min-w-0` en plus de `flex-1` sur CHAQUE niveau flex concerné (le composant racine ET le bouton interne s'il y en a un). Vérifier aussi que le `flex-1` est bien posé sur l'élément RACINE du composant (`<template>` à plusieurs racines type `v-if`/`v-else` : chaque branche doit porter `flex-1`/`min-w-0` elle-même, un wrapper `<div>` sans ces classes autour d'un enfant qui les a ne sert à rien).
- **`@` dans une valeur de traduction casse la compilation vue-i18n** (syntaxe réservée pour les "linked messages" → erreurs `Invalid linked format` / `Unexpected empty linked key` au runtime, invisibles au `type-check`). Toujours l'échapper `{'@'}` (convention déjà utilisée dans le projet, ex. `validation.password-complexity`) — ex. un placeholder d'email : `"exemple{'@'}email.com"`.

### 6. Vérification (pas de navigateur/Playwright dans cet environnement)

1. `npm run type-check` — doit passer sans erreur.
2. Lancer `npm run dev -- --port <port>` en arrière-plan (le serveur écoute en IPv6 `[::1]`, pas `127.0.0.1` — utiliser `curl -6 "http://[::1]:<port>/..."`).
3. Pour chaque `.vue` modifié/créé et chaque asset référencé, `curl` l'URL module Vite (`/src/pages/.../Index.vue`, `/src/assets/images/.../fichier.svg`) et vérifier un `200` sans "Internal server error" — ça confirme la compilation SFC et la résolution des imports sans avoir besoin d'un rendu visuel.
4. Arrêter le process (`taskkill //F //PID <pid>` après avoir trouvé le PID via `netstat -ano | grep <port>`).

### 7. Quand demander à l'utilisateur

Ne pas redemander la structure/les conventions ci-dessus (déjà validées). Ne demander que si :
- la page cible dans le code n'est pas identifiable avec confiance ;
- le design contient un élément sans équivalent dans l'app actuelle et le choix a un impact fonctionnel réel (pas juste esthétique) ;
- une divergence de contenu/texte entre le Figma et l'existant change le comportement (ex. wording légal, CGU).
