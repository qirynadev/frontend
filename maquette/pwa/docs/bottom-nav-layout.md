# Bottom nav — espacement et layout (proposition)

> **Statut :** documenté, **non appliqué** (décision du 12 août 2026).  
> Conserver ce fichier comme référence avant une migration globale.

## Problème actuel

La bottom nav utilise `position: fixed` (`pwa/css/app.css`, classe `.bottom-nav`).

Le contenu scroll **sous** la barre. Chaque zone scrollable compense avec :

```css
--q-content-pad-bottom: calc(75px + 24px + env(safe-area-inset-bottom, 0px));
```

Ce padding est dupliqué sur de nombreux sélecteurs (`.dom-main`, `.le-main`, `.dest-main`, etc.).

### Inconvénients

1. **Estimation fragile** — la hauteur réelle de la nav (~75 px) est codée en dur.
2. **Maintenance lourde** — une règle par page / par `-main`.
3. **Incohérences** — padding extra sur certains headers, parfois des `margin` négatifs sur `.q-trust` pour compenser.
4. **Nav découplée du shell** — la barre flotte sur le viewport, le contenu devine sa place.

## Structure HTML existante (déjà compatible)

```html
<div class="screen page-xxx">
  <div class="xxx-header">
    <div class="xxx-main"><!-- scroll --></div>
  </div>
  <nav class="bottom-nav">…</nav>
</div>
```

La nav est déjà **sœur** du bloc contenu dans `.screen`. Il suffit de changer le modèle CSS, pas forcément le HTML.

## Solution recommandée : flex shell

Faire de `.screen` une colonne flex pleine hauteur. La nav reste **dans** la page ; seule la zone centrale scroll.

```css
:root {
  --q-nav-gap: 22px; /* air entre le dernier élément et la barre */
  --q-nav-inset: 15px;
}

.screen {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Wrapper page (ex. .dest-header, .le-header) */
.xxx-header {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Zone scrollable */
.xxx-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: var(--q-nav-gap); /* 22px seulement — plus de 75px */
}

.bottom-nav {
  position: relative; /* remplace fixed */
  flex-shrink: 0;
  margin: 0 var(--q-nav-inset) max(12px, env(safe-area-inset-bottom));
  /* conserver le style visuel actuel (radius, shadow, flex items…) */
}
```

### Comportement attendu

| Cas | Résultat |
|-----|----------|
| Contenu court | Nav en bas de l’écran, contenu au-dessus |
| Contenu long | Scroll dans `xxx-main`, nav toujours visible en bas |
| Dernier bloc (trust bar, pagination…) | **22 px** constants au-dessus de la nav |

Un seul token `--q-nav-gap` remplace la formule `75px + 24px + safe-area` sur chaque page.

## Schéma

```
┌───────────────────────────── .screen (flex column, 100dvh) ─────────────────────────────┐
│  ┌────────────────────── xxx-main (flex:1, overflow-y:auto, pad-bottom:22px) ──────┐  │
│  │  topbar · contenu · trust bar · pagination                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────── bottom-nav (flex-shrink:0) ─────────────────────────┐  │
│  │  Accueil · Messages · Orientation · Mon projet · Compte                         │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## Migration proposée (phases)

1. Introduire les tokens et les règles globales `.screen` / `.bottom-nav` dans `app.css`.
2. **Page pilote** — ex. `destination-etude.html` ou `liste-ecole.html`.
3. Retirer `padding-bottom: var(--q-content-pad-bottom)` des `-main` migrées.
4. Supprimer les compensations ponctuelles (padding bas des headers, marges négatives trust bar).
5. Généraliser à toutes les pages ; option : classe utilitaire `.q-scroll` à la place de N sélecteurs `-main`.
6. Bump `CACHE` dans `sw.js`.

## Alternative légère (sans refactor flex)

Garder `position: fixed`, centraliser uniquement la formule :

```css
:root {
  --q-nav-height: 75px;
  --q-nav-gap: 22px;
  --q-nav-offset: max(12px, env(safe-area-inset-bottom));
  --q-content-pad-bottom: calc(var(--q-nav-height) + var(--q-nav-gap) + var(--q-nav-offset));
}

.q-scroll-main {
  padding-bottom: var(--q-content-pad-bottom);
}
```

Améliore la maintenance mais **ne supprime pas** les écarts entre pages ni le double padding des headers.

## Fichiers concernés

- `pwa/css/app.css` — `:root`, `.screen`, `.bottom-nav`, tous les `.*-main`
- `pwa/pages/*.html` — structure inchangée si flex shell
- `pwa/sw.js` — bump cache après migration

## Références code actuel

- Token : `--q-content-pad-bottom` (`app.css`, `:root`)
- Nav fixe : `.bottom-nav` (`app.css`, ~l.3259)
- Exemple scroll : `.page-dest .dest-main`, `.page-le .le-main`, `.page-dom .dom-main`
