# Mon Projet - Professeur — mocks hors API

Écrans :
- `/mon-projet/langues/:courseId/professeur` ← Figma `865:2982` (*Mon Projet - Professeur*)
- `/mon-projet/langues/:courseId/planifier` ← Figma `858:3603` (*Créneau Professeur*)

Entrée : CTA **Planifier** (onglet « Cours à planifier », étape 3)  
Config : `langueTeachersMock`, `langueCreneauHoursMock` dans `app/config/projet-langue-mock.ts`  
Assets : `public/img/icons/mpl-prof/*`, `public/img/mpl-prof/*`, `public/img/icons/mpl-creneau/*`

## Source API — liste professeurs

| Champ carte | API `Teacher` | Notes |
|---|---|---|
| id, fullName, photo | oui | `/user/plannings/teachers/{courseId}` |
| rating, reviewsCount | oui | |
| experienceYears | oui | i18n pluriel |
| biography | oui | non affiché sur la maquette Figma |
| pays / drapeau | **oui** (2026-08-22) | `country.name` / `country_flag`, réels et fiables — câblés |
| badge vérifié | **oui** (2026-08-22) | `user.email_verified_at !== null` — câblé ; ne reflète qu'une confirmation d'e-mail, pas un contrôle de profil dédié, voir `docs/directives-backend.md` §4 |
| qualification (TEFL…) | **oui** (2026-08-22) | `formations[0].diploma` — câblé ; qualité éditoriale encore inégale selon le profil (accepté en dev), voir `docs/directives-backend.md` §3 |
| disponibilité + couleur | **oui** (2026-08-22) | dérivée de `plannings[]` (déjà incluse dans la réponse), voir `app/utils/teacher-availability.ts` |
| prix « À partir de » | **non** | Figma = « - » ; pas un écart, voir `docs/directives-backend.md` |
| recherche / filtres UI | — | **retirés** (liste complète, pagination seule) |
| bandeau satisfaction | **non** | copy Figma mock |
| pagination | client | **4 professeurs / page** (`QPager`) |

## Source API — créneau

| Élément | API | Notes |
|---|---|---|
| Créneaux libres | `planningRepo.events` | Blocs libres découpés en **créneaux de 2 h** |
| Dates / heures | **non** si vide | `langueCreneauHoursMock` : départs `09 / 11 / 13 / 15 / 17 / 19`, durée **2 h**, 7 jours |
| Confirmer | `planningRepo.book` | Contourné en demo |
| Après confirmation | — | → `/mon-projet/langues?tab=planned` |

## Fallback mock

Si l’API renvoie une liste vide **ou** `courseId=demo` / `order=demo-*` :

→ `langueTeachersMock` (**8** professeurs → **2 pages** de 4).

Sur parcours demo, `assignTeacher` / `book` sont **contournés**.

## Parcours

`/mon-projet/langues` → **Cours à planifier** → **Planifier** → Professeur → **Choisir** → Créneau (2 h) → **Confirmer le créneau** → `/mon-projet/langues?tab=planned`
