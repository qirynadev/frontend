# Workflow Git — main / release

## Principe

| Branche | Rôle |
|---------|------|
| **`main`** | Travail quotidien — features, fixes, WIP, tests |
| **`release`** | Version validée — état propre et stable du projet |

`release` ne reçoit que du code revu et approuvé. Tout le développement se fait sur `main`.

## État initial (17 août 2026)

- **`release`** créée au commit `8bf47a7` (SW v86, layout destination, thème dark mode moteur).
- **`main`** pointe sur le même commit, avec des modifications locales non commitées en cours :
  - fiche école (`ecole-detail.html`) — onglets, modale formations, CTA flottant
  - offre orientation — refonte bloc formule
  - orientation formules — stack vertical (plus de slider)
  - enrichissement `schools.js`, icônes onglets, SW v90

## Workflow au quotidien

### 1. Développer sur `main`

```bash
git checkout main
# … modifications …
git add …
git commit -m "…"
git push origin main
```

### 2. Valider un lot de modifications

Tester localement, relire le diff, s'assurer que la PWA fonctionne (hard refresh / SW).

### 3. Promouvoir vers `release`

Une fois validé sur `main` :

```bash
git checkout release
git merge main
git push origin release
git checkout main
```

Merge **fast-forward** si `release` n'a pas divergé ; sinon merge commit classique.

### 4. Déploiement

Brancher l'environnement de production (Coolify, etc.) sur **`release`**, pas sur `main`.

## Règles

- Ne pas committer directement sur `release` sauf hotfix urgent (puis merger le hotfix dans `main`).
- Ne pas force-push `release` sans accord explicite.
- `main` peut être en avance sur `release` — c'est normal.
- Fichiers de backup locaux (ex. `*.backup.html`) : ne pas les inclure dans les commits.

## Commandes utiles

```bash
# Voir l'écart entre main et release
git log release..main --oneline

# Voir les fichiers modifiés entre les deux branches
git diff release..main --stat

# Lister les branches
git branch -a
```

## Branches annexes

- **`feature/dark-mode-v2`** — expérimentation dark mode (refonte contrastes), conservée localement. Non mergée dans `main` ni `release`.
