# Mon projet (aperçu) — mocks hors API

Écran : `/mon-projet/apercu` ← maquette `pwa/pages/mon-projet-apercu.html`  
Config : `app/config/projet-overview-mock.ts`

> **Hub produit** : `/mon-projet` = liste `mon-projet.html` (accompagnements),  
> pas cet aperçu.

## Source API

| Élément | Source | Notes |
|---|---|---|
| Progression % | `paymentRepo.orders` | `confirmed / total` ; fallback **65 %** si aucune commande |
| Compteur « Terminés » | commandes `confirmed` | fallback **2** |
| Compteur « En cours » | commandes `pending` | fallback **1** |

## Mockés (absents de l’API)

| Élément | Valeur mock | Pourquoi |
|---|---|---|
| « Mis à jour aujourd'hui » | i18n fixe | Pas d’horodatage global projet |
| « À venir » | `1` | Pas de statut « upcoming » côté commandes |
| Prochain RDV | `12 mai 2026` | Pas d’endpoint rendez-vous conseiller |
| 4 cartes « Mes services » | Orientation / Langue / Logement | Contenu éditorial maquette |
| CTA « Prendre rendez-vous » | non lié | Pas de booking conseiller |

## Navigation

| Action | Route |
|---|---|
| Liste accompagnements (hub) | `/mon-projet` ← `mon-projet.html` |
| Aperçu | `/mon-projet/apercu` |
| Voir tout (depuis aperçu) | `/mon-projet` |
