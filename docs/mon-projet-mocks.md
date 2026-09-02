# Mon projet — mocks hors API

Écran : `/mon-projet` ← maquette `pwa/pages/mon-projet.html`  
Config : `app/config/projet-accompagnements-mock.ts`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Liste commandes | `paymentRepo.orders` | Types `areaofstudy`, `costofliving`, `profilage` |
| Langues | `planningRepo.unplanned` + `planned` | Une carte par langue (heures cumulées) |

## Mockés (absents / incomplets côté API)

| Élément | Mock maquette | Quand |
|---|---|---|
| 4 cartes complètes | Admission 80 %, Logement 30 %, Langues 50 %, Orientation 100 % | Aucune commande / langue API |
| Sous-titre | ESA Paris, Recherche…, Anglais B1, Profil généré | `offer.title` / langue vide |
| Progression % | 80 / 30 / 50 / 100 | `Order.status` ne porte que le paiement → % `null` |
| Conseiller | Sarah Kouamé, Idriss Traoré, Amina Diallo, Marie Konan | `advisorName` souvent `null` |
| Date de mise à jour | hier / 2j / 1j / 5j | `updatedAt` absent |

Enrichissement : `enrichAccompagnementFromMock()` — complète carte par carte sans écraser une valeur API déjà présente.

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

Les 4 cartes maquette sont **toujours** affichées : types manquants côté API
injectés via `mergeAccompagnementsWithMaquette()`.
