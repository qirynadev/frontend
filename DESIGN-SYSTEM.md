# Qiryna — Design System

> Lot 1. Ce document est le compte rendu de l'analyse de `maquette/pwa/css/app.css`
> et le contrat des primitives de `app/design-system/`.

---

## 1. Mesure de départ

| Métrique | Valeur relevée |
|---|---|
| Lignes de CSS | **7 823** |
| Blocs de règles (`{ … }`) | **1 206** |
| Sélecteurs uniques | 1 099 |
| **Classes uniques** | **813** |
| Pages couvertes | 15 |
| Composants après déduplication | **31** |

> ⚠️ Écart avec le brief : celui-ci annonçait « 8 963 lignes / 515 blocs ». Le fichier
> livré en compte 7 823 et 1 206. Le constat de fond est inchangé — et même aggravé :
> **813 classes pour 31 composants réels, soit un facteur de duplication de ~26×.**

### Origine de la duplication

Le CSS est organisé **par page**, chaque page redéclarant le même composant sous son
propre préfixe :

| Préfixe | Page | Classes uniques |
|---|---|---|
| `projet-` | Mon projet | 78 |
| `home-` | Accueil | 65 |
| `lpp-` | Langues post-paiement | 63 |
| `paiement-` | Paiement réussi | 56 |
| `formule-` | Formules | 48 |
| `dom-` / `langue-` / `objectifs-` | Domaines / Langues / Objectifs | 42 chacune |
| `le-` / `ed-` | Liste écoles / Fiche école | 40 chacune |
| `dest-` | Destinations | 30 |
| `oo-` | Offre orientation | 26 |
| `mdp-` | Mot de passe | 22 |
| `inscription-` / `connexion-` | Auth | 15 / 14 |
| `q-` | (amorce de mutualisation déjà présente) | 11 |

À cela s'ajoutent **~120 sélecteurs de portée page** (`.page-mon-projet .projet-stat`,
`.page-inscription .social-btn`…) qui ne font qu'ajuster de 1 à 3 propriétés d'un
composant déjà défini. Ils deviennent des **props**, pas des fichiers.

Le préfixe `q-` (`q-trust`, `q-pager`) montre que l'auteur de la maquette avait
commencé la mutualisation. On la termine.

---

## 2. Carte de déduplication

### 2.1 Les grappes signalées dans le brief

| Classes maquette | Composant unique | Ce qui devient une prop |
|---|---|---|
| `q-trust`, `formule-trust-item`, `dom-trust-item`, `dest-trust-item`, `objectifs-trust-item`, `langue-trust-item` (+ `-label`, `-sep`, `-laurel`, `--shield/--laurel/--smile`) — **41 classes** | `QTrustBar` | `items` (icône, libellé, tonalité) |
| `mdp-step-icon`, `lpp-step-icon`, `step-icon-circle`, `objectifs-icon`, `dom-card-icon`, `help-icon-wrap`, `service-icon`, `confirm-icon`, `home-cat-icon`, `le-chip-icon`, `oo-feature-icon`, `projet-stat-icon`, `paiement-step-icon`, `q-trust__laurel` (+ leurs ~30 modificateurs de couleur `--exam`, `--pro`, `--mgmt`, `--globe`…) — **56 classes** | `QIconCircle` | `tone`, `size` |
| `help-box`, `inscription-help-box`, `dest-help`, `objectifs-help`, `langue-other`, `lpp-support`, `paiement-help`, `home-menu-help`, `cta-box` — **38 classes** | `QHelpBox` | `tone`, slot `action` |
| `input-field`, `input-group`, `field-icon`, `eye-btn`, `is-valid`, `is-invalid` | `QInput` | `type`, `state`, `icon`, `revealable` |
| `social-btn`, `social-btn--name`, `social-row`, `social-label` | `QSocialButton` | `provider`, `layout` |
| `password-strength-bar` (+ `is-weak/is-medium/is-strong`), `password-strength-hint`, `password-match-hint` | `QPasswordStrength` | `score`, `hint` |
| `divider-or`, `order-sep`, `ed-form-sep`, `formule-feature-sep`, `stat-divider`, `home-menu-sep`, `formule-card-rule`, `lpp-order-divider`, `q-trust__sep` | `QDivider` | `orientation`, `label` |

### 2.2 Les grappes que l'analyse a révélées en plus

| Classes maquette (extrait) | Composant unique | Volume absorbé |
|---|---|---|
| `btn-primary`, `btn-outline`, `btn-cta`, `btn-start`, `btn-help-outline`, `home-cat-btn`, `dom-card-btn`, `formule-card-btn` (+3 teintes kili/acon/everest), `objectifs-cta`, `langue-cta`, `langue-other-btn`, `oo-cta`, `ed-cta-btn`, `projet-btn-start`, `projet-rdv-btn`, `lpp-support-btn`, `paiement-help-btn`, `home-menu-btn-primary`, `home-menu-btn-outline` | `QButton` | **~30 classes** |
| `dest-back`, `dom-back`, `le-back`, `ed-back`, `langue-back`, `objectifs-back`, `oo-back`, `lpp-back`, `formule-back`, `paiement-back`, `ed-icon-btn`, `le-school-heart`, `home-menu-close`, `formule-slider-arrow`, + les 11 couples `*-notif` / `*-notif-badge` | `QIconButton` (prop `badge`) | **~37 classes** |
| `dest-card`, `langue-card`, `objectifs-card`, `dom-card`, `le-school`, `home-news-card`, `service-card`, `projet-service-card`, `order-card`, `lpp-order-card`, `form-card`, `ed-form-card`, `formule-card`, `info-box`, `confirm-box`, `stats-grid` | `QCard` | **~40 classes** |
| `langue-tag` (×7 teintes), `objectifs-badge`, `service-badge`, `status-badge` (×3), `lpp-badge` (×2), `home-news-tag`, `ed-badge`, `oo-price-badge`, `stripe-badge`, `dom-card-meta--bold` | `QBadge` | **~22 classes** |
| `info-row`/`info-text`, `home-menu-item`, `dom-card-main`, `langue-card-body`, `objectifs-card-main`, `service-body`, `le-school-body`, `ed-form-body`, `lpp-step-card`, `projet-service-main`, `formule-feature`, `oo-feature`, `order-item`, `home-news-body` | `QMediaRow` (icône · titre+desc · zone droite) | **~70 classes** |
| `steps-container`/`steps-icons-col`/`steps-nums-col`/`steps-text-col`/`step-connector`/`step-num`, `mdp-steps-*` (12), `lpp-steps-*` (9), `paiement-step-*` (11) | `QStepper` (`orientation`) | **~40 classes** |
| `progress-bar-*`, `projet-mini-progress-*`, `projet-chart-*` | `QProgressBar` | ~10 classes |
| `progress-ring-*`, `home-progress-ring*`, `projet-ring-*` | `QProgressRing` | ~10 classes |
| `stat-item`/`stat-value`/`stat-label`/`stat-divider`, `dom-stat*` (7), `projet-stat*` (14) | `QStat` | **~28 classes** |
| `q-pager__btn`, `le-dot`/`le-dots`, `formule-slider-dot(s)` | `QPager` (`variant: numbered \| dots`) | ~8 classes |
| `formule-slider-*` (7), `home-news-scroll`, `le-chips`/`le-chips-next` | `QCarousel` | ~11 classes |
| `auth-toggle` (+ `.active`, ×2 pages), `ed-tabs`/`ed-tab`/`ed-tab.is-active` | `QSegmentedControl` (`variant: pill \| underline`) | ~10 classes |
| `home-section-title`, `dom-section-title`, `le-title`/`le-subtitle`, `oo-inclus h2`, `home-section`, `dom-section`, `le-list-head`, `projet-services-head`, `projet-apercu-head`, `*-steps-heading` (×3) | `QSectionHeader` | ~16 classes |
| `hero-row`/`hero-copy`/`hero-illus` (+3 offsets), `connexion-hero*`, `inscription-hero*`, `mdp-hero*`, `oo-hero*`, `projet-hero*`, `dest-intro`, `dom-banner`, `langue-intro`, `objectifs-intro`, `formule-intro`, `lpp-success*` | `QHero` | **~35 classes** |
| `page-header`/`logo-sm`/`logo-wrap`/`logo-img`/`notif-wrap`, + les 12 barres `*-topbar` et `*-logo-frame` | `QTopBar` | **~30 classes** |
| `bottom-nav`, `nav-item*` (7) + les 6 `.page-* .nav-item.active` | `QBottomNav` | ~14 classes |
| `le-chip`, `le-chip-label`, `le-chip-icon--*` (4), `le-chip.is-selected` | `QChip` | ~8 classes |
| `cgu-row`/`cgu-checkbox`/`cgu-text` | `QCheckbox` | 4 classes |
| `objectifs-radio`, `langue-check`, `dest-card.is-selected` | `QRadio` | 5 classes |
| `home-menu*` (backdrop, panel, header, body, list, sep…) | `QSheet` (Reka UI `Dialog`) | **~25 classes** |
| `screen-shell`, `screen`, `main-content`, `status-bar*` (6) | *Layout* `mobile.vue` (hors design-system) | ~10 classes |

### 2.3 Ce que la maquette ne contient pas et qu'il faut créer

La maquette ne montre que l'état **nominal**. Trois composants sont ajoutés pour couvrir
l'obligation « chargement / vide / erreur / nominal » :

| Composant | Rôle |
|---|---|
| `QSkeleton` | état **chargement** — squelettes calés sur `QCard`, `QMediaRow`, `QStat` |
| `QEmptyState` | état **vide** — illustration + message + action |
| `QAlert` | état **erreur** (et succès/info) — `role="alert"`, annoncé aux lecteurs d'écran |
| `QSpinner` | chargement inline (bouton, bouton de pagination) |
| `QIcon` | registre SVG inline — remplace les 206 `<img src="*.svg">` de la maquette |

---

## 3. Le catalogue — 31 primitives

`app/design-system/` · aucune logique métier, aucun appel réseau, aucun texte en dur.

### Base

| # | Composant | Props principales |
|---|---|---|
| 1 | `QButton` | `variant` `solid\|outline\|ghost\|link` · `tone` · `size` `sm\|md\|lg` · `block` · `loading` · `disabled` · `to`/`href` |
| 2 | `QIconButton` | `icon` · `size` · `variant` · `badge` · `label` (obligatoire, `aria-label`) |
| 3 | `QIcon` | `name` · `size` — registre SVG inline, `currentColor` |
| 4 | `QSpinner` | `size` · `tone` |
| 5 | `QDivider` | `orientation` `horizontal\|vertical` · `label` · `inset` |

### Surfaces

| # | Composant | Props principales |
|---|---|---|
| 6 | `QCard` | `variant` `elevated\|outlined\|flat\|tinted` · `tone` · `padding` · `selectable` · `selected` · `as` |
| 7 | `QIconCircle` | `tone` · `size` `sm\|md\|lg\|xl` — slot icône ou image |
| 8 | `QBadge` | `tone` · `variant` `soft\|solid\|outline` · `size` · `dot` |
| 9 | `QChip` | `selected` · `icon` · `tone` — bouton de filtre |
| 10 | `QMediaRow` | `title` · `description` · `clamp` · slots `leading`/`trailing`/`meta` · `interactive` |

### Formulaire

| # | Composant | Props principales |
|---|---|---|
| 11 | `QInput` | `modelValue` · `type` · `label` · `placeholder` · `icon` · `state` `default\|valid\|invalid` · `hint` · `error` · `revealable` · `disabled` |
| 12 | `QCheckbox` | `modelValue` · `disabled` · `state` — slot libellé (liens CGU) |
| 13 | `QRadio` | `modelValue` · `value` · `disabled` |
| 14 | `QPasswordStrength` | `score` `0..3` · `hint` · `hintTone` |
| 15 | `QSocialButton` | `provider` `google\|facebook\|apple` · `layout` `icon\|icon-label\|stacked` |
| 16 | `QSegmentedControl` | `modelValue` · `options` · `variant` `pill\|underline` |

### Contenu

| # | Composant | Props principales |
|---|---|---|
| 17 | `QSectionHeader` | `title` · `subtitle` · `level` `1..3` · slot `action` |
| 18 | `QHero` | `title` · `text` · `image` · `imageOffset` · `align` |
| 19 | `QHelpBox` | `title` · `description` · `icon` · `tone` · slot `action` |
| 20 | `QTrustBar` | `items[]` (`icon`, `label`, `tone`) |
| 21 | `QStat` | `value` · `label` · `icon` · `tone` |
| 22 | `QStepper` | `steps[]` · `current` · `orientation` `vertical\|horizontal` · `numbered` |
| 23 | `QProgressBar` | `value` · `max` · `label` · `size` · `tone` |
| 24 | `QProgressRing` | `value` · `label` · `size` |

### Navigation

| # | Composant | Props principales |
|---|---|---|
| 25 | `QTopBar` | `back` · `title` · slots `leading`/`trailing` · `sticky` |
| 26 | `QBottomNav` | `items[]` (`to`, `icon`, `label`) · `active` |
| 27 | `QPager` | `page` · `total` · `variant` `numbered\|dots` |
| 28 | `QCarousel` | `itemWidth` · `arrows` · `dots` · slot par défaut |
| 29 | `QSheet` | `open` · `side` `left\|right\|bottom` · `title` — Reka UI `DialogRoot` |

### États

| # | Composant | Props principales |
|---|---|---|
| 30 | `QSkeleton` | `variant` `text\|circle\|rect\|card\|row` · `lines` · `width` · `height` |
| 31 | `QEmptyState` / `QAlert` | `QEmptyState` : `title`, `description`, `icon`, slot action · `QAlert` : `tone`, `title`, `dismissible`, `role="alert"` |

> 31 composants pour 813 classes. Le brief visait 20–30 ; le 31ᵉ existe parce que les
> états non-nominaux (skeleton / vide / erreur) ne figurent nulle part dans la maquette
> et sont pourtant obligatoires.

---

## 4. Tokens

Tout est dans [`app/assets/css/main.css`](app/assets/css/main.css), bloc `@theme`.
Trois décisions de normalisation méritent d'être connues.

### 4.1 Base d'espacement à `1px`

```css
--spacing: 1px;
```

La maquette est une spécification Figma au pixel : elle emploie 5, 7, 9, 11, 13, 17,
21, 22, 25px. Avec la base Tailwind par défaut (4px), 17px s'écrirait `p-4.25`. Avec
une base à 1px, `p-17` vaut 17px et la lecture est directe contre la maquette.

**Conséquence à connaître** : `p-4` vaut 4px, pas 16px. C'est une déviation assumée
du réflexe Tailwind ; elle est cohérente partout dans le projet.

### 4.2 Échelle typographique resserrée

Sur 22 tailles distinctes relevées, 8 concentrent 85 % des usages
(12px : 57×, 10px : 44×, 14px : 43×, 11px : 27×, 9px : 21×, 20px : 10×, 13px : 9×, 8px : 8×).
Les valeurs orphelines sont ramenées au barreau voisin :

| Maquette | Token | Écart |
|---|---|---|
| 10.5px | `text-md` (11px) | +0.5 |
| 12.5px | `text-base` (12px) | −0.5 |
| 15.5px | `text-2xl` (15px) | −0.5 |
| 17px | `text-3xl` (18px) | +1 |
| 19px | `text-3xl` (18px) | −1 |
| 22px | `text-5xl` (24px) | +2 |
| 29px | `text-6xl` (28px) | −1 |

Les interlignes Figma non entiers (13.125, 16.5, 17.188, 20.625, 22.75, 30.25…) sont
remplacés par les interlignes couplés aux tokens (`--text-*--line-height`).

### 4.3 Rayons

`10px` est le rayon dominant (68 occurrences : cartes, boutons, champs, encarts) →
`--radius-xl`, valeur par défaut de `QCard`, `QButton`, `QInput`.
`5px` et `7px` (3 occurrences chacun) sont ramenés à `4px` / `8px`.
`50px` est conservé sous `--radius-dome` pour les en-têtes arrondis
(`border-radius: 0 0 50px 50px`).

### 4.4 Zone sûre

Les variables `env(safe-area-inset-*)` de la maquette sont conservées, mais exposées
dans la *namespace* `--spacing-*` pour générer de vraies utilitaires :

```css
--spacing-content-bottom: calc(75px + 24px + env(safe-area-inset-bottom, 0px));
--spacing-safe-bottom: env(safe-area-inset-bottom, 0px);
```

→ `pb-content-bottom`, `pb-safe-bottom`, utilisables dans les templates.

---

## 5. Règles de contribution

1. **Une variante = une prop, jamais un fichier.** Si vous êtes tenté de créer
   `QButtonEverest.vue`, ajoutez une valeur à `tone`.
2. **Aucune valeur brute dans un composant.** Si un token manque, ajoutez-le à `@theme`.
3. **Aucune chaîne visible en dur** : tout passe par `$t()` / props.
4. Un composant de `design-system/` ne connaît ni l'API, ni les stores, ni les routes
   métier. Il ne fait qu'afficher ce qu'on lui donne.
5. Tout nouvel état visuel doit apparaître dans [`app/pages/dev/ui.vue`](app/pages/dev/ui.vue).

---

## 6. Accessibilité — socle commun

- Focus visible global (`:focus-visible`, 2px `--color-primary`, offset 2px).
- `QIconButton` exige `label` (`aria-label`) — la prop n'a pas de valeur par défaut.
- `QSegmentedControl` : `role="tablist"` + navigation clavier ←/→/Home/End.
- `QCheckbox` / `QRadio` : `<input>` natif visuellement masqué, jamais `<div>` cliquable.
- `QInput` : `<label for>` réel, `aria-invalid`, `aria-describedby` vers `hint`/`error`.
- `QProgressBar` / `QProgressRing` : `role="progressbar"` + `aria-valuenow/min/max`.
- `QSheet` : piège de focus et `Escape` fournis par Reka UI.
- `QAlert` : `role="alert"` en tonalité `danger`, `role="status"` sinon.
- `prefers-reduced-motion` neutralise les transitions dans la base CSS.

---

## 7. Dette signalée (hors périmètre Lot 1)

**Images.** `maquette/pwa/assets/` pèse **27,1 Mo**, dont **26,6 Mo en PNG pour
31 fichiers**. Les 206 SVG ne pèsent, eux, que 0,2 Mo au total. Les pires cas :

| Fichier | Poids | Traitement attendu |
|---|---|---|
| `home-progress-mountain.png` | 2 466 Ko | illustration → SVG |
| `allemagne.png`, `chine.png`, `france.png`, `canada.png`, `angleterre.png`, `usa.png` | 1 817 → 2 330 Ko pièce | photos → `<NuxtImg format="webp">` + `sizes` |
| `home-banner.png` | 2 080 Ko | photo → `<NuxtImg>` |
| **`logo.png`** | **1 979 Ko** | **logo → SVG, non négociable** |
| `hero-*.png` (5 fichiers) | 956 → 1 254 Ko pièce | illustrations → SVG |

**Aucune de ces images n'a été importée dans le projet Nuxt.** La galerie du Lot 1
n'utilise que des SVG inline (`QIcon`) et des aplats de couleur. La reprise des visuels
se fera au lot qui en a besoin, après ré-encodage — et tout fichier restant au-dessus
de 150 Ko sera signalé plutôt qu'intégré.

**Polices.** La maquette charge Jost via `@import url(fonts.googleapis.com)` **à
l'intérieur du CSS** — bloquant et hors de contrôle. Le projet la charge via `link
preconnect + stylesheet` dans `nuxt.config.ts`. À basculer en auto-hébergement
(`@nuxt/fonts`) au lot qui traitera la performance.

**`.status-bar`.** La maquette simule la barre d'état iOS (heure, batterie, réseau) en
HTML. C'est un artefact de présentation Figma : **non repris**.
