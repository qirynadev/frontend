# Fiche école — badges du héros (mocks)

Écran : `/destinations/[slug]/ecoles/[school]` desktop ← Figma `Fiche ecole` `8:562`, tags `8:613`.

Config : `app/config/school-title-badges.ts` · rendu : `app/desktop-pages/fiche-ecole.vue`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Titre, ville, logo, cover | `School` | Câblé |
| Présentation HTML | `School.presentation` | Câblé |
| Formations | `GET /schools/{id}/formations` | Câblé |
| Points forts | `School.details[]` dont `title ≈ "Points Forts"` | Convention admin, pas un champ dédié — `docs/directives-backend.md` §19 |
| Type d’établissement (Grande école, Privée, Université…) | — | **Absent de l’API** |
| Accréditations (AACSB, Equis, AMBA) | — | **Absent de l’API** |

## Repli éditorial

Les pastilles sous le titre (Figma `8:614`–`8:622`) sont donc mockées :

| Badge | Couleur Figma | Jeu |
|---|---|---|
| Grande école | `#4a248a` | défaut (écoles / business schools) |
| Privée | `#3b3b3b` | défaut |
| AACSB | `#279848` | défaut |
| Equis | `#0066cc` | défaut |
| AMBA | `#0066cc` · uppercase | défaut |
| Université | `#4a248a` | si le titre matche `universit` / `facult` / `college` |
| Publique | `#3b3b3b` | idem |

Surcharge manuelle possible via `SCHOOL_TITLE_BADGES_BY_SLUG` (slug API → liste de badges).

Libellés i18n : `desktop.ficheEcole.badge*`.

## À brancher côté API

Champs dédiés du type `school_type` + `accreditations[]` (libellé + code couleur ou token) permettraient de retirer ce mock sans changer le rendu.
