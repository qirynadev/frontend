# Logement — destinations — mocks / replis hors API

Écran :
- `/logement` ← grille pays (`maquette/pwa/pages/logement.html`)

Suite : `/logement/[slug]/decouverte` → `/logement/[slug]` (formules, API `offerPageRepo`)

Config / contrat : `LivingDestination` (`app/core/contracts/living.ts`), adapter `toLivingDestination`  
Assets : `public/img/icons/ic-log-*`, `public/img/icons/log-intro/*` (découverte)

## Source API

| Élément | Source | Notes |
|---|---|---|
| Liste des pays | `GET /livings` via `livingRepo.list` | Grille dynamique (pays avec formules publiées) |
| Photo / drapeau / nom | oui | |
| Nombre de **villes** | `cities_count` / `city_count` / `cities_total` ou longueur de `cities[]` | Mappé en `cityCount` |
| Nombre de logements | — | **Plus affiché** (remplacé par les villes) |

## Repli éditorial

| Élément | Contenu | Quand |
|---|---|---|
| Badge carte | i18n `housing.cityCount` | `cityCount` renvoyé par l’API |
| Badge carte | i18n `housing.countLabel` → « **350+ villes** » | `cityCount === null` (API sans compte) |

Constante de repli : `FALLBACK_CITY_COUNT = 350` dans `app/pages/logement/index.vue`.

## Découverte pays

`/logement/[slug]/decouverte` : contenu éditorial i18n (`housing.intro.*`) + icônes `log-intro/*` — pas d’endpoint dédié au-delà du slug destination.
