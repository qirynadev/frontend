# Thème sombre mobile — revue et plan d’actions

Périmètre : **application mobile** (`app/pages`, `app/components`, `app/design-system`, tokens `app/assets/css/main.css`). Le desktop 1728 (hex Figma en dur) est hors lot ; il sera traité ensuite.

**Lots 0–3 livrés.** Tokens indigo, CTA `on-primary`, filets `#3a3558`, nav basse `currentColor`, hex structurels remplacés. Restent : `theme-color` dynamique, `logo_dark`, pastilles métier encore en hex.

---

## Direction visuelle (pas une inversion)

Qiryna mobile = violet de marque `#582cfd`, Jost, surfaces lavande. Le sombre doit rester **la même identité, la nuit** : indigo profond, pas OLED noir, pas crème, pas vert acide.

| Rôle | Token à créer / figer | Hex | Usage |
|---|---|---|---|
| Night | `--color-canvas` | `#0E0C1A` | Fond d’app, shell |
| Raised | `--color-surface-card` | `#1A1730` | Cartes, nav, inputs |
| Ink | `--color-text` | `#F3F1FA` | Titres et corps |
| Mist | `--color-muted` | `#A9A4C4` | Secondaire, placeholders |
| Brand | `--color-primary` | `#8B6FFF` | CTA, liens, onglet actif |
| On-brand | `--color-on-primary` | `#FFFFFF` | Texte **et** icônes sur bouton / pastille |

Règles :

1. **Ne jamais inverser `white` / `black`.** `text-white` sur un CTA doit rester blanc.
2. Contraste texte / fond ≥ **4,5:1** (WCAG AA) pour le corps ; ≥ 3:1 pour les gros titres.
3. Les icônes chrome (menu, retour, cloche, nav) suivent `currentColor` ou un filtre commun — pas le trait `#000` cuit dans le SVG.
4. Une seule déclaration sombre (aujourd’hui dupliquée media query + `[data-theme=dark]`).
5. `color-scheme: dark` sur `html` pour que les contrôles natifs (select, scrollbar, autofill) basculent.

---

## Diagnostic par surface

### Fond, cartes, bordures

| Élément | Clair | Sombre actuel | Problème |
|---|---|---|---|
| Canvas / shell | `#eef0f5` backdrop | `#1a1f2c` | OK-ish, trop froid vs violet Qiryna |
| Écran | `bg-surface-card` `#fff` | `#171717` | Gris charbon, pas indigo |
| Carte | même blanc | même `#171717` | **Aucun étage** carte / page : tout est plat |
| Bordure | `#e6e5f2` | `#1d1b35` | Quasi invisible sur `#120f27` (~1,2:1) |
| Bordure slate | `#e2e8f0` | `#b5c4d9` | Trop claire : filets qui crient |

Cible : canvas `#0E0C1A` → carte `#1A1730` → filet `#3A3558` (~3:1).

### Textes et titres

| Rôle | Classe | Sombre actuel | Verdict |
|---|---|---|---|
| Corps / titres | `text-text` `#e8e8e8` | Lisible sur `#120f27` | Garder clair, virer au `#F3F1FA` (teint violet) |
| Secondaire | `text-muted` `#b2b1d3` | Passe | Harmoniser avec Mist |
| Navy (libellés nav) | `text-navy` | **Inversé** en `#cad6f4` | Le navy n’est plus navy : labels OK par accident, **fonds `bg-navy` deviennent clairs** |
| Hex en dur | `text-[#191919]` etc. | Restent noirs | Taches noires sur fond sombre (`mon-projet/langues`, aperçu) |

### Boutons et texte de boutons — **P0**

`QButton` solid : `bg-primary text-white`.

En sombre, `--color-white: #171717`. Donc le libellé du CTA primaire est **anthracite sur violet**. Illisible. Même piège sur `QSegmentedControl`, `AuthToggle`, pastilles, `text-white` dans les pages.

`--color-black: #f0f0f0` inverse aussi `text-black` / `bg-black`.

Cible :

- Ajouter `--color-on-primary: #ffffff` (clair **et** sombre).
- `QButton` solid → `text-on-primary`, plus `text-white`.
- Ne plus toucher à `--color-white` / `--color-black` (laisser les primitifs Tailwind).

| Variante | Fond sombre | Texte |
|---|---|---|
| Solid primary | `#8B6FFF` | `#FFFFFF` |
| Solid danger | `#F14161` | `#FFFFFF` |
| Solid success | `#1F9A5C` (pas le mint `#55e998` flashy) | `#FFFFFF` |
| Outline | transparent + bord Brand | Brand |
| Ghost | transparent | Ink |

### Icônes

`QIcon` documente que les SVG maquette **portent leurs couleurs**. Conséquence en sombre : hamburger, cloche, retours, chevrons restent `stroke="black"` / `#191919`.

Relevé : **40+ fichiers** `public/img/icons/` avec trait noir (chrome + listes + admission + logement).

Nav basse : libellé `text-navy` s’éclaircit, **l’icône `<img>` non**. Inactif = pictogramme noir sur carte sombre.

Cible, sans recréer 378 SVG :

1. Sprite chrome déjà en SVG inline (`ic-menu`, `ic-bell`, `ic-lang-back`, `nav-*`) → `currentColor`.
2. Autres chrome en `<img>` : `class="dark:invert"` **uniquement** si le fichier est monochrome noir. Interdit sur logos / drapeaux / pictos déjà colorés.
3. Pictos métier colorés (pastilles vertes, badges) : garder tels quels ou fournir un fond `--tint-*` déjà assombri.

### Champs, placeholders, contrôles

Inputs : `bg-surface-card` + `border-rp-card-border` etc. Les filets sombres trop bas disparaissent. Placeholder `text-muted` à vérifier à 4,5:1.

`color-scheme` absent → date pickers / autofill restent clairs.

### Chrome système

`theme-color` meta figé `#582cfd` (clair). En sombre : Night `#0E0C1A` (status bar).

Logo : le back-office a `logo_dark` (voir `docs/directives-backend.md`) — le front ne le bascule pas encore.

### Overlay / menus

`--color-menu-backdrop: rgb(240 239 239 / 0.7)` en sombre = **voile blanc**. Doit être `rgb(8 6 18 / 0.72)`.

---

## Contrastes à corriger en priorité

| Paire actuelle | Usage | AA 4,5:1 |
|---|---|---|
| `#171717` sur `#7c59fd` | `text-white` × `bg-primary` | **Échec** (et sens inversé) |
| `#1d1b35` sur `#120f27` | Bordures | **Échec** (~1,2:1) |
| `#2828ff` (`mpo-info-title`) sur fond sombre | Titre encart orientation | **Échec** (bleu trop sombre) |
| `#cad6f4` (`bg-navy`) + `text-white` `#171717` | Bouton neutral | Rendu « thème clair » parasite |
| `#55e998` success | Texte success | Trop fluo ; mieux en fond de pastille, pas en titre |

---

## Lots d’implémentation

### Lot 0 — Fondations (bloquant)

- [x] Stopper l’inversion de `--color-white` et `--color-black`.
- [x] Introduire `--color-on-primary` / `--color-on-danger` / `--color-canvas`.
- [x] Remplacer `text-white` des CTA du design system par `text-on-primary`.
- [x] `color-scheme: dark` sur `:root[data-theme=dark]` et le media query.
- [x] Fusionner les deux blocs sombres dupliqués (media + attribut) en une seule liste, héritée.

### Lot 1 — Surfaces et typo

- [x] Recaler canvas / carte / filet / ink / mist sur le tableau ci-dessus.
- [x] Recaler `--color-navy` : en sombre c’est un **texte** (`#C9C4E8`), pas un fond. `bg-navy` doit pointer vers un token `--color-navy-fill` distinct, non inversé en pastel.
- [ ] `theme-color` dynamique selon `data-theme`.
- [x] Backdrop de menu sombre.

### Lot 2 — Icônes chrome

- [x] Sprite : `stroke="currentColor"` + `text-text` / `text-nav-active`.
- [x] Filtre `invert` ciblé sur les `<img>` monochromes de chrome (menu, back, chevrons listes).
- [x] Nav basse : icône inactive = Ink (`text-text`, blanc en sombre), active = Brand.

### Lot 3 — Pages qui cassent le thème

Hex structurels (filets, titres noirs, fonds crème) remplacés par tokens. Restent des **accents métier** (rose langues, pastilles aperçu) :

- `app/pages/mon-projet/langues/**` — % / pastilles rose `#fc037f`
- `app/pages/mon-projet/apercu.vue` — badges pack / statut
- `app/pages/reglages/index.vue` — bloc desktop `shell:` (hors lot)

Vérifier écran par écran en `data-theme=dark` : accueil, auth, destinations, formules, messages, mon-projet, réglages, logement, langues, orientation.

### Lot 4 — Finitions

- [ ] Logo clair / `logo_dark`.
- [ ] Pastilles statut (success/warning/danger) : fond sombre saturé + texte clair, pas l’inverse fluo.
- [ ] Page `/dev/ui` : section « Sombre » pour valider tokens + boutons + icônes.
- [ ] Desktop : ticket séparé (hex Figma).

---

## Hors sujet volontaire

- Ne pas redessiner la maquette HTML PWA (`maquette/pwa`) : le runtime c’est Nuxt.
- Ne pas « inverser écran par écran » : on corrige les tokens, puis les fuites hex.
- Visio (`VisioCallRoom`) reste volontairement sombre en permanence.
