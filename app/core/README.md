# `app/core/` — la couche application

**Règle d'or : aucun `import` venant de `components/`, `design-system/`, `layouts/` ou
`pages/` ne doit apparaître ici.** C'est ce qui rend l'ajout du desktop (Lot 3) et
l'absorption des changements d'API (Lot 2) peu coûteux.

```
core/
├── http/
│   ├── api-client.ts       client bas niveau, SANS dépendance Nuxt (testable, utilisable par Nitro)
│   ├── client.ts           bffFetch : ce que consomment les repositories
│   ├── errors.ts           ApiError normalisée (kind, status, fieldErrors)
│   ├── session.ts          cookie httpOnly — aucun localStorage
│   └── session.constants.ts  constantes partagées avec les routes Nitro
├── contracts/              types du DOMAINE (pas de l'API)
├── adapters/               ← COUCHE ANTI-CORRUPTION : tout le code défensif est ici
├── repositories/           l'API telle que l'application la voudrait
└── stores/                 Pinia
```

Sens de dépendance, à sens unique :

```
pages / components  →  core/stores  →  core/repositories  →  core/http/client
                                              ↓
                                       core/contracts

server/api/bff/**   →  server/utils/catalog.ts  →  core/adapters  →  core/http/api-client
```

Un composant ne connaît que `core/contracts` et `core/stores`. Il n'appelle jamais
`$fetch`, ne connaît aucune URL, et ignore la forme réelle des réponses de l'API.

📖 Détail complet, mesures et procédure de bascule : [`ARCHITECTURE-API.md`](../../ARCHITECTURE-API.md).

## Vérifications

```bash
# Aucun import remontant vers la couche de présentation
grep -rn "from '.*\(components\|design-system\|layouts\|pages\)" app/core/

# Aucun appel réseau hors de core/http
grep -rn '\$fetch' app/pages app/components app/design-system app/layouts

# Adapters : 100 tests, sans Nuxt ni réseau
npm test
```
