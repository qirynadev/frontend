# Mon projet — statut des données (mis à jour 2026-08-23)

Écran : `/mon-projet` ← maquette `pwa/pages/mon-projet.html`
Logique : `app/composables/useProjetData.ts`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Liste commandes | `paymentRepo.orders` | Types `areaofstudy`, `costofliving`, `profilage` |
| Langues | `planningRepo.unplanned` + `planned` | Une carte par langue (heures cumulées) |
| Orientation | `orientationEvaluationRepo.list` | Une seule carte, tous bilans confondus (voir ci-dessous) |

## Règles confirmées par le responsable (2026-08-23)

- **Client sans aucun achat** : les 4 rubriques (Admission, Logement, Langues,
  Orientation) s'affichent quand même, toutes à **0 %**, sans conseiller ni
  date, plutôt qu'un contenu d'exemple (l'ancien mock affichait 80/30/50/100 %
  avec de faux noms de conseillers — retiré, `ensureAllTypes()` injecte
  désormais une carte à 0 % par rubrique manquante).
- **Plusieurs commandes de la même rubrique fusionnable** : comme pour les
  langues (une carte par langue, heures cumulées), un client avec plusieurs
  bilans d'orientation (E-Testing) voit **une seule carte** Orientation
  (progression = moyenne des bilans, `toOrientationAccompagnement()`) — le
  clic mène à `/mon-projet/orientation` pour le détail par bilan. Admission et
  Logement restent une carte par commande (règle confirmée séparément le
  2026-08-17, pas concernée par ce changement).

## Encore hors API

| Élément | Statut |
|---|---|
| Sous-titre (Admission/Logement) | `offer.title` de la commande — vide si absent côté API, plus de repli type "ESA Paris" |
| Conseiller | `advisorName` réel (`mentor_name`/`teacher_name`) — `null` la plupart du temps, plus de faux nom |
| Date de mise à jour | `updatedAt` réel — masquée si absente, plus de "il y a 2j" inventé |
| Progression Admission/Logement | `Order.checklist` (`done/total`) quand elle existe, sinon 0 % |

## Navigation

| Action | Route |
|---|---|
| Liste accompagnements (hub) | `/mon-projet` ← `mon-projet.html` |
| Carte **Cours de langues** | `/mon-projet/langues` ← Figma `860:4150` Mon Projet - Langue 1 |
| Carte **Orientation** | `/mon-projet/orientation` |
| Carte Admission | `/mon-projet/admission` |
| Carte Logement | `/mon-projet/logement` |
