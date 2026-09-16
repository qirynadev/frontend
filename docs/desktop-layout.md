# Norme layout desktop (Figma Web · artboard 1728)

Référence : page **🖥️ Web** du fichier [Working_Files_Qiryrna](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna), frames 1728 px de large.

## Rupture d’affichage

| Token | Valeur | Usage |
|---|---|---|
| `--breakpoint-shell` | `768px` | Bascule mobile / desktop (`shell:`) |
| Artboard Figma | `1728px` | Largeur de référence des maquettes Web |
| Palier FHD | `1920px` | Maquette à l’échelle 1 + gouttières 150 px |

**Sous 1920 px** (13", 1366×768, etc.) : canevas 1728, `zoom: 100vw / 1728`. Même composition, pas de reflow.

**Dès 1920 px** (FHD, 2K, 4K, 5K) : `zoom: 1`, shell pleine largeur, `.desktop-boxed` plafonné à 1728 px centré, padding 150 px (marges Figma). Le palier est une largeur CSS (`min-width: 1920px`) : la hauteur 1080 du FHD n’est pas exigée (barre d’OS / chrome du navigateur).

## Wings internes (contenu boxed)

Classe CSS : **`.desktop-boxed`**

Le desktop est l’artboard Figma 1728 px. **Sous 1920 px**, un `zoom: 100vw / 1728` l’adapte sans reflow. **Dès 1920 px**, plus de zoom : gouttières boxed **150 px**, colonne max 1728 px centrée (marges Figma).

Les 150 px sont un **padding interne** du canevas (wings), pas des marges autour d’une fenêtre.

| Propriété | Valeur |
|---|---|
| `width` | `100%` du canevas 1728 |
| `padding-inline` | `150px` |

**Où l’appliquer :** navbar (`AppDesktopNav`), sections accueil, pages pays / écoles.

Le footer est **dans** le canevas et défile avec la page. Auth (sans footer) : `#q-shell-desktop.is-locked`. Classe **`.desktop-canvas`** : même 1728 centré dès FHD, sans padding — split connexion / carte inscription (pas de `lg:`).

## Footer (`AppDesktopFooter`)

Chrome legacy (courbe, carrousel, mentions / contact / newsletter, stores). Sous 1920 px, le zoom du canevas réduit l’ensemble sans reflow (`w-1/4` / `w-1/2`, pas de `lg:` ni de `flex-wrap`). Dès 1920 px, même composition à l’échelle 1.

| Zone | Valeur |
|---|---|
| Courbe | pleine largeur du canevas |
| Fond | `#273c66` · pleine largeur |
| Colonne utile | `max-w-[1100px]` centrée |
| Grille | 4 × `w-1/4` · barre bas 2 × `w-1/2` |

## Wings (écrans auth)

**Inscription-V2** (`640:6`) : carte flottante dans `.desktop-canvas`. Fond shell `#f2f1f6` = wings hors 1728 dès FHD. Padding carte `p-30`, `rounded-[50px]`.

**Connexion** (`567:5582`) : split dans `.desktop-canvas`. Formulaire aligné au logo (`pl` gutter 150). Hero `flex-1` jusqu’au bord droit du canevas.

## Navigation

### Shell (`AppDesktopNav`)

| Propriété | Valeur |
|---|---|
| Hauteur | `80px` → `h-80` |
| Padding horizontal | `.desktop-boxed` (wings internes) |
| Fond | `bg-white/70` + `backdrop-blur-sm` |
| Bordure | `border-b #f1f1f3` |

#### Variante `auth` — connexion

- Lien « Mot de passe oublié ? »
- CTA pill « S'inscrire » (`bg-desktop-brand`)
- Bouton langue `38×38` (drapeau seul, sans chevron)

### Carte auth (`AppDesktopAuthCardNav`) — inscription

Frame Figma `640:22`, **à l'intérieur** de la carte blanche, au-dessus du split formulaire / hero.

| Propriété | Valeur |
|---|---|
| Hauteur | `80px` → `h-80` · `py-15` |
| Padding | `pl-48` · `pr-90` (aligné trust bar hero) |
| Fond | transparent (hérite du blanc de la carte) |
| Gauche | logo Qiryna |
| Droite | « Déjà un compte ? » + bouton outline « Se connecter » (`rounded-[10px]`, bord `#fc1333`) |
| Langue | `66×38` · drapeau + chevron · `rounded-[10px]` |

Meta page : `desktopNav: 'auth-card'` (masque la nav shell).

## Split auth (formulaire / hero)

### Connexion (`567:5582`)

| Zone | Largeur Figma | Classes |
|---|---|---|
| Panneau gauche | `680px` + gutter 150 | `w-[calc(var(--q-desktop-gutter)+680px)]` · `pl-[var(--q-desktop-gutter)]` |
| Panneau droit | flex | `flex-1` |
| Hauteur contenu | `877px` (957 − 80 nav) | `h-full` · shell `is-locked` |

### Inscription-V2 (`640:6`)

| Zone | Largeur Figma | Classes |
|---|---|---|
| Panneau gauche | `738px` | `w-738` · `px-48` |
| Panneau droit | flex | `flex-1` · `px-78 py-48` intérieur hero |
| Titre H1 | `36px` / `40px` line | `text-[36px] leading-40` |

## Hero & barres de confiance

### Connexion — trust bar (`567:6271`)

| Propriété | Valeur |
|---|---|
| Hauteur | `74px` |
| Padding | `px-32 py-11` (contenu) · `gap-26` |
| Icônes | `40×40` |
| Texte | `11px` / `13.125px` line · semibold |
| Séparateur | `#e6e5f5` · `h-34 w-px` |

### Inscription — trust bar (`640:162`)

| Propriété | Valeur |
|---|---|
| Hauteur | `74px` |
| Padding | `px-21 py-11` · `gap-16` |
| Icônes | `20×20` |
| Items | 4 colonnes égales (`flex-1`) |
| Position | `pb-60` · `pl-55 pr-90` dans le panneau |

Image hero : `object-cover` · pleine hauteur du panneau droit (`absolute inset-y-0 left-738`) — **y compris derrière la navbar** · `opacity-85` · coins `rounded-tr` + `rounded-br`.

## Meta pages (`definePageMeta`)

```ts
definePageMeta({
  bottomNav: false,
  desktopNav: 'default' | 'auth' | 'auth-card',
  desktopFooter: false,    // auth plein cadre
})
```

| `desktopNav` | Usage |
|---|---|
| `default` | Accueil, pages applicatives |
| `auth` | Connexion — nav shell |
| `auth-reset` | Mot de passe oublié — nav « Déjà un compte ? » + Se connecter |
| `auth-card` | Inscription-V2 — nav intégrée à la carte |

## Fichiers de référence

| Rôle | Fichier |
|---|---|
| Classe boxed | `app/assets/css/main.css` → `.desktop-boxed` (wings 150 px) |
| Canevas auth | `app/assets/css/main.css` → `.desktop-canvas` (1728, sans padding) |
| Échelle uniforme | `app/assets/css/main.css` → `#q-shell-desktop` (`zoom: 100vw / 1728`) |
| Footer | `app/components/navigation/AppDesktopFooter.vue` |
| Shell | `app/layouts/desktop.vue` |
| Nav shell | `app/components/navigation/AppDesktopNav.vue` |
| Nav carte auth | `app/components/navigation/AppDesktopAuthCardNav.vue` |
| Connexion | `app/desktop-pages/connexion.vue` |
| Mot de passe oublié | `app/desktop-pages/mot-de-passe.vue` |
| Inscription | `app/desktop-pages/inscription.vue` |
