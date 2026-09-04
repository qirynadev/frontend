# `app/desktop-pages/` — écrans desktop

Miroir de [`app/pages/`](../pages/) (mobile). **Nuxt ne route pas ce dossier** :
seules les pages sous `app/pages/` définissent les URLs.

## Accueil

| Figma | Node |
|---|---|
| Page | 🖥️ Web (`0:1`) |
| Frame | [Home page](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=1004-3493) (`1004:3493`) |
| Navigation | `1004:3494` → `AppDesktopNav` |
| Footer | `1031:2` → `AppDesktopFooter` |

Branchement : `pages/index.vue` affiche mobile (`shell:hidden`) et
`desktop-pages/index.vue` (`hidden shell:block`). Le chrome (nav + footer)
est dans `layouts/desktop.vue`, basculé depuis `layouts/default.vue`.

## Domaines d'études

| Figma | Node |
|---|---|
| Frame | [Domaines d'etudes](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=54-488) (`54:488`) |

Branchement : `pages/destinations/[slug]/ecoles/index.vue` (mobile) et
`desktop-pages/domaines-etudes.vue`. Un domaine cliqué depuis la fiche pays
arrive avec `?domaine=` (onglet allumé). Le CTA pays ouvre la liste **sans**
domaine présélectionné.

## Fiche école

| Figma | Node |
|---|---|
| Frame | [Fiche ecole](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=8-562) (`8:562`) |

Branchement : `pages/destinations/[slug]/ecoles/[school].vue` (mobile) et
`desktop-pages/fiche-ecole.vue`. Tags Figma (Grande école, accréditations) et
campus multiples absents de l’API : omis. « Établissements similaires » =
autres écoles de la même destination (API), pas les logos SKEMA/ESSEC du
mock. CTA : `?domaine=` → `/offres/{domaine}`, sinon `/orientation`.

## Mon projet

| Figma | Node |
|---|---|
| Frame | [Mon projet](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=955-1230) (`955:1230`) |

Branchement : `pages/mon-projet/index.vue` (mobile) et `desktop-pages/mon-projet.vue`.
Le CTA **Profilage** de la navbar desktop pointe vers `/mon-projet` (middleware `auth`).

Données = mêmes accompagnements que le mobile (`useProjetData` + mock si API vide).
Libellés cartes Figma (« Intégrer une école », …) via `desktop.monProjet.*`.
Vue d’ensemble = moyenne réelle des cartes (pas le 92 % du mock Figma).
Prochaines actions = cartes encore en cours, pas les tâches illustratives Figma.
MBA 0 % du donut Figma omis (pas de type API). CTA bas → accueil (`/`).

## Mon projet — Admission

| Figma | Node |
|---|---|
| Aperçu | [Mon projet admission](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=955-712) (`955:712`) |
| Documents | [Mon projet - Admission_Documents](https://www.figma.com/design/cp2QlJNiQY7TzAUHQpFDM9/Working_Files_Qiryrna?node-id=909-789) (`909:789`) |

Branchement : `pages/mon-projet/admission.vue` (mobile) et `desktop-pages/mon-projet-admission.vue`.
Onglet **Suivi & échanges** retiré (comme le mobile). Aperçu = étapes checklist API, pas les 4 services illustratifs du Figma. Documents = même liste d’essai que le mobile (pas d’endpoint par pièce). Prochaines étapes = documents non validés. CTA conseiller → `/messages`. Hero = `order.offer` + % réel des étapes.

## Règles

| | Mobile | Desktop |
|---|---|---|
| Dossier | `app/pages/` | `app/desktop-pages/` |
| Routing Nuxt | oui | non |
| Layout | `layouts/mobile.vue` | `layouts/desktop.vue` |
| Chemin fichier | même arborescence relative | même arborescence relative |
