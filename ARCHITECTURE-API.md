# Qiryna — Couche anti-corruption API

> Lot 2. Ce document explique **comment le front absorbe la refonte de l'API sans
> réécriture de page**, et donne la procédure exacte de bascule le jour où les nouveaux
> endpoints arriveront.

---

## 1. Ce que l'API renvoie réellement

Mesures prises sur `GET https://admin.stage.qiryna.com/api/all-data` le 12 août 2026.

| Bloc | Poids | Contenu |
|---|---:|---|
| `schoolSheets` | **3 375 Ko** | 6 destinations × 570 écoles, **présentation HTML intégrale incluse** |
| `offers` | 474 Ko | 8 formules |
| `pages` | 25 Ko | texte intégral des CGU, cookies, FAQ, confidentialité |
| `mentors` | 9 Ko | 4 mentors |
| `homeData`, `menu`, `settings`, `banners`, `partners` | 7 Ko | |
| **Total** | **4 391 Ko** | à chaque rendu de page, dans l'implémentation naïve |

### Les défauts constatés, un par un

| # | Constat | Où il est absorbé |
|---|---|---|
| 1 | `/all-data` est un dump monolithique de 4,4 Mo | `server/utils/catalog.ts` (cache + réduction) |
| 2 | Les endpoints publics sont indexés par `{id}`, pas par slug | `server/api/bff/**` (résolution serveur) |
| 3 | **21 slugs d'école sont dupliqués** sur 570 (`universite-lille`, `hec-paris`, `insead`, `essec-business-school`…) | `dedupeBySlug` |
| 4 | `schoolSheets[].title` contient une **accroche marketing**, pas le nom du pays. Le vrai nom est dans `country.name` | `destination.adapter.ts` |
| 5 | `country` a deux formes : `{ id, name, iso_alpha_2 }` sur une destination, `{ name }` seul sur une école | `toCountry` |
| 6 | Les dates sont au format **`JJ/MM/AAAA`** (`"13/01/2026"`), pas ISO | `toIsoDate` |
| 7 | `formations` et `details` contiennent une entrée fantôme `{ title: null, description: null }` — 428 écoles sur 570 n'ont que ça | `toFormations` / `toDetails` |
| 8 | `founded_year` et `student_count` sont `null` pour **les 570 écoles** | contrat `School` (exposés, jamais inventés) |
| 8b | **`formations[]` n'expose que `title` + `description`** — pas de `grade` ni `duration` (maquette `.ed-form-meta`) | mock `resolveFormationMeta` (`config/formation-meta-mock.ts`) : lit l’API si un jour présents, sinon infère depuis le titre, sinon « Grade Master » / « 3 ans » |
| 9 | `hero_title`, `cta_text`, `badge_label`, `area` sont `null` pour **les 8 formules** | `toOfferSummary` (repli sur `title`) |
| 10 | Une école a `title`, `slug` et `presentation` vides | filtre dans `toDestination` |
| 11 | Les clés `foreignLanguages`, `costOfLiving`, `staticPages`, `livingFormulas` — que l'ancien front lisait — **n'existent pas** dans la réponse | navigation défensive : `list()` renvoie `[]` |
| 12 | `courseFormulas`, `coaches`, `teachers` sont des tableaux vides | idem |
| 13 | Le nom des réseaux sociaux mélange les casses (`facebook`, `Instagram`) | `toSiteSettings` |
| 14 | Le back-office restreint l'accès par IP : `/all-data` peut répondre **403** | `ApiError.kind === 'forbidden'` |

---

## 2. L'architecture retenue

```
┌── navigateur ─────────────────────────────────────────────────┐
│  pages / components                                           │
│         ↓  (ne connaissent que les contrats du domaine)       │
│  core/stores          ← Pinia, état partagé                   │
│         ↓                                                     │
│  core/repositories    ← list() / bySlug()                     │
│         ↓                                                     │
│  core/http/client.ts  ← bffFetch, 401, retry                  │
└─────────┬─────────────────────────────────────────────────────┘
          │  /api/bff/**  (11 Ko d'amorçage, pas 4 400 Ko)
┌─────────▼──── serveur Nitro ──────────────────────────────────┐
│  server/api/bff/**            ← routes du BFF                 │
│         ↓                                                     │
│  server/utils/catalog.ts      ← cache Nitro + réduction       │
│         ↓                                                     │
│  core/adapters/**             ← ★ COUCHE ANTI-CORRUPTION      │
│         ↓                                                     │
│  core/http/api-client.ts      ← seul fichier qui connaît l'API│
└─────────┬─────────────────────────────────────────────────────┘
          │  GET /all-data
     admin.stage.qiryna.com
```

### Ce que la règle d'or interdit

`app/core/` ne contient **aucun** `import` venant de `components/`, `design-system/`,
`layouts/` ou `pages/`. Vérifiable :

```bash
grep -rn "from '.*\(components\|design-system\|layouts\|pages\)" app/core/
```

Et aucun composant n'appelle le réseau directement :

```bash
grep -rn '\$fetch' app/pages app/components app/design-system app/layouts
```

Les deux commandes ne renvoient rien.

---

## 3. Pourquoi un BFF Nitro plutôt qu'un appel direct

Le brief demandait un cache Nitro sur `/all-data`. En le mettant en place, un choix
s'imposait : **où adapter ?**

Adapter côté client obligerait à transmettre les 4,4 Mo au navigateur à chaque
navigation client (le cache Nitro n'aide que le rendu serveur). Adapter côté serveur
permet de n'envoyer au navigateur que ce qu'il affiche.

Mesures réelles, serveur de production local :

| Route | Premier appel (cache froid) | Appels suivants | Poids envoyé au client |
|---|---:|---:|---:|
| `/api/bff/catalog` | 2 182 ms | **41 ms** | **11,3 Ko** |
| `/api/bff/destinations` | — | 41 ms | 1,9 Ko |
| `/api/bff/destinations/france` | — | 66 ms | 41,8 Ko |
| `/api/bff/schools?destination=france&perPage=3` | — | 40 ms | 1,3 Ko |
| `/api/bff/schools/hec-paris` | — | 41 ms | 2,0 Ko |
| `/api/bff/pages/cgu` | — | 65 ms | 6,7 Ko |
| `/api/bff/offers/ingenierie` | — | 47 ms | 1,4 Ko |

**11,3 Ko d'amorçage au lieu de 4 391 Ko : −99,7 %.** Le cache est en mode `swr` :
une lenteur de l'API sert la version précédente plutôt qu'une page blanche.

Bénéfice collatéral : le navigateur ignore l'URL de l'API, ce qui rend le cookie de
session `httpOnly` réellement utilisable (voir § 6).

---

## 4. Les contrats

`app/core/contracts/` décrit ce que **l'application veut consommer**.

La distinction structurante est `SchoolSummary` / `School` :

```ts
interface SchoolSummary {          // ce dont une liste a besoin
  id; slug; title; city; logo; image; country; destinationSlug; formationCount
}

interface School extends SchoolSummary {   // ce dont une fiche a besoin
  presentation; formations (title, summary, sections, bodyHtml, grade, duration); details; foundedYear; studentCount; seo
}
```

L'API ne fait pas cette distinction — elle renvoie toujours la fiche complète. Nous, si.
Le jour où un endpoint allégé existera, les pages de liste n'auront pas à changer :
elles consomment déjà `SchoolSummary`.

Même logique pour `DestinationSummary` / `Destination` et `OfferSummary` / `Offer`.

### Un exemple de correction de contrat

```ts
interface DestinationSummary {
  title: string    // ← country.name : « France »
  tagline: string  // ← api.title : « L'excellence universitaire reconnue… »
}
```

L'API met une accroche dans `title`. Une page qui afficherait `destination.title` en
titre de fiche afficherait une phrase de 55 caractères là où « France » est attendu.
La correction est faite une fois, dans l'adapter.

---

## 5. Les adapters

`app/core/adapters/` — **tout le code sale du projet est ici, et nulle part ailleurs.**

### Règles tenues

1. **Aucune absence de champ ne produit un crash.** `str`, `num`, `bool`, `list`, `dig`
   naviguent défensivement ; testé sur `null`, `undefined`, un nombre, une chaîne, un
   tableau.
2. **Les collisions de slug sont journalisées et arbitrées de façon déterministe.**

```ts
// dedupeBySlug — tri par `id` croissant, première entrée retenue
[qiryna:adapter] écoles de « france » : 11 collision(s) de slug, première entrée par id retenue
```

   Le tri explicite compte : sans lui, l'entrée retenue dépendrait de l'ordre de la
   réponse HTTP et pourrait **différer entre le HTML du serveur et l'hydratation du
   client**. Vérifié : deux appels consécutifs à `/api/bff/schools/universite-lille`
   renvoient bien le même `id` (`0d549216…`, le plus petit des deux).

3. **Aucun composant ne voit une réponse API brute.** Les routes BFF renvoient
   exclusivement des types de `core/contracts`.

### Ce qui est normalisé au passage

| Entrée API | Sortie domaine |
|---|---|
| `"13/01/2026"` | `"2026-01-13"` (et `null` sur `"31/02/2024"`, date impossible) |
| `{ name: 'France' }` ou `{ id, name, iso_alpha_2: 'FR' }` | `{ name: 'France', code: 'FR' \| null }` |
| `"<p>Issue de la <strong>fusion</strong>&nbsp;de 2017</p>" ` | `"Issue de la fusion de 2017"` pour le SEO |
| `"photos/logo.png"` (chemin relatif) | `null` — mieux qu'une image cassée |
| `amount: 490, payment_type: "unique"` | `{ amount: 490, currency: 'EUR', mode: 'once' }` |
| `hero_title: null` | repli sur `title` |
| `{ title: null, description: null }` | entrée supprimée |

---

## 6. Session et 401

- Le jeton vit dans un cookie **`httpOnly`** (`qiryna_session`). Aucun `localStorage`.
- Le rendu serveur lit la session : une page protégée se rend dès le premier octet.
- Le JavaScript du navigateur **ne peut pas** lire le jeton — c'est le but. Les appels
  authentifiés partent du BFF, qui rattache `Authorization` côté serveur. Le cookie ne
  quitte jamais l'origine.
- Sur 401, `bffFetch` purge la session (`DELETE /api/bff/session`, seule façon d'effacer
  un cookie `httpOnly`) et renvoie vers `/connexion?redirect=…`.

> **Note d'implémentation.** `bffFetch` n'utilise **aucun composable Nuxt**. Un
> repository est appelé depuis un `useAsyncData`, donc après un `await` : le contexte
> Nuxt n'y est plus garanti et `useRuntimeConfig()` y lève `NUXT_E1001`. Le préfixe du
> BFF est donc une constante (`BFF_BASE`), et la redirection après 401 passe par
> `location.assign` — ce qui a l'avantage de repartir d'un état vierge.

---

## 7. Erreurs

Aucun composant ne voit une `FetchError` ni une réponse Laravel brute : il reçoit une
`ApiError` dont le `kind` suffit à décider quoi afficher.

| `kind` | Origine | Rejoué ? |
|---|---|---|
| `network` | serveur injoignable | ✅ |
| `timeout` | délai dépassé | ✅ |
| `server` | 5xx | ✅ |
| `unauthorized` | 401 | ❌ → purge de session + redirection |
| `forbidden` | 403 (restriction d'IP du back-office) | ❌ |
| `notFound` | 404 | ❌ → les repositories renvoient `null` |
| `validation` | 422 | ❌ → `fieldErrors` indexées par champ |

Les tentatives sont gérées à la main plutôt que déléguées à `ofetch` : **un POST n'est
jamais rejoué** (un doublon de commande coûte plus cher qu'une erreur affichée), un GET
l'est jusqu'à trois fois avec attente progressive.

---

## 8. Tests

```bash
npm test
```

**100 tests, 6 fichiers, 1,1 s.** Les adapters et le client bas niveau sont purs — ni
Vue, ni Nuxt, ni réseau — donc testables sans environnement Nuxt.

Les fixtures (`tests/fixtures/all-data.ts`) sont des **extraits réels de la recette**,
défauts compris : c'est ce qui leur donne leur valeur.

| Fichier | Ce qui est couvert |
|---|---|
| `primitives.spec.ts` | navigation défensive, dates `JJ/MM/AAAA`, dates impossibles, HTML → texte, URL relatives, **déduplication déterministe** |
| `destination.adapter.spec.ts` | nominal, **champ manquant**, **slug dupliqué**, inversion `title`/`tagline`, écoles sans id |
| `school.adapter.spec.ts` | nominal, entrées fantômes, `founded_year` null, version liste |
| `offer.adapter.spec.ts` | nominal, repli `hero_title`, items vides, badges sans libellé |
| `common.adapter.spec.ts` | pays (2 formes), prix, SEO, menu, réglages, accueil, pages |
| `api-client.spec.ts` | enveloppe Laravel, en-têtes, **rejeu réseau**, **non-rejeu d'un POST**, classement des erreurs |

Les trois cas exigés par le brief — réponse nominale, champ manquant, slug dupliqué —
sont couverts pour chaque adapter.

### Vérification manuelle

`/dev/api` (développement uniquement) exerce **chaque repository** dans un vrai contexte
Nuxt, en rendu serveur puis après hydratation, et affiche les poids réels. C'est le
pendant de `/dev/ui` pour le Lot 1.

---

## 9. Procédure de bascule quand l'API changera

**Un seul fichier à modifier : `server/utils/catalog.ts`.**

### 9.1 Quand `/bootstrap` existera

```diff
- const raw = await apiClient(event, locale).request<Record<string, unknown>>('/all-data')
- const catalog: Catalog = { menu: toMenu(raw.menu), … }
+ const catalog = await apiClient(event, locale).request<Catalog>('/bootstrap')
```

### 9.2 Quand `/destinations/{slug}` existera

`server/api/bff/destinations/[slug].get.ts` devient un relais :

```diff
- const { destinations } = await getSnapshot(event)
- const destination = destinations.find((item) => item.slug === slug)
+ const raw = await apiClient(event, readLocale(event)).request(`/destinations/${slug}`)
+ const destination = toDestination(raw)
```

L'adapter reste : c'est lui qui garantit que le contrat ne change pas.

### 9.3 Ce qui ne bouge pas

- `core/contracts/` — sauf si le **domaine** change, ce qui est une décision produit.
- `core/repositories/` — les signatures sont déjà celles de l'API cible.
- `core/stores/`, `pages/`, `components/`, `design-system/` — **rien**.

### 9.4 Quand les collisions de slug seront corrigées en base

`dedupeBySlug` cessera simplement de journaliser. Le laisser en place coûte une passe
`O(n)` et protège d'une régression.

---

## 10. Variables d'environnement

| Variable | Défaut | Rôle |
|---|---|---|
| `NUXT_API_BASE_URL` | `https://admin.stage.qiryna.com/api` | URL de l'API. **Serveur uniquement.** |
| `NUXT_CATALOG_CACHE_TTL` | `300` | Durée de vie du cache catalogue, en secondes |
| `NUXT_API_TIMEOUT` | `15000` | Délai maximal d'un appel, en millisecondes |

`runtimeConfig.public` est **vide** : le navigateur n'a besoin de connaître ni l'URL de
l'API, ni la durée du cache.

---

## 11. Points d'attention pour la suite

1. **Le cache est en mémoire de processus.** Suffisant pour un VPS mono-instance. Si le
   déploiement passe à plusieurs instances, brancher un stockage Nitro partagé (Redis)
   via `nitro.storage` — sans toucher au reste.
2. **`mentors` n'a pas de contrat complet.** Seul `MentorSummary` existe, alimenté par
   les formules. La fiche mentor viendra avec l'écran qui l'affiche.
3. **`toIsoDate` n'est pas encore utilisé par les adapters de contenu** : aucun contrat
   du Lot 2 n'expose de date. La fonction est écrite et testée pour les écrans de
   commande et de rendez-vous (Lot 5+), où `created_at` deviendra visible.
4. **`sharp` ne s'installe pas en `win32-x64`** dans cet environnement : `@nuxt/image`
   n'optimise pas localement. Sans effet tant qu'aucune photo n'est intégrée ; à vérifier
   sur le VPS avant le lot qui reprendra les visuels.
