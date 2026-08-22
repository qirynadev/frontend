# Comparatif maquette ↔ frontend — analyse et alignement

> Document de référence pour aligner la PWA maquette (`UzaLab/qiryna`) avec
> l'application Nuxt (`qirynadev/frontend`, copie locale `frontend-main/`).
>
> Dernière mise à jour : 2026-08-18  
> Maquette analysée : branche `main` (validée visuellement)  
> Frontend analysé : `frontend-main/` (Nuxt 4, sans remote configuré)

---

## 1. Résumé exécutif

| | Maquette | Frontend |
|---|---|---|
| **Rôle** | Spec UX/UI validée, prototype navigable | Application prod (SSR, API, auth) |
| **Stack** | HTML + `css/app.css` + JS modules | Nuxt 4 + Vue 3 + Tailwind v4 + Pinia |
| **Données** | Mocks statiques (`schools.js`, etc.) | BFF `/api/bff/*` + adapters |
| **Déploiement** | Vercel, root `pwa/` | Nuxt (`npm run build`) |
| **Lien entre les deux** | — | `npm run maquette:sync` ← branche **`release`** de `UzaLab/qiryna` |

Le frontend **ne copie pas** le HTML : il **reproduit** la maquette en composants Vue
(`Q*`) et tokens Tailwind, écran par écran, avec mesure au pixel.

**Principe de gel visuel** : tout ce qui est validé sur `main` ne doit **pas changer
d'un pixel**. L'alignement stack se fait par des **couches additives** (métadonnées,
tokens miroir, cartographie) — jamais par une refonte visuelle de la maquette.

---

## 2. Stacks comparées

### 2.1 Maquette (`pwa/`)

```
pwa/
├── index.html          # Hub dev (sitemap), pas l'accueil app
├── pages/*.html        # ~32 écrans
├── css/app.css         # ~14 800 lignes, tokens :root + styles par page
├── js/
│   ├── schools.js      # Catalogue écoles + détail formations
│   ├── logement-offres.js
│   ├── components.js   # Trust bar, pagination
│   ├── theme-init.js / theme.js
│   └── …
├── assets/icons|images/
├── sw.js               # Cache-first offline (v93+)
└── docs/               # Workflow git, layout nav, etc.
```

**Layout type :**

```
.screen-shell → .screen.page-XXX → .xxx-header → .xxx-main (scroll)
                                              └── .bottom-nav (fixed)
```

**Tokens clés (`:root`) :**

- `--q-primary: #582cfd`
- `--q-shell-max: 768px`
- `--q-gutter`, `--q-nav-inset`, `--q-nav-gap`
- `--q-content-pad-bottom` (espace au-dessus de la bottom-nav)
- Dark mode : `html[data-theme="dark"]`

### 2.2 Frontend (`frontend-main/`)

```
frontend-main/
├── app/
│   ├── pages/              # Routes Nuxt (37 .vue)
│   ├── components/         # Composants métier (auth, school, offer…)
│   ├── design-system/      # 31 primitives Q* (QButton, QCard, QBottomNav…)
│   ├── assets/css/main.css # Tokens @theme Tailwind v4
│   ├── core/               # contracts → adapters → repositories → stores
│   ├── layouts/            # default.vue → mobile.vue
│   └── composables/        # usePageData, useAuthFlow…
├── server/api/bff/         # 38 endpoints Nitro (proxy API)
├── maquette/pwa/           # Copie sync depuis UzaLab/qiryna release
├── scripts/sync-maquette.mjs
└── *.md                    # DESIGN-SYSTEM.md, REPRISE.md, ARCHITECTURE-API.md…
```

**Architecture data :**

```
Page Vue → repository → bffFetch → server/api/bff → adapter → API externe
```

**i18n :** français `/`, anglais `/en/**`.

---

## 3. Cartographie routes maquette → frontend

| Maquette | Route frontend | Statut indicatif |
|---|---|---|
| `home.html` | `/` | ✅ mesuré |
| `connexion.html` | `/connexion` | ✅ |
| `inscription.html` | `/inscription` | ✅ |
| `mot-de-passe.html` | `/mot-de-passe` | ✅ |
| `messages.html` | `/messages` | ✅ |
| `reglages.html` | `/reglages` | ✅ |
| `reglages-theme.html` | `/reglages/theme` | ✅ UI (dark non fonctionnel côté Nuxt) |
| `reglages-mdp.html` | `/reglages/mot-de-passe` | ✅ |
| `reglages-langues.html` | `/reglages/langues` | ✅ |
| `reglages-mentions.html` | `/reglages/mentions` | ✅ |
| `destination-etude.html` | `/destinations` | ⚠️ à remesurer |
| `domaines-etude.html` | `/destinations/[slug]` | ⚠️ Lot 4 |
| `liste-ecole.html` | `/destinations/[slug]/ecoles` | ⚠️ Lot 4 |
| `ecole-detail.html` | `/destinations/[slug]/ecoles/[school]` | ✅ avancé (tabs, modale, CTA) |
| `offre-orientation.html` | `/offres/[slug]` (domaine) | ✅ palier unique |
| `orientation-scolaire.html` | `/orientation` | ⚠️ à remesurer |
| `orientation-formules.html` | `/orientation/formules` | ✅ pile verticale |
| `orientation-post-paiement.html` | `/orientation/paiement-reussi` | ❌ |
| `logement.html` | `/logement` | ✅ refait |
| `offres-logement.html` | `/logement/[slug]` | ❌ prochain chantier |
| `logement-post-paiement.html` | `/logement/paiement-reussi` | ❌ |
| `langue-apprentissage.html` | `/langues` | ✅ |
| `objectifs.html` | `/langues/[slug]/objectifs` | ✅ |
| `formule.html` | `/offres/[slug]` (langue) | ✅ carrousel |
| `langues-post-payment.html` | `/mon-projet/langues/…` | partiel |
| `mon-projet.html` | `/mon-projet` | ✅ |
| `mon-projet-apercu.html` | route à cadrer | ❌ distinct de `mon-projet/index` |
| `mon-projet-admission.html` | `/mon-projet/admission` | ✅ |
| `mon-projet-orientation.html` | `/mon-projet/orientation` | ✅ |
| `mon-projet-logement.html` | `/mon-projet/logement` | ✅ |
| `paiement-reussi.html` | `/paiement-reussi` | ✅ |

**Différence URLs :** la maquette utilise des query params (`?ecole=esa&pays=france&domaine=architecture`), le frontend des slugs REST (`/destinations/france/ecoles/esa?domaine=architecture`).

---

## 4. Design system : 813 classes → 31 composants

Le frontend a analysé la maquette dans `frontend-main/DESIGN-SYSTEM.md` :

| Métrique | Valeur |
|---|---|
| Classes CSS uniques (maquette) | ~813 |
| Composants `Q*` dédupliqués | 31 |
| Facteur de duplication | ~26× (styles par page) |

**Exemples de regroupement :**

| Classes maquette | Composant frontend |
|---|---|
| `btn-primary`, `formule-card-btn`, `oo-cta`, `ed-float-cta`… | `QButton` |
| `bottom-nav`, `nav-item*` | `QBottomNav` |
| `formule-card`, `ed-form-card`, `le-school`… | `QCard` / `OfferTierCard` |
| `q-trust`, `*-trust-*` | `QTrustBar` |
| `ed-tabs`, `auth-toggle` | `QSegmentedControl` |
| `*-topbar`, `*-back`, `*-notif` | `QTopBar` |

Chaque page Vue porte un commentaire en tête du type :

```vue
/**
 * Fiche école ← `maquette/pwa/pages/ecole-detail.html` (`.ed-*`).
 */
```

---

## 5. Pipeline de synchronisation existant

Le frontend maintient déjà la liaison officielle :

```bash
# Dans frontend-main/
npm run maquette:sync
```

**Comportement (`scripts/sync-maquette.mjs`) :**

1. Clone / met à jour `UzaLab/qiryna` branche **`release`** (pas `main`)
2. Copie `pwa/` → `maquette/pwa/` + `public/_maquette/`
3. Normalise les fins de ligne (LF)

**Pourquoi `release` et pas `main` :**

| Branche maquette | Rôle |
|---|---|
| `main` | Travail en cours, WIP, validé visuellement par l'équipe design |
| `release` | Spec figée pour l'équipe frontend — merge après validation |

**Workflow cible :**

```
main (design WIP) → validation → merge release → maquette:sync → pages .vue
```

---

## 6. Écarts données (bloquants pour le 100 % contenu)

La maquette embarque des champs que le contrat API frontend n'expose pas encore :

| Maquette (`schools.js`) | API / contrat frontend |
|---|---|
| `formation.detail.{cible, programmes, frais, admission, debouches}` | ❌ `SchoolFormation` = `title` + `description` |
| `formation.grade`, `duration`, `icon` | ❌ mockés ou génériques |
| `school.badge[]` (4 lignes sans logo) | ❌ dérivé du nom en JS |
| Catalogue `SCHOOLS` statique | `schoolRepo.bySlug()` → API |

**Impact :** le frontend peut être pixel-perfect en **layout**, mais pas en **contenu
formation** tant que le BFF n'est pas enrichi.

---

## 7. Écarts fonctionnels connus

| Sujet | Maquette | Frontend |
|---|---|---|
| Dark mode | Fonctionnel (`theme-init.js`, tokens dark) | UI réglages seulement, pas de CSS dark |
| Service worker | Cache-first complet | `@vite-pwa/nuxt` listé, non activé dans config |
| Auth | Mock (liens statiques) | Session httpOnly, middleware, OAuth |
| i18n | FR uniquement | FR + EN (`/en/`) |
| États loading/error/empty | Non maquettés | `PageState`, `QSkeleton`, `QEmptyState` |

Ces écarts n'empêchent pas la sync visuelle des écrans nominaux.

---

## 8. Peut-on adapter la maquette à la stack frontend ?

### Réponse courte : **oui, sans changer un pixel**

On n'adapte **pas** la maquette pour qu'elle *devienne* du Nuxt/Vue/Tailwind.
On ajoute une **couche d'alignement** — métadonnées, conventions, tokens miroir —
qui facilite le portage **sans toucher au rendu visuel validé sur `main`**.

### Ce qu'il ne faut PAS faire (dénaturerait le travail)

| Action | Risque |
|---|---|
| Remplacer `app.css` par Tailwind dans la maquette | Recalcul cascade → décalages pixel |
| Renommer les classes `.ed-*`, `.formule-*` | Casse les références frontend + historique Figma |
| Restructurer le HTML (wrapper, flex) | Layout shift invisible en dev, visible en prod |
| Migrer vers Vue/SFC dans le repo maquette | Double maintenance, plus de spec HTML pure |
| Modifier les valeurs de tokens `:root` | Change le rendu validé |

### Ce qu'on PEUT faire (couche additive, zéro impact visuel)

#### A. Fichiers de cartographie (recommandé — priorité 1)

Ajouter dans `pwa/docs/` ou `pwa/sync/` des fichiers **purs données**, jamais importés
par le CSS :

| Fichier | Contenu |
|---|---|
| `screen-map.json` | `{ "maquette": "pages/ecole-detail.html", "route": "/destinations/:slug/ecoles/:school", "vue": "...", "status": "done" }` |
| `component-map.json` | `{ "selector": ".formule-card", "qComponent": "OfferTierCard", "pages": [...] }` |
| `token-map.json` | `{ "--q-primary": "--color-primary", "#582cfd": "#582cfd" }` |

Le script `maquette:sync` (ou un futur `maquette:lint`) pourrait les consommer.

#### B. Attributs `data-q-*` dans le HTML (recommandé — priorité 2)

Ajouter des attributs **sans CSS associé** :

```html
<nav class="bottom-nav" data-q-component="QBottomNav" data-q-route="/">
<article class="formule-card formule-card--acon" data-q-component="OfferTierCard" data-q-tier="acon">
```

- Aucun impact visuel (sélecteurs CSS inchangés)
- Le frontend sait immédiatement quel composant Vue cibler
- Extractible automatiquement pour générer des checklists de portage

#### C. Commentaires de sync en tête de chaque page HTML (priorité 2)

```html
<!--
  @maquette-id ecole-detail
  @frontend-route /destinations/[slug]/ecoles/[school]
  @frontend-file app/pages/destinations/[slug]/ecoles/[school].vue
  @sync-status aligned | 2026-08-17 | commit 5d60a2d
-->
```

Miroir des commentaires déjà présents dans les `.vue`.

#### D. Fichier tokens miroir (priorité 3)

Créer `pwa/css/tokens-bridge.css` **non lié** dans les pages (outil de référence) :

```css
/* Miroir sémantique frontend-main/app/assets/css/main.css
   Valeurs IDENTIQUES à :root — ne pas modifier sans valider les deux repos. */
:root {
  --color-primary: var(--q-primary); /* #582cfd */
  --container-shell: var(--q-shell-max); /* 768px */
}
```

Utilisable par un script de diff tokens maquette ↔ Nuxt. **Ne pas** remplacer `app.css`.

#### E. Découpage documentaire de `app.css` (priorité 4, optionnel)

Ajouter des **marqueurs de section** sans déplacer les règles :

```css
/* @sync-section QBottomNav — begin */
.bottom-nav { … }
/* @sync-section QBottomNav — end */
```

Permet au frontend de savoir quelles plages CSS porter en Tailwind. Aucun changement
de spécificité si on ne fait que commenter.

#### F. Contrats JS alignés sur le frontend (priorité 3)

Renommer / structurer les mocks pour coller aux contrats :

```js
// schools.js — ajouter un export miroir
export const schoolFormationDetailSchema = {
  cible: 'string',
  programmes: 'string',
  // …
}
```

Le frontend pourra importer les mocks comme **fixtures de test** (`tests/fixtures/`).

---

## 9. Stratégie « zéro pixel de diff »

```
┌─────────────────────────────────────────────────────────────┐
│  GEL VISUEL (main)                                          │
│  • app.css : valeurs figées                                 │
│  • HTML structure figée                                     │
│  • Aucun refactor CSS qui change le computed style          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  COUCHE SYNC (additive, sur main ou branche docs/sync)      │
│  • screen-map.json, component-map.json, token-map.json      │
│  • data-q-component dans le HTML                            │
│  • Commentaires @frontend-route en tête de page             │
│  • tokens-bridge.css (référence, non chargé)                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  VALIDATION → release                                       │
│  • merge main → release (spec figée)                        │
│  • npm run maquette:sync dans frontend-main                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PORTAGE frontend (Nuxt)                                    │
│  • Mesure pixel 375px                                       │
│  • Tokens main.css Nuxt                                     │
│  • Composants Q*                                            │
└─────────────────────────────────────────────────────────────┘
```

### Règle de non-régression visuelle

Avant tout merge d'une couche sync sur `main` :

1. Captures ou comparaison visuelle des écrans clés (375px)
2. Vérifier que `app.css` n'a **aucune** modification de propriété visuelle
3. Seuls fichiers autorisés sans review visuelle : `docs/`, `sync/*.json`, attributs `data-q-*`, commentaires HTML

---

## 10. Plan d'action proposé

### Phase 1 — Documentation (sans toucher au rendu)

- [x] Ce document (`comparatif-maquette-frontend.md`)
- [x] `screen-map.json` — 32 écrans (`pwa/sync/screen-map.json`)
- [x] `component-map.json` — top 31 grappes DESIGN-SYSTEM (`pwa/sync/component-map.json`)
- [x] `token-map.json` — `:root` ↔ `@theme` (`pwa/sync/token-map.json`)
- [x] `tokens-bridge.css` — référence non chargée (`pwa/css/tokens-bridge.css`)

### Phase 2 — Annotations HTML (additive)

- [x] Commentaires `@frontend-route` en tête de chaque `pages/*.html`
- [x] `data-q-component` sur bottom-nav, formule-card, btn-primary, topbar
- [x] Script idempotent `pwa/sync/apply-annotations.mjs`

### Phase 3 — Process

- [ ] Merger `main` → `release` après chaque lot validé
- [ ] Frontend : `npm run maquette:sync` systématique
- [ ] Checklist pixel par écran (statut dans `screen-map.json`)

### Phase 4 — Données (frontend + maquette)

- [ ] Enrichir contrat `SchoolFormation` côté API
- [ ] Garder `schools.js` comme fixture de référence

---

## 11. Réponses aux questions fréquentes

### « Faut-il convertir la maquette en Tailwind ? »

**Non.** Tailwind vit dans le frontend. La maquette reste CSS classique — c'est la
spec visuelle. Le DESIGN-SYSTEM.md fait déjà la traduction classes → `Q*`.

### « Faut-il un monorepo ? »

**Pas maintenant.** Le pipeline `release` → `maquette:sync` fonctionne. Un monorepo
(`apps/mock` + `apps/web`) n'apporte un gain qu'une fois la majorité des écrans portés.

### « Comment le frontend sait-il qu'un écran a changé ? »

1. Vous mergez sur `release`
2. `maquette:sync` met à jour `maquette/pwa/`
3. Le dev compare avec la page `.vue` (commentaire en tête du fichier)
4. `screen-map.json` `@sync-status` + date de commit

### « Dark mode : on aligne comment ? »

Maquette en avance. Quand le dark sera validé sur `release`, porter les tokens
`html[data-theme="dark"]` vers `@theme` Nuxt — chantier séparé, pas bloquant pour
les écrans light.

---

## 12. Références

| Ressource | Emplacement |
|---|---|
| Workflow git maquette | `pwa/docs/git-workflow.md` |
| Layout bottom-nav | `pwa/docs/bottom-nav-layout.md` |
| Design system frontend | `frontend-main/DESIGN-SYSTEM.md` |
| Reprise projet frontend | `frontend-main/REPRISE.md` |
| Script sync | `frontend-main/scripts/sync-maquette.mjs` |
| Architecture API | `frontend-main/ARCHITECTURE-API.md` |
| Prompts agents (lots) | `frontend-main/PROMPTS-AGENTS.md` |

---

## 13. Conclusion

| Question | Réponse |
|---|---|
| Peut-on connecter les deux projets ? | **Oui** — déjà prévu via `maquette:sync` + branche `release` |
| Peut-on adapter la maquette à la stack frontend ? | **Oui**, par une **couche additive** (maps, attributs, commentaires) |
| Sans changer un pixel ? | **Oui** — ne pas toucher aux règles CSS visuelles ni à la structure HTML layout |
| Prochaine étape concrète | `screen-map.json` + merge `main` → `release` + resync frontend |

La maquette reste la **source de vérité visuelle**. Le frontend reste
l'**implémentation**. L'alignement stack = **traduction documentée et machine-readable**,
pas une conversion technologique de la maquette elle-même.
