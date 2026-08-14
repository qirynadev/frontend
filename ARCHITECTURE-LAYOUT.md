# Qiryna — Layouts et stratégie d'appareil

> Lot 3. Court, mais c'est lui qui décide du coût du desktop.

---

## 1. La règle qui gouverne tout

> **La mise en page se décide en CSS. Le comportement se décide en JavaScript.**

| Question | Outil | Pourquoi |
|---|---|---|
| Où placer ce bloc, quelle taille, combien de colonnes ? | variantes Tailwind `shell:` | fonctionne sans JS, sans décalage d'hydratation, et juste dès le premier octet |
| Ouvrir une bottom sheet ou une modale ? Activer un carrousel tactile ? | `useDevice()` | dépend d'un vrai comportement, pas d'un rendu |

Tout le reste du lot découle de cette séparation.

---

## 2. `useDevice()` — `matchMedia` uniquement

[`app/composables/useDevice.ts`](app/composables/useDevice.ts)

```ts
const { isMobile, isDesktop, isHydrated } = useDevice()
```

### Pourquoi pas le user-agent

Le user-agent est faux dans les trois cas les plus fréquents :

- un **iPad** se déclare macOS depuis iPadOS 13 ;
- un **portable tactile** se déclare desktop, et l'inverse ;
- surtout, **un user-agent ne bouge pas quand l'utilisateur redimensionne sa
  fenêtre** — un bug qu'on ne voit qu'en production, chez quelqu'un d'autre.

`matchMedia` répond à la seule question qui compte : de quelle largeur dispose-t-on
*maintenant* ?

### Le piège SSR, et ce qu'on en fait

Au premier rendu serveur, aucune largeur n'est connue : `isMobile` et `isDesktop`
valent **tous les deux `false`**. Un `v-if="isDesktop"` autour de deux structures
différentes produirait un décalage d'hydratation, et le desktop recevrait d'abord le
shell mobile.

D'où la troisième valeur, `isHydrated` : elle rend le piège visible dans le code appelant.

```vue
<!-- ✅ comportement, gardé jusqu'à l'hydratation -->
<QSheet v-if="isHydrated && isMobile" side="bottom" />
<QModal v-else-if="isHydrated" />

<!-- ❌ mise en page : à faire en CSS -->
<div v-if="isDesktop" class="grid-cols-3">…</div>
```

`/dev/ui` affiche les trois valeurs en direct : redimensionner la fenêtre les fait suivre.

### Une seule frontière, déclarée deux fois — et vérifiée

La rupture existe en CSS (`--breakpoint-shell: 768px`) et en JS
(`SHELL_BREAKPOINT = 768`). Deux déclarations d'une même frontière, c'est une dérive qui
attend son heure : la mise en page basculerait à une largeur et le comportement à une
autre, symptôme pénible à diagnostiquer.

`useDevice()` compare donc les deux au montage, en développement, et prévient :

```
[qiryna:useDevice] Rupture désalignée : --breakpoint-shell vaut 800px
mais SHELL_BREAKPOINT vaut 768px.
```

---

## 3. Layouts

```
layouts/
├── mobile.vue     shell 768px · zones sûres · navigation basse
└── default.vue    délègue à mobile.vue — POINT D'ARBITRAGE futur
```

### `mobile.vue`

Trois responsabilités, et pas une de plus :

1. plafonner l'écran à `--container-shell` (768px) et le centrer au-delà ;
2. réserver la place de la barre basse et des zones sûres iOS ;
3. poser la navigation principale.

Il ne connaît **aucune page**. Une page qui veut se passer de la barre basse le déclare :

```ts
definePageMeta({ bottomNav: false })
```

L'option est **typée** ([`app/types/page-meta.d.ts`](app/types/page-meta.d.ts)) : une
faute de frappe est refusée à la compilation, là où elle serait autrement ignorée en
silence.

Le calage vertical suit la maquette :

| Token | Valeur | Rôle |
|---|---|---|
| `--spacing-content-bottom` | `calc(75px + 24px + env(safe-area-inset-bottom))` | marge basse du contenu quand la nav est présente |
| `--spacing-nav-bottom` | `max(12px, env(safe-area-inset-bottom))` | décollement de la barre — plancher de 12px sur un écran sans encoche |
| `--spacing-nav-inset` | `15px` | retrait latéral de la barre |

Sans barre basse, seule `pb-safe-bottom` est appliquée : pas de 99px de vide.

### `default.vue` — le point d'arbitrage

Aujourd'hui il délègue intégralement à `mobile.vue`. **Aucune page ne nomme son
layout** : c'est précisément ce qui permettra de brancher le desktop sans les toucher.

La bascule prévue, en CSS et non en JavaScript :

```vue
<template>
  <div class="contents shell:hidden"><LayoutMobile><slot /></LayoutMobile></div>
  <div class="hidden shell:contents"><LayoutDesktop><slot /></LayoutDesktop></div>
</template>
```

Les deux shells sont rendus, un seul s'affiche, la feuille de style tranche — donc pas
de décalage d'hydratation. Si le coût du double rendu devient gênant, la variante propre
est un shell unique dont seule la mise en page change par classes `shell:` ; jamais une
condition JavaScript.

---

## 4. Navigation basse

La maquette répète le même bloc `<nav class="bottom-nav">` dans ses **15 pages**, avec la
classe `active` déplacée à la main. Ici, trois fichiers, une seule liste.

```
config/navigation.ts              ← la liste, et rien d'autre
components/navigation/AppBottomNav.vue  ← i18n + routes + onglet actif
design-system/QBottomNav.vue      ← primitive muette
```

### La configuration

```ts
{
  id: 'orientation',
  to: '/orientation',
  labelKey: 'nav.orientation',
  icon: 'target',
  match: ['/destinations', '/ecoles', '/domaines', '/formules', '/langues'],
  emphasis: true,
}
```

Ajouter, renommer ou retirer un onglet se fait à un seul endroit. Les libellés sont des
**clés i18n**, jamais du texte.

### L'onglet actif se déduit de la route

Aucune page ne dit « je suis l'onglet Mon projet ». `resolveActiveNavId(path)` s'en
charge, avec deux subtilités qui méritent d'être nommées :

1. **`match`** rattache les écrans satellites à leur onglet. La fiche école
   (`/ecoles/hec-paris`) allume *Orientation*, pas rien du tout.
2. **La correspondance la plus longue gagne.** `/` étant préfixe de tout, une simple
   règle « commence par » laisserait *Accueil* allumé sur toutes les pages du site.

La fonction est **pure** — elle reçoit un chemin déjà délocalisé — donc testée sans Nuxt.

### La primitive reste muette

`QBottomNav` reçoit des entrées **déjà traduites** et l'identifiant de l'onglet actif.
Elle ne connaît ni les routes du produit, ni i18n, ni la route courante. C'est ce qui la
garde utilisable dans la galerie (`inline`) comme en production (position fixe).

---

## 5. Correctif apporté au passage

`nuxt.config.ts` figeait `htmlAttrs: { lang: 'fr' }` — hérité du Lot 1. Conséquence :
`/en/**` s'annonçait en français aux lecteurs d'écran et aux moteurs. `app.vue` pose
désormais `lang` via `useLocaleHead()`.

Vérifié : `/` → `lang="fr-FR"`, `/en/orientation` → `lang="en-US"`.

Le reste des métadonnées SEO par page reste au Lot 6.

---

## 6. Vérifications

```bash
npm test
```

**110 tests** (7 fichiers), dont 10 sur `resolveActiveNavId` : chemin exact,
sous-chemins, écrans satellites, barre oblique finale, préfixe partiel
(`/messagerie` ≠ `/messages`), route hors navigation.

Vérifié dans le navigateur, à 375 px et à 1280 px :

| Point | Résultat |
|---|---|
| `/`, `/messages`, `/orientation`, `/mon-projet`, `/compte` | 200, **exactement un** `aria-current="page"` |
| Navigation client (sans rechargement) | l'onglet actif suit |
| `/en/orientation` | libellés anglais, `aria-label` anglais, onglet *Guidance* allumé |
| Liens en anglais | `/en`, `/en/messages`, … correctement localisés |
| Shell à 375 px | `max-width: 768px`, barre à 345 px de large, `bottom: 12px` |
| Débordement horizontal | aucun |
| `useDevice()` à 375 px | `isMobile: true`, `isDesktop: false`, `isHydrated: true` |

`/dev/ui` a gagné une section `useDevice()` en direct, et la démonstration de
`QBottomNav` utilise la prop `inline`.

---

## 7. Écrans provisoires

`/messages`, `/orientation`, `/mon-projet` et `/compte` existent pour que la barre basse
soit réellement cliquable et vérifiable **dès ce lot** : sans elles, chaque onglet
mènerait à un 404 et rien ne serait testable.

Ce sont quatre fichiers de cinq lignes appuyés sur `PagePlaceholder`, remplacés par leur
écran de maquette au Lot 4.

---

## 8. Ce que ce lot garantit pour le desktop

1. **Aucune page ne nomme son layout** → l'arbitrage se fait en un seul fichier.
2. **Aucune page ne connaît la barre de navigation** → la remplacer par une barre
   latérale ne touche que `default.vue` et `AppBottomNav`.
3. **Aucune page n'appelle `useDevice()`** pour se mettre en page → aucune ne cassera
   quand la largeur changera.
4. **La liste de navigation est une donnée** → une barre latérale desktop consommera la
   même `config/navigation.ts`, sans la redéclarer.
