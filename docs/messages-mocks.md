# Messages — mocks hors API

Écran :
- `/messages` ← `maquette/pwa/pages/messages.html`

Config : `app/config/messages-conversations.ts`  
Assets : `public/img/icons/ic-msg-*`, `public/img/msg-*.webp`

## Source API

| Élément | Source | Notes |
|---|---|---|
| Liste des conversations | — | **Pas d’endpoint** messagerie |
| Contenu d’un message | — | Fil i18n (`threadKeys` ou `preview*`) en modale |
| Notifications | — | Onglet vide (copy i18n) |
| Pagination | décorative | `data-pages="4"` maquette ; pas d’API |

## Mockés

| Élément | Contenu | Quand |
|---|---|---|
| 6 conversations | Conseillers + supports (avatar, tag, aperçu, heure, non-lus) | Toujours |
| Détail | Clic carte → **modale** bottom sheet (pattern `.ed-form-modal`) | Même route `/messages` |
| Animation | Slide **bas → haut** (`animate-ed-form-modal-in`, 0,28 s) | Ouverture |
| Hauteur modale | **≥ 75 vh / 75 dvh** | Toujours |
| Corps | `overflow-y-auto` + `overscroll-contain` | Scroll si le fil dépasse |
| Fil long (demo) | Orientation : 6 bulles ; Langues : 3 | Via `threadKeys` |
| Recherche / filtre | — | **retirés** |
| Bandeau « échanges sécurisés » | copy i18n + illustration | Liste |

## Navigation

| Action | Comportement |
|---|---|
| Bottom nav Messages | `/messages` |
| Clic conversation | ouvre la modale (slide) |
| Fermer (× / overlay) | ferme la modale, reste sur la liste |
| Retour topbar | `/` (ou historique) |
