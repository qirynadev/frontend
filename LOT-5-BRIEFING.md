# Prompt de reprise — LOT 5

> À coller tel quel au démarrage de la nouvelle session.

---

## 0. CONTEXTE — à lire avant toute chose

Tu reprends le front-end client de **Qiryna** (plateforme EdTech : études à l'étranger,
langues, hébergement, orientation). Projet **Nuxt 4 / Vue 3 / TypeScript strict**,
écrit mobile-first, à `C:\laragon\www\qiryna-front`.

| Dossier | Rôle |
|---|---|
| `app/`, `server/`, `i18n/`, `tests/` | le projet Nuxt 4 (ce sur quoi tu travailles) |
| `maquette/pwa/` | **la spécification** : 15 pages HTML + `css/app.css` (7 823 lignes) |
| `legacy/` | ancien front Vue 3 / Vite — **à porter, pas à réécrire** |
| `public/_maquette/` | copie locale de la maquette servie par Nuxt (gitignorée, pour comparaison) |

**Les lots 1 à 4 sont livrés et validés.** Lis dans cet ordre avant de coder :

1. `DESIGN-SYSTEM.md` — tokens, 31 primitives, règles de contribution
2. `ARCHITECTURE-API.md` — couche anti-corruption, BFF, procédure de bascule API
3. `ARCHITECTURE-LAYOUT.md` — `useDevice`, layouts, point d'arbitrage desktop
4. `LOT-4.md` — tunnel public, écarts de données assumés
5. `app/core/README.md` — sens de dépendance de la couche application

### Démarrer

```bash
npm run dev        # http://localhost:3000
npm test           # 151 tests, ~1,3 s
npm run typecheck
```

---

## 1. RÈGLES PERMANENTES — non négociables

### Interdits

- ❌ **Aucune couleur, espacement, rayon ou taille de police en dur.** Tout passe par
  les tokens de `app/assets/css/main.css` (`@theme`). Si une valeur manque, on l'ajoute
  au thème avec un commentaire disant d'où elle vient.
- ❌ **Aucun `$fetch` hors de `app/core/http/`.** Vérifiable :
  `grep -rn '\$fetch' app/pages app/components app/design-system app/layouts` → vide.
- ❌ **Aucun `import` remontant vers la présentation dans `app/core/`.**
- ❌ **Aucune chaîne visible en dur** : tout passe par i18n, **fr ET en**, clés triées,
  parité vérifiée.
- ❌ **Pas de `localStorage`** pour la session. Cookie `httpOnly`.
- ❌ **Pas de PNG > 100 Ko.** Logos et pictogrammes en SVG, photos en `<NuxtImg format="webp">`.

### Conventions établies

- **`--spacing: 1px`** : `p-17` vaut 17px, `gap-10` vaut 10px. Déviation assumée du défaut
  Tailwind, pour coller aux valeurs Figma au pixel.
- **Icônes** : les 206 SVG de la maquette sont dans `public/icons/`. `QIcon` les sert par
  nom de fichier (`ic-bell`, `nav-home`, `flag-fr`) en `<img>`. Un registre inline sert
  les rares cas que la maquette ne dessine pas (recherche, vide, erreur).
- **Quatre états obligatoires** par vue : chargement (squelettes, jamais de spinner plein
  écran), vide, erreur, nominal. Le composant `PageState` les aiguille.
- **HTML éditorial** : toujours passer par `sanitizeHtml` (fait dans les adapters) puis
  `<RichText>`. Jamais de `v-html` direct.
- **Locale explicite** : `repo.method(args, locale.value)` et `{ watch: [locale] }`.
  L'API traduit réellement — un oubli affiche du français sur tout le site anglais.

---

## 2. LA MÉTHODE DE FIDÉLITÉ — la plus importante

L'utilisateur exige **100 % de conformité visuelle avec la maquette**. Une reconstruction
« à partir des valeurs CSS » a déjà été rejetée. La méthode qui fonctionne :

1. **Lire le bloc CSS de la page** dans `maquette/pwa/css/app.css` (`.objectifs-*`,
   `.lpp-*`…), **y compris les `@media (max-width: 360/375/380/390/400px)`** — c'est là
   que se cachent les erreurs.
2. **Lire le HTML** de `maquette/pwa/pages/<page>.html`.
3. Écrire le markup avec les valeurs exactes.
4. **Mesurer**, ne pas estimer.

### Le harnais de mesure

La maquette est servie sur la même origine (`/_maquette/pages/…`), ce qui permet de
lire le DOM des deux versions depuis une iframe :

```js
// dans la console du navigateur, sur http://localhost:3000
async function render(url) {
  const f = document.createElement('iframe')
  f.style.cssText = 'position:fixed;left:-9999px;top:0;width:375px;height:2200px;border:0'
  document.body.appendChild(f); f.src = url
  await new Promise(r => { f.onload = r; setTimeout(r, 9000) })
  await new Promise(r => setTimeout(r, 1800))
  return f
}
const mq = await render('/_maquette/pages/connexion.html')
const nx = await render('/connexion')
// puis comparer getBoundingClientRect() + getComputedStyle() élément par élément :
// w, h, x, y, fontSize, lineHeight, borderRadius, backgroundColor, color, padding, gap
```

Écarts à **ignorer** (faux positifs connus) :
- `9999px` vs `rounded-full` (calc infinity) — rendu identique
- `font-size: 13.33px` sur un `<button>` de la maquette — défaut UA, invisible
- différences de **longueur de texte** dues aux données réelles vs contenu figé

⚠️ **Le cookie `qiryna_locale` doit valoir `fr`** avant de comparer, sinon tu compares
une maquette française à une page anglaise. `document.cookie = 'qiryna_locale=fr; path=/'`.

---

## 3. ÉTAT EXACT AU DÉBUT DU LOT 5

### Livré et mesuré au pixel

| Écran | Route | Vérifié |
|---|---|---|
| Shell (barre haute, logo, nav basse, réassurance) | — | ✅ |
| Accueil | `/` | ✅ 16/16 éléments |
| **Menu latéral** | (accueil) | ✅ 15/15 |
| Destinations | `/destinations` | ✅ 13/13 |
| Langues | `/langues` | ✅ |
| **Objectifs** | `/langues/[slug]/objectifs` | ✅ 12/12 |
| **Formules** | `/offres/[slug]` | ✅ accents exacts |

> **`objectifs.html` est déjà fait**, contrairement à ce que dit le brief du Lot 5.
> Ne le refais pas.

### Livré mais **pas encore mesuré** (rendu correct, fidélité non garantie)

`/destinations/[slug]` (domaines) · `/destinations/[slug]/ecoles` · `.../ecoles/[school]`
· `/orientation`

### Écrans provisoires à remplacer

`/messages`, `/mon-projet`, `/compte` sont des `PagePlaceholder` de 5 lignes.

### Ce qui est déjà en place pour l'authentification

| Élément | Fichier | État |
|---|---|---|
| Cookie de session `httpOnly` | `app/core/http/session.ts` + `session.constants.ts` | ✅ écrit, jamais alimenté |
| Purge de session | `server/api/bff/session.delete.ts` | ✅ |
| Gestion du 401 | `app/core/http/client.ts` → `onUnauthorized()` | ✅ purge + `location.assign('/connexion?redirect=…')` |
| `ApiError.kind === 'unauthorized' \| 'validation'` + `fieldErrors` | `app/core/http/errors.ts` | ✅ |
| Primitives de formulaire | `QInput` (état valide/invalide, œil), `QCheckbox`, `QPasswordStrength`, `QSocialButton`, `QSegmentedControl` | ✅ testées dans `/dev/ui` |

---

## 4. LOT 5 — Authentification et paiement

### Pages à produire

| # | Page Nuxt | Maquette | Note |
|---|---|---|---|
| 1 | `connexion.vue` | `connexion.html` | |
| 2 | `inscription.vue` | `inscription.html` | |
| 3 | `mot-de-passe.vue` | `mot-de-passe.html` | frise d'étapes verticale |
| 4 | `langues/[slug]/confirmation.vue` | `langues-post-payment.html` | **finalise le parcours langue** |
| 5 | `paiement-reussi.vue` | `paiement-reussi.html` | |
| 6 | `mon-projet.vue` | `mon-projet.html` | ~78 classes, le plus gros écran |

Chacune : quatre états, SEO, i18n fr/en, **mesurée** contre la maquette.

### Règles spécifiques

- **Token en cookie `httpOnly`** via `useCookie`, jamais en `localStorage`. Le SSR doit
  pouvoir lire la session.
- **OAuth** (Google, Facebook, LinkedIn) : composants `<ClientOnly>`, hors périmètre SSR.
  Reprends la logique de `legacy/` — notamment la gestion du paramètre `state` (CSRF).
- **Stripe** : `<ClientOnly>` également. Porte la logique existante, ne la réinvente pas.
- Routes authentifiées : `definePageMeta({ ssr: false })` ou middleware de garde.

⚠️ **Ne réécris pas les intégrations OAuth et Stripe depuis zéro. Lis `legacy/` et
porte le code existant.** Ce sont les parties les plus fragiles et les plus coûteuses
à déboguer.

---

## 5. LE PARCOURS DE PAIEMENT — exigence métier

> Le paiement Stripe n'est déclenché **que si l'utilisateur est inscrit et connecté**.
> Sinon il est redirigé vers la connexion ; **après login, il repart automatiquement
> vers le paiement s'il en avait un en attente.**

Ce qu'il faut construire :

1. **Intention de paiement en attente.** Quand un visiteur non connecté clique
   « Choisir cette formule », on mémorise ce qu'il voulait acheter — offre, palier,
   `stripe_product_id`, objectif choisi — puis on l'envoie vers `/connexion?redirect=…`.
   Stocke-la dans un **cookie `httpOnly` court** (pas de `localStorage` : la règle vaut
   aussi ici) ou côté serveur, associée à la session.
2. **Reprise après authentification.** À la fin d'un login **ou** d'une inscription, si
   une intention existe, on reprend le paiement au lieu de renvoyer à l'accueil.
   Le même chemin doit fonctionner après un login OAuth (retour de redirection).
3. **Garde côté serveur, pas seulement côté client.** L'initialisation du paiement doit
   refuser une requête sans session — un contrôle uniquement dans le composant se
   contourne.
4. **Intention à usage unique** : elle est consommée dès que le paiement démarre, et
   expire (quelques dizaines de minutes). Sinon un utilisateur qui se reconnecte trois
   jours plus tard repart vers un paiement qu'il avait abandonné.

### ⚠️ Correction importante sur « rediriger vers Stripe »

Le back-office **n'expose pas Stripe Checkout**. Le flux réel de `legacy/` est
**Stripe Elements** — saisie de la carte dans la page :

```
POST /payment/init      → { order, redirectUrl }     // redirectUrl = authentification 3-D Secure
POST /payment/validate  → { confirmed, failed, order }
POST /payment/retry     → { order_id }
GET  /payment/list      → { orders }
```

Il n'y a donc **pas de redirection vers une page hébergée par Stripe**, sauf pour la
SCA (`redirectUrl`). Vérifie ce point avec l'équipe API avant de coder : si un endpoint
Checkout doit être ajouté, c'est une décision back-end, pas une invention front.

### 🔴 À signaler à l'équipe : clé Stripe **live** en recette

`GET /all-data` → `settings.site.stripe_pk_api_key` vaut **`pk_live_51M3VTj…`** sur
l'environnement de recette. Une clé *live* sur un environnement de test permet des
paiements réels depuis la recette. **À remonter avant tout branchement du paiement.**

---

## 6. OÙ SE TROUVE LE CODE À PORTER

| Sujet | Fichier `legacy/` |
|---|---|
| Store d'authentification (login, register, OAuth, mot de passe oublié) | `src/stores/auth/index.ts` — voir `loginWithSocial`, `registerWithSocial`, `confirmSocialLink`, `authenticateWithSocial`, `registerWithLinkedin`, `forgotPassword`, `resetPassword`, `resendCode` |
| Store de paiement | `src/stores/payment/index.ts` — `iniPayment`, `doPayment`, `retryPayment`, `fetchUserPayment` |
| Composant Stripe | `src/components/atoms/StripeCard.vue` (`@stripe/stripe-js` + `vue-stripe-js`, clé lue depuis `settings.site.stripe_pk_api_key`) |
| Écran de succès | `src/pages/Payment/Success.vue` |
| Boutons sociaux | `src/pages/Login/_Partials/{GButton,FButton,LButton}.vue` et les mêmes sous `Register/` |
| Écrans d'auth | `src/pages/Login/Index.vue`, `src/pages/Register/Index.vue` |
| Intercepteur HTTP + 401 | `src/services/UseHttp.ts`, `src/services/httpService.ts` |
| **Documentation OAuth** | `legacy/API_OAUTH_ENDPOINTS.md` (endpoints, codes d'erreur, quotas) et `legacy/OAUTH_IMPLEMENTATION.md` |

Endpoints OAuth : `POST /api/auth/social/register`, `POST /api/auth/social/login`
(limites : 5 et 10 requêtes/minute).

Dépendances côté legacy : `vue3-google-login`, `@healerlab/vue3-facebook-login`,
`vue3-linkedin-login`, `@vue-stripe/vue-stripe`, `@stripe/stripe-js`.
Vérifie leur compatibilité Nuxt 4 / SSR avant de les installer ; sinon porte la logique
sans le paquet.

---

## 7. ARCHITECTURE — où mettre quoi

```
app/core/contracts/    types du DOMAINE (User, Session, Order, PaymentIntent…)
app/core/adapters/     API → domaine, défensif, pur, testé
app/core/repositories/ authRepo, paymentRepo, orderRepo — signatures que l'app voudrait
app/core/http/         seul endroit qui parle réseau
app/core/stores/       Pinia (useSessionStore…)
server/api/bff/        routes Nitro ; c'est ici que le jeton httpOnly est lu/écrit
```

Le navigateur ne parle **qu'au BFF** (`/api/bff/**`). Il ne connaît ni l'URL de l'API,
ni le jeton. Les appels authentifiés doivent donc passer par une route Nitro qui rattache
`Authorization` côté serveur — c'est la seule façon de garder `httpOnly` utile.

Ajoute des **tests unitaires sur les adapters** (nominal, champ manquant, cas dégradé),
comme les 151 existants.

---

## 8. ORDRE DE TRAVAIL SUGGÉRÉ

1. **Session de bout en bout d'abord** : contrat `Session`/`User`, `authRepo`, routes BFF
   `POST /api/bff/session` (login) et `DELETE` (déjà là), middleware de garde. Sans ça,
   les écrans n'ont rien à brancher.
2. `connexion.vue` puis `inscription.vue` — mesurées.
3. Intention de paiement + reprise après login.
4. `langues/[slug]/confirmation.vue` — **finalise le parcours langue**, la priorité de
   l'utilisateur.
5. `mot-de-passe.vue`, `paiement-reussi.vue`.
6. `mon-projet.vue` (le plus gros).

**STOP après le Lot 5.** Validation humaine avant le Lot 6.

---

## 9. DETTE CONNUE À NE PAS OUBLIER

- **Logo** : `AppLogo.vue` affiche un WebP détouré du PNG de 1,93 Mo. **Demander le
  fichier vectoriel à l'équipe design.**
- **Slugs traduits par l'API** (`/destinations/chine` ↔ `/en/destinations/china`) : un
  changement de langue depuis une page de détail tombe sur un 404. Table de correspondance
  à prévoir au Lot 6.
- **Filtre par domaine d'étude non livré** : `GET /areas-of-studies/{id}` répond 500.
- **`public/_maquette/` pèse 27 Mo** : à supprimer quand la passe de fidélité sera finie.
- **`sharp`** installé pour convertir les images ; le VPS devra l'avoir aussi.
