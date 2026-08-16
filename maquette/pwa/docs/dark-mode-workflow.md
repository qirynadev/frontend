# Mode sombre — workflow Git

Ce document décrit comment le travail sur le **mode sombre** est organisé dans le dépôt, sans polluer `main` tant que la refonte n’est pas prête.

## Contexte

- Le commit `608dddd` a introduit un premier moteur de thème (clair / sombre / système) sur `main`.
- Une refonte plus complète (contrastes, navbar, headers, etc.) a été testée localement puis **annulée** sans commit sur `main`.
- L’état « sans moteur de thème » a été conservé dans un **stash** pour repartir proprement plus tard.

## État actuel du dépôt

| Élément | Description |
|--------|-------------|
| **`main`** | Aligné avec `origin/main`. Contient le moteur de thème du commit `608dddd`. Working tree propre. |
| **Branche `feature/dark-mode-v2`** | Branche de travail dédiée à la prochaine itération du mode sombre (même point de départ que `main` au moment de sa création). |
| **Stash `stash@{0}`** | Message : `revert dark mode — référence locale`. Contient l’annulation locale du mode sombre (fichiers modifiés + suppression de `theme-init.js` / `theme.js`). |

## Principes

1. **Ne pas committer le revert sur `main`** — la branche stable reste la référence déployée.
2. **Tout nouveau travail mode sombre se fait sur `feature/dark-mode-v2`** (ou une branche fille).
3. **Le stash sert de référence** optionnelle ; on l’applique uniquement sur la branche de feature, jamais sur `main`.

## Commandes courantes

### Vérifier où l’on en est

```bash
git status
git branch
git stash list
```

### Travailler normalement (hors mode sombre)

```bash
git checkout main
```

Aucune action liée au stash. Commits habituels sur `main` ou sur d’autres branches de feature.

### Reprendre le mode sombre

```bash
git checkout feature/dark-mode-v2
git stash pop
```

Après `stash pop`, le working tree contient à nouveau l’état sans moteur de thème (base pour refaire l’implémentation proprement).

Ensuite, commits **incrementaux** sur `feature/dark-mode-v2`, par exemple :

- tokens CSS + `theme-init.js` / `theme.js`
- branchement écran Réglages → Thème
- contrastes écran par écran
- navbar / headers

### Si `stash pop` crée un conflit

```bash
git stash list          # le stash peut rester partiellement appliqué
git status              # résoudre les conflits à la main
git add ...
git stash drop          # une fois tout OK, supprimer le stash si pop réussi
```

### Revenir sur main sans perdre le travail sur la branche dark mode

```bash
git add -A
git commit -m "WIP dark mode"
git checkout main
```

Ou, si le travail n’est pas prêt à committer :

```bash
git stash push -u -m "WIP dark mode v2"
git checkout main
```

### Fusionner quand le mode sombre est prêt

```bash
git checkout main
git merge feature/dark-mode-v2
git push origin main
```

Alternative recommandée en équipe : ouvrir une **pull request** `feature/dark-mode-v2` → `main`.

## Ce qu’il ne faut pas faire

| Action | Risque |
|--------|--------|
| `git stash pop` sur `main` | Réintroduit le revert sur la branche stable sans cadre. |
| Commiter le revert sur `main` | Figé l’annulation du thème en production avant la refonte. |
| Laisser des dizaines de fichiers modifiés sur `main` sans branche | Confusion à la reprise, risque de commit accidentel. |
| `git push --force` sur `main` | Destructif pour les autres contributeurs. |

## Fichiers concernés par le mode sombre (rappel)

Lors d’une implémentation complète, toucher typiquement :

- `pwa/js/theme-init.js`, `pwa/js/theme.js`
- `pwa/css/app.css` (tokens + surcharges `html[data-theme="dark"]`)
- `pwa/pages/reglages-theme.html`, `pwa/pages/reglages.html`
- `<script src="../js/theme-init.js">` dans les pages HTML
- `pwa/sw.js` (cache + assets JS)

## Historique des commits utiles

| Commit | Contenu |
|--------|---------|
| `608dddd` | Premier moteur de thème sur `main` (SW v85). |
| `6cf369b` | État immédiatement **avant** ce moteur (référence si besoin de diff). |

## Création de ce workflow (Option B)

Étapes déjà exécutées :

```bash
git stash push -u -m "revert dark mode — référence locale"
git branch feature/dark-mode-v2
# resté sur main, working tree propre
```

---

*Dernière mise à jour : août 2026*
