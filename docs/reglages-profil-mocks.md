# Réglages — Informations personnelles — mocks hors API

Écran :
- `/reglages/informations-personnelles` ← Figma Working_Files_Qiryrna node `1553:1020`

Config : `app/config/reglages-profil-mock.ts`  
Assets : `public/img/icons/reglages-profil/*`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Prénom / nom / photo / téléphone / ville | `session.user.profile` (+ `user.email`) | Préremplissage |
| Date de naissance / pays | — | **Absents** du contrat session → mock Figma |
| Enregistrement / photo / suppression compte | — | **Pas d’endpoint** ; actions inertes |

## Mockés

| Élément | Contenu | Quand |
|---|---|---|
| Repli champs | Valeurs Figma (`Doungnan`, `Coulibaly`, …) | Champ session vide |
| Modifier la photo | Bouton sans upload | Toujours |
| Supprimer mon compte | Ligne sans navigation | Toujours |

## Navigation

| Action | Route |
|---|---|
| Informations personnelles | `/reglages` → `/reglages/informations-personnelles` |
| Retour (topbar) | `/reglages` |
