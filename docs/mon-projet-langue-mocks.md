# Mon Projet - Langue — mocks hors API

Écrans :
- `/mon-projet/langues` onglet **Cours planifiés** ← Figma `860:4150` (*Mon Projet - Langue 1*) — **étape 2**
- `/mon-projet/langues` onglet **Cours à planifier** ← Figma `862:241` (*Mon Projet - Langues 2*) — **étape 2**
- `/mon-projet/langues/certification` ← Figma `863:1956` (*Mon Projet - Langues 4*) — **Test final (étape 3)**
- `/mon-projet/langues/:courseId/professeur` ← Figma `865:2982` (*Mon Projet - Professeur*) — CTA **Planifier**
- `/mon-projet/langues/:courseId/planifier` ← Figma `858:3603` (*Créneau Professeur*) — CTA **Choisir**
  - Confirmation → `/mon-projet/langues?tab=planned`

Entrée : carte « Cours de langues » sur `/mon-projet`  
Config : `app/config/projet-langue-mock.ts`  
Assets : `public/img/icons/mpl-langue/*`, `public/img/icons/mpl-prof/*`, `public/img/mpl-prof/*`  
Doc professeurs / créneaux 2 h : `docs/mon-projet-professeur-mocks.md`

## Source API

| Élément | Source | Notes |
|---|---|---|
| % progression | `planningRepo.unplanned` | `totalPlanned / totalHours` ; fallback **50 %** (étape 2) |
| Cours planifiés | `planningRepo.planned` | Si vide → `languePlannedSessionsMock` |
| Cours à planifier | `lessons[]` unplanned | Si vide → `langueUnplannedSessionsMock` → CTA Professeur |
| Countdown / prochain cours | prochaine séance `startDate` future | Sinon **22h 18min 35s** relatif |
| Test de niveau | mock `langueLevelTestUrl` | Carte type orientation sur l’index |
| Étape Test final | — | **Pas d’endpoint** : écran 100 % mock Figma |
| Rapport / test / conseillère | — | Boutons inertes ou lien Messages (hors API langue) |

## Mockés

| Élément | Contenu | Figma |
|---|---|---|
| 3 étapes parcours | Test de niveau → Cours en cours → Test final | Langue 1 & 2 |
| Arrivée mock | `?etape=1` (défaut) : pastille 1 « current » non cochée + carte test | — |
| CTA « Passer le test » | → `?etape=2` (étape 2 : cours + onglets) | mock |
| Pastille Test final | Lien → `/mon-projet/langues/certification` (à l’étape 2) | — |
| Carte test de niveau | Visible **uniquement** à l’étape 1 | aligné orientation |
| 4 cartes planifiées | titre + horaire + date + « Se connecter » | Langue 1 |
| 4 cartes à planifier | titre + « 60 min » + « Planifier » → demo professeur | Langues 2 |
| Test final 100 % | profil prêt, test, à savoir, aide | Langues 4 |
| Labels prochain cours | date / créneau Figma | commun |
| Boutons visioconférence | inertes (pas d’URL API) | commun |

## Layout

- Topbar → « Ma progression » : **`gap: 22px`** (parent `gap-22`, `AppTopBar` `gap=0`)
- Sections : **`gap: 22px`**
- Changement d’onglet : panneaux en **grille empilée** (`invisible`) → hauteur de page stable
- Onglet actif planifiés : accent **rose** ; à planifier : accent **violet** (`#4329f7`)
