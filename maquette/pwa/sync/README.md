# Couche sync maquette ↔ frontend

Fichiers **purs données** — jamais importés par `app.css` ni les pages HTML.

| Fichier | Rôle |
|---|---|
| `screen-map.json` | 32 écrans → route Nuxt → fichier `.vue` → statut |
| `component-map.json` | Classes maquette → composants `Q*` |
| `token-map.json` | `--q-*` ↔ `--color-*` (frontend) |
| `apply-annotations.mjs` | Injecte commentaires + `data-q-*` dans `pages/*.html` |

## Usage

```bash
# Annoter / ré-annoter les pages (idempotent)
node sync/apply-annotations.mjs

# Vérifier qu'aucune page n'a perdu son marqueur
node sync/apply-annotations.mjs --check
```

## Statuts `@sync-status`

| Valeur | Signification |
|---|---|
| `aligned` | Porté et validé visuellement |
| `partial` | Layout OK, contenu ou fonctionnel incomplet |
| `remeasure` | À remesurer pixel 375px |
| `missing` | Pas encore porté côté Nuxt |
| `backup` | Fichier archive, hors sync |

## Pipeline

```
main (WIP) → validation → release → npm run maquette:sync (frontend)
```

Voir `docs/comparatif-maquette-frontend.md` et `docs/git-workflow.md`.
