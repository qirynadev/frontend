# Norme layout desktop (Figma Web · artboard 1728)

Référence : page **🖥️ Web** du fichier [Working_Files_Qiryrna](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna), frames 1728 px de large.

## Rupture d’affichage

| Token | Valeur | Usage |
|---|---|---|
| `--breakpoint-shell` | `768px` | Bascule mobile / desktop (`shell:`) |
| Artboard Figma | `1728px` | Largeur de référence des maquettes Web |

## Gutters « boxed » (contenu applicatif)

Classe CSS : **`.desktop-boxed`**

| Propriété | Valeur |
|---|---|
| `width` | `100%` |
| `padding-inline` | `clamp(24px, 8.68vw, 150px)` |

**Où l’appliquer :** navbar (`AppDesktopNav`), sections accueil (`desktop-pages/index.vue`), footer (`AppDesktopFooter`).

À 1728 px : gutter **150 px** de chaque côté → zone utile **1428 px**.

Formule du clamp : `150 / 1728 ≈ 8,68 vw`.

## Wings (écrans auth carte)

Variante **Inscription-V2** (`640:6`) : le contenu est une carte flottante sur fond gris.

| Propriété | Valeur Figma | Implémentation |
|---|---|---|
| Fond wings | `#f2f1f6` | `bg-[#f2f1f6]` |
| Padding wings | `30px` | `p-30` |
| Carte intérieure | `rounded-[50px]` | `rounded-[50px]` |
| Ombre carte | `0 18px 10px rgba(112,144,176,0.1)` | `shadow-[0_18px_10px_rgba(112,144,176,0.1)]` |
| Hauteur carte | `1057px` (frame) | `h-full` dans viewport (sans nav shell) |

**Connexion** (`567:5582`) : pas de wings — split plein cadre sous la nav shell.

## Navigation

### Shell (`AppDesktopNav`)

| Propriété | Valeur |
|---|---|
| Hauteur | `80px` → `h-80` |
| Padding horizontal | `.desktop-boxed` (150 px max) |
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
| Padding | `pl-[clamp(24px,8.68vw,150px)]` · `pr-55 lg:pr-90` (aligné trust bar hero) |
| Fond | transparent (hérite du blanc de la carte) |
| Gauche | logo Qiryna |
| Droite | « Déjà un compte ? » + bouton outline « Se connecter » (`rounded-[10px]`, bord `#fc1333`) |
| Langue | `66×38` · drapeau + chevron · `rounded-[10px]` |

Meta page : `desktopNav: 'auth-card'` (masque la nav shell).

## Split auth (formulaire / hero)

### Connexion (`567:5582`)

| Zone | Largeur Figma | Classes |
|---|---|---|
| Panneau gauche | `772px` | `lg:w-772` · `pl-48 pr-31` |
| Inset formulaire | `+110px` | `pl-[clamp(0,6.36vw,110px)]` |
| Panneau droit | flex + gutter | `flex-1` · `pr-[clamp(24px,8.68vw,150px)]` |
| Hauteur contenu | `877px` (957 − 80 nav) | `h-full` · shell `h-dvh overflow-hidden` |

### Inscription-V2 (`640:6`)

| Zone | Largeur Figma | Classes |
|---|---|---|
| Panneau gauche | `738px` | `lg:w-738` · `p-48` |
| Inset formulaire | `+110px` | idem connexion |
| Panneau droit | `824px` (flex) | `flex-1` · `px-78 py-48` intérieur hero |
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

Image hero : `object-cover` · pleine hauteur du panneau droit (`absolute inset-y-0 lg:left-738`) — **y compris derrière la navbar** · `opacity-85` · coins `rounded-tr` + `rounded-br`.

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
| Classe boxed | `app/assets/css/main.css` → `.desktop-boxed` |
| Shell | `app/layouts/desktop.vue` |
| Nav shell | `app/components/navigation/AppDesktopNav.vue` |
| Nav carte auth | `app/components/navigation/AppDesktopAuthCardNav.vue` |
| Connexion | `app/desktop-pages/connexion.vue` |
| Mot de passe oublié | `app/desktop-pages/mot-de-passe.vue` |
| Inscription | `app/desktop-pages/inscription.vue` |
