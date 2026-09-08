# Mon projet — statut des données (mis à jour 2026-08-23)

Écran : `/mon-projet` ← maquette `pwa/pages/mon-projet.html`
Logique : `app/composables/useProjetData.ts`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Commandes école/logement | `paymentRepo.orders` | Types `areaofstudy`, `costofliving` |
| Langues | `planningRepo.unplanned` + `planned` | Groupées par langue |
| Orientation | `orientationEvaluationRepo.list` | Un bilan par commande `profilage` |

## Règles confirmées par le responsable (2026-08-23)

- **Exactement 4 cartes, une par rubrique** (Admission, Logement, Langues,
  Orientation) — jamais une carte par commande, par langue ou par bilan. Un
  client qui achète plusieurs cours de langues, plusieurs commandes de
  logement/admission ou plusieurs bilans d'orientation (E-Testing) voit
  toujours **une seule carte par rubrique** ; le détail par commande n'existe
  qu'au clic, sur l'écran dédié à cette rubrique.
- **Score = moyenne des avancements individuels**, le nombre de produits
  achetés dans la rubrique servant de dénominateur. Exemple donné par le
  responsable : deux cours de langues différents (20h d'anglais + 30h de
  français) → dénominateur = 2, pas la somme des heures. Chaque produit
  contribue son propre pourcentage (0 si non mesurable — commande non
  confirmée, checklist vide, ou aucune évaluation encore créée), la moyenne de
  ces pourcentages est le score affiché.
- **Client sans aucun achat** : les 4 rubriques s'affichent quand même,
  toutes à **0 %**, sans conseiller ni date, plutôt qu'un contenu d'exemple
  (l'ancien mock affichait 80/30/50/100 % avec de faux noms de conseillers —
  ce fichier a été retiré, `ensureAllTypes()` injecte une carte à 0 % par
  rubrique sans données réelles).

Détail par type dans `useProjetData.ts` :
`toOrderAggregateAccompagnement` (école/logement, moyenne des checklists),
`toLanguageAccompagnement` (langues, moyenne des heures complétées/expirées
par langue), `toOrientationAccompagnement` (orientation, moyenne des jalons
par bilan, voir `app/utils/orientation-progress.ts`).

## Encore hors API

| Élément | Statut |
|---|---|
| Sous-titre (Admission/Logement/Orientation) | `offer.title` de la commande la plus récente — vide si absent côté API |
| Conseiller / date de mise à jour | Masqués sur la carte agrégée (plusieurs commandes peuvent avoir des valeurs différentes, arbitraire d'en choisir une) |

## Navigation

| Action | Route |
|---|---|
| Liste accompagnements (hub) | `/mon-projet` ← `mon-projet.html` |
| Carte **Cours de langues** | `/mon-projet/langues` ← Figma `860:4150` Mon Projet - Langue 1 |
| Carte **Orientation** | `/mon-projet/orientation` |
| Carte Admission | `/mon-projet/admission` |
| Carte Logement | `/mon-projet/logement` |

Doc destinations logement (badge villes) : `docs/logement-mocks.md`
Doc messages : `docs/messages-mocks.md`
