# Prompts de répartition — travail par agent

> Document d'organisation. Chaque agent reçoit **un lot d'une ou deux pages**.
> Un agent superviseur vérifie et intègre. Deux chantiers parallèles : la
> **conformité visuelle** (thème clair) et la **mise sous données réelles**.

---

## 0. Comment utiliser ce document

1. Copier le **brief commun** (§ 1) en tête du prompt de chaque agent.
2. Y coller ensuite le **prompt du lot** (§ 3).
3. Confier la vérification à l'agent superviseur (§ 4).

Le brief commun n'est pas du remplissage : il contient une douzaine de pièges
qui ont coûté plusieurs heures. Un agent qui ne l'a pas les repaiera.

---

## 1. Brief commun — à coller en tête de chaque prompt

````markdown
# Contexte

Application Nuxt 4 (SSR, Vue 3.5, Tailwind v4, i18n fr/en) qui porte **au pixel**
une maquette HTML/CSS servant de spécification. Dépôt :
`C:\laragon\www\qiryna-front`. Lire `REPRISE.md` en premier, puis
`DESIGN-SYSTEM.md` et `ARCHITECTURE-API.md`.

La maquette est servie sur la même origine que l'app :
`http://localhost:3000/_maquette/pages/<page>.html`. Sa CSS est
`maquette/pwa/css/app.css` — **la référence de toute mesure**.

# Règles non négociables

- **Aucune valeur en dur** : couleur, espacement, rayon, taille de police passent
  par les tokens de `app/assets/css/main.css` (`@theme`). Valeur manquante →
  ajouter un token, avec un commentaire disant d'où elle vient.
- **Aucune chaîne visible en dur** : i18n `fr` **et** `en`, clés triées
  alphabétiquement, parité stricte.
- **Aucune balise HTML dans un message i18n.** Le plugin rejette alors le
  **fichier de locale entier** : le client démarre sans aucun namespace et toutes
  les pages affichent leurs clés brutes après hydratation, le rendu serveur
  restant correct. Une coupure de ligne ou un fragment en gras se traitent au
  gabarit, avec des clés séparées. `tests/i18n-locales.spec.ts` le vérifie.
- **Aucun `$fetch` hors de `app/core/http/`.**
- **Icônes → `/img/icons/`**, jamais `/icons/` (alias Apache réservé en prod).
- **Quatre états par vue** : chargement, vide, erreur, nominal (`PageState`).
- Écrans de compte : `definePageMeta({ middleware: 'auth' })`.
- **Un lien sans écran cible reste un `div`**, jamais un lien mort — c'est ce que
  fait la maquette avec `href="#"`.

# Méthode de mesure — la seule qui marche

Ne **jamais** reconstruire « d'après les valeurs CSS lues ». On mesure le DOM des
deux versions côte à côte.

1. `npm run dev`, cookie `qiryna_locale=fr` avant toute comparaison.
2. Deux `<iframe>` de 375px dans le navigateur intégré, puis
   `getBoundingClientRect()` + `getComputedStyle()` élément par élément, en
   appariant par nom de classe de la maquette.
3. **Viewport de référence : 375px.** Lire les `@media` de la page dans
   `app.css` avant de coder : `max-width: 390px` (et 380/400/420) s'appliquent
   à 375px, donc au cas nominal.
4. Critère de fin : **zéro écart réel**, faux positifs exclus (liste ci-dessous).

## Faux positifs à ignorer

- `rounded-full` mesuré `2.68e7px` côté app vs `9999px` côté maquette.
- Sur un `<button>` : `font-size: 13.33px` et `color: rgb(0,0,0)` (valeurs UA),
  sans effet si les textes enfants ont leur couleur explicite.
- `box-shadow` composé par Tailwind : la liste se termine par la bonne ombre, le
  reste est transparent.
- `border-style: solid` avec une largeur de 0 (preflight Tailwind).

## Cinq artefacts d'environnement qui font perdre des heures

- **Régénérer la feuille Tailwind avant de mesurer.** Après ajout d'un token ou
  d'une classe inédite, le serveur de dev ne les intègre pas immédiatement : on
  mesure des écarts qui n'existent pas. **Redémarrer le serveur.**
- **Service worker de la maquette** (scope `/_maquette/`) : il sert des copies
  périmées de `app.css` et des pages. Le désenregistrer et vider `caches` **à
  chaque** chargement d'iframe — il se réenregistre seul.
- **Barre de défilement.** Une iframe de 375px donne un `clientWidth` de 360,
  soit le seuil de `@media (max-width: 360px)`. Compenser la largeur. Plusieurs
  maquettes posent `scrollbar-gutter: stable` ou font défiler un conteneur
  interne : 15px de moins, inexistants sur mobile. Neutraliser avant de conclure.
- **Transitions figées.** Le panneau navigateur ne compose pas d'images : une
  `transition` reste bloquée sur sa valeur de départ et les états actifs
  paraissent inversés. Injecter `transition: none !important` des deux côtés.
- **Vérifier quel serveur répond.** Un serveur de dev peut se rabattre sur le
  port prévu pour la production. Signature : des URL `/_nuxt/@fs/…` et
  `@nuxt/devtools` dans le réseau.

## Mesurer les positions, pas seulement les hauteurs

**Une hauteur totale juste ne prouve rien.** Sur les deux écrans de paiement,
la page se terminait à 789,3px contre 787,3 attendus — 2px, l'air conforme.
En réalité chaque bloc était mal placé et les erreurs se compensaient : bandeau
8px trop bas, encart d'aide 18px trop haut.

Comparer donc, pour chaque enfant du conteneur principal : **position absolue,
hauteur, et intervalle avec le bloc suivant**. Un tableau de positions révèle
immédiatement une dérive qu'une hauteur globale masque.

Corollaire fréquent : la maquette porte souvent son rythme vertical par un
`gap` sur le conteneur (`--pr-block-gap`, `--lpp-block-gap`, `--mp-block-gap`…)
avec des blocs à **zéro retrait**. Reproduire cela avec des `pb-*` sur les blocs
donne des positions fausses même si la hauteur finale tombe juste.

## Quand l'appariement par nom de classe ne marche pas

Plusieurs pages de l'application n'emploient **aucune** classe de la maquette :
elles sont écrites en utilitaires Tailwind. Sur l'accueil, comparer les 66
sélecteurs `.home-*` ne rapporte que des « absent dans l'app » — et **zéro
écart réel détecté**, alors qu'il y en avait sept.

Dans ce cas, parcourir les **deux arbres en parallèle** : à chaque niveau,
apparier les enfants visibles par leur index et comparer `width`, `height`,
`top`, `left`. Descendre tant que la géométrie coïncide, s'arrêter et signaler
dès qu'elle diverge.

```js
const visibles = p => [...p.children].filter(e => {
  const r = e.getBoundingClientRect(); return r.width > 0.5 || r.height > 0.5;
});
// puis walk(blocMaquette, blocApp) en comparant box() à chaque niveau
```

Vérifier d'abord que le **nombre d'enfants visibles** correspond : une
différence de structure invalide l'appariement par index, et doit être
signalée telle quelle.

## Trois pièges de cascade, invisibles à la lecture du HTML

- Une règle peut être **inerte** : `.mpl-step:first-child` ne s'applique jamais,
  le premier enfant étant un conteneur de traits. Reproduire l'**effet mesuré**,
  pas l'intention lue.
- Un sélecteur positionnel compte ce qu'on ne croit pas :
  `.rg-section:nth-of-type(n+3)` inclut `.rg-intro`, qui est aussi une `<section>`.
- Une classe bat un attribut : `.rm-match { display: block }` l'emporte sur
  `hidden`, et la ligne « masquée » occupe bel et bien sa marge.

## Utilitaires Tailwind qui ne font pas ce qu'on croit

- `m-0 mb-12` : à spécificité égale, `m-0` gagne. Écrire `mt-0 mb-12`.
- `text-base leading-12` : `text-base` impose sa paire d'interligne. Forcer avec
  `leading-[12px]`.
- `rounded-2xl` vaut **12px** dans ce thème, pas 16.
- Une graisse non déclarée dans `@theme` ne produit rien.
- Deux utilitaires de **même famille** se départagent par l'ordre de la feuille,
  pas par l'ordre d'écriture : `size-30` perd contre le `size-32` d'un composant.
  Une valeur arbitraire (`size-[30px]`) tranche.
- Le preflight supprime le `padding: 1px` que le navigateur applique aux `input`.
- `<component :is>` : importer `NuxtLink` depuis `#components`.
  `resolveComponent('NuxtLink')` rend un élément inconnu `<nuxtlink>`, **sans
  `href` ni clic** — et la mesure au pixel ne le voit pas.

# Écran protégé par `auth`

Commenter temporairement `definePageMeta({ middleware: 'auth' })` avec le
marqueur `// MESURE-TEMP`, mesurer, **restaurer avant de committer**.

# Avant de rendre le travail

```bash
npm run typecheck 2>&1 | grep -E "error TS" | grep -v nuxt.config   # doit être vide
npm test                                                            # doit être vert
grep -rn "MESURE-TEMP\|query.demo" app/                             # doit être vide
```

Travailler sur une **branche dédiée** au lot, ne jamais committer sur `main`, ne
jamais pousser. Message de commit en français, expliquant **la cause** des écarts
corrigés, pas seulement le correctif.

# Ce qu'on attend en retour

Un rapport court disant, pour chaque page : le nombre d'écarts trouvés, leur
cause, et la mesure finale prouvant qu'il n'en reste aucun. Si un écart n'a pas
pu être résorbé, le dire — ne pas le passer sous silence.
````

---

## 2. Répartition des lots

La maquette vient d'être resynchronisée (`UzaLab/qiryna` → `8bf47a7`) : des
contenus ont été **retirés**, plusieurs pages livrées ne sont donc plus
conformes.

### Chantier A — conformité visuelle (thème clair)

| Lot | Pages | État |
|---|---|---|
| ~~A1~~ | `mon-projet/index`, `mon-projet/admission` | ✅ livré et vérifié |
| ~~A2~~ | `reglages/index`, `reglages/theme` | ✅ livré et vérifié |
| ~~A3~~ | `paiement-reussi`, `langues/[slug]/paiement-reussi` | ✅ livré, **repris** (rythme porté par les blocs au lieu du conteneur) |
| ~~A4~~ | `orientation.vue` | ✅ refait et vérifié — écrit sur des composants génériques mal calibrés |
| ~~A5~~ | `destinations/[slug]`, `destinations/[slug]/ecoles` | ✅ livré et vérifié |
| ~~A6~~ | `destinations/[slug]/ecoles/[school]`, `offres/[slug]` | ✅ livré et vérifié — les 18px de la carte de palier viennent d'une donnée réelle plus courte que la démo maquette |
| ~~A7~~ | `index.vue` (accueil) | ✅ rythme et cartes conformes — **sections non traitées** |
| ~~A7 bis~~ | `index.vue` — les deux sections | ✅ livré et vérifié |
| ~~A8~~ | `AppSideMenu.vue`, `side-menu.ts` (menu latéral) | ✅ mesuré — **déjà conforme, aucun correctif nécessaire** |

### Chantier B — écrans à créer

| Lot | Maquette | Route |
|---|---|---|
| ~~B1~~ | `offres-logement.html` | ✅ livré et vérifié — `logement/[slug]` |
| ~~B2~~ | `orientation-scolaire.html`, `orientation-formules.html` | ✅ livré et vérifié — `orientation` (contenu remplacé, même slug), `orientation/formules` |
| ~~B3~~ | `orientation-post-paiement.html`, `logement-post-paiement.html` | ✅ livré et vérifié — `orientation/paiement-reussi`, `logement/paiement-reussi` |
| **B4** | `mon-projet-apercu.html` | `mon-projet/apercu` (cadré avec le responsable) — **maquette distincte** de `mon-projet.html` |

### Chantier C — mise sous données réelles

Ces écrans affichent aujourd'hui des **données d'essai** tirées de la maquette.
Il faut les brancher sur l'API via un repository et un adapter, en respectant la
couche anti-corruption décrite dans `ARCHITECTURE-API.md`.

| Lot | Fichiers de données d'essai | Écran |
|---|---|---|
| **C1** | `app/composables/useProjetData.ts` | `mon-projet/index` |
| **C2** | `app/composables/useAdmissionData.ts` | `mon-projet/admission` |
| **C3** | `app/composables/useLogementData.ts` | `mon-projet/logement` |
| **C4** | `app/config/messages-conversations.ts` | `messages` |
| **C5** | `app/config/logement-destinations.ts` | `logement/index` |

⚠️ Un lot C ne peut démarrer que si l'endpoint existe. **Première tâche de
chaque agent C : vérifier l'endpoint et le dire si rien ne l'expose** — auquel
cas le lot s'arrête là, sans inventer de contrat.

---

## 3. Prompts par lot

### Lot A1 — `mon-projet` et `mon-projet/admission`

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

Réaligner deux écrans sur la maquette **resynchronisée**. Ils étaient conformes,
la référence a changé depuis.

## Page 1 — `app/pages/mon-projet/index.vue` ← `mon-projet.html`

`git diff f9ca05c~1 f9ca05c -- maquette/pwa/pages/mon-projet.html` montre le
changement. Au minimum : le lien **« + Nouveau projet » a été retiré** de la
maquette. Vérifier s'il y a autre chose.

## Page 2 — `app/pages/mon-projet/admission.vue` ← `mon-projet-admission.html`

L'**en-tête d'école** (`.mpa-school`, nom de l'établissement, badge, programme,
date d'entrée, progression, conseillère) a disparu de la maquette. Confirmer par
le diff, puis retirer le bloc et ses clés i18n devenues orphelines, ainsi que
les tokens `--color-mpa-*` qui ne servent plus.

Cet écran a **trois onglets** : mesurer les trois, pas seulement le premier.
Les traits de liaison des étapes sont positionnés par script — vérifier qu'ils
sont corrects **dès le premier rendu**, sans redimensionnement.

## Attention

Les deux pages tirent leurs données de `useProjetData` / `useAdmissionData`.
Retirer un bloc visuel peut rendre des champs inutiles : les supprimer aussi, y
compris dans `app/core/contracts/`.
````

---

### Lot A2 — `reglages` et `reglages/theme`

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

## Page 1 — `app/pages/reglages/index.vue` ← `reglages.html`

La maquette a **retiré deux lignes** : « Email et téléphone » et « Sécurité ».
Les supprimer du tableau `sections`, avec leurs clés i18n et leurs icônes si
elles ne servent plus ailleurs.

⚠️ Piège déjà rencontré ici : `.rg-section:nth-of-type(n+3) .rg-row-title` teinte
en indigo à partir de la troisième `<section>`, **et `.rg-intro` en est une**.
Retirer des lignes ne change pas le compte des sections, mais revérifier les
couleurs de titre après coup.

## Page 2 — `app/pages/reglages/theme.vue` ← `reglages-theme.html`

Deux descriptions d'option ont été **réécrites** :
- « Un thème lumineux idéal pour une utilisation en journée. » → « Luminosité
  idéale pour une utilisation en journée »
- « Adapte automatiquement le thème selon les paramètres de votre appareil. » →
  « Adapte le thème selon les paramètres de l'appareil »

Mettre à jour `fr` **et** `en`.

## Hors périmètre

La maquette pilote désormais un **vrai thème sombre** (`theme-init.js`,
`theme.js`, `html[data-theme="dark"]`). **Ne pas l'implémenter** : c'est un
chantier distinct, décidé après la conformité en thème clair. Se limiter au
rendu clair.
````

---

### Lot A3 — les deux écrans de paiement réussi

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

Deux écrans de succès dont la maquette a été **fortement allégée** :
`paiement-reussi.html` (−69 lignes) et `langues-post-payment.html` (−139 lignes).

- `app/pages/paiement-reussi.vue` ← `paiement-reussi.html`
- `app/pages/langues/[slug]/paiement-reussi.vue` ← `langues-post-payment.html`

Commencer par lire les deux diffs :
`git diff f9ca05c~1 f9ca05c -- maquette/pwa/pages/paiement-reussi.html`

Ces écrans exigent une commande réelle pour s'afficher. Pour les mesurer, un jeu
d'essai derrière `import.meta.dev && route.query.demo === '1'` est toléré, **à
retirer avant de committer** (`grep -rn "query.demo" app/` doit être vide).

Ils ont été mesurés au pixel au Lot 5 : tout écart vient de l'évolution de la
maquette, pas d'une négligence initiale.
````

---

### Lot A4 — `orientation`

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

`app/pages/orientation.vue` est un écran construit par un agent précédent
**sans aucune mesure**. Deux écrans du même lot ont déjà été repris : ils
n'employaient **aucune classe de la maquette**, utilisaient des préfixes `sm:`
absents du gabarit mobile, et l'un affichait un contenu sans rapport avec sa
maquette. Présumer la même chose ici.

Première tâche : **identifier la maquette de référence**. Le nom de fichier ne
suffit pas — `logement/index.vue` prétendait porter `logement.html` tout en
affichant autre chose. Comparer les classes et le contenu réel.

Si l'écart est structurel, refaire la page plutôt que la rapiécer.
````

---

### Lot A5 — destination et liste d'écoles

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

Deux écrans du Lot 4 **jamais mesurés** :

- `app/pages/destinations/[slug]/index.vue` ← `domaines-etude.html`
- `app/pages/destinations/[slug]/ecoles/index.vue` ← `liste-ecole.html`

Vérifier d'abord la correspondance maquette ↔ page : ne pas se fier au nom.

## Deux corrections déjà faites, à ne pas défaire

`--dest-block-gap` vaut **22px** (déclaré une seule fois sur `.page-dest`) et
`.dest-card` a un `gap: 22px`. `DestinationCard` et `destinations/index` ont été
corrigés en ce sens. Si ces écrans partagent ces classes, ils en bénéficient
déjà.

`QPager` porte maintenant `padding: 15px 20px` et ses flèches font 30px. La liste
d'écoles l'utilise : vérifier qu'elle est toujours conforme après ce changement.

## Signalé, non corrigé

`destination-etude.html` n'a **plus** de sous-titre, `destinations/index` en
affiche encore un. Décision en attente du responsable — ne pas y toucher.
````

---

### Lot A6 — fiche école et offre

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

Deux écrans **jamais mesurés** :

- `app/pages/destinations/[slug]/ecoles/[school].vue` ← `ecole-detail.html`
- `app/pages/offres/[slug].vue` ← `formule.html`

Un écart de **18px sur la carte de palier à 380px** a déjà été repéré sur le
second sans être corrigé : c'est un point de départ, pas la liste complète.

Rappel : `formule.html` a des `@media` qui **s'appliquent à 375px**. Les lire
dans `app.css` avant toute correction.
````

---

### Lot A7 — page d'accueil

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

Rendre `app/pages/index.vue` conforme à `maquette/pwa/pages/home.html`.

Cette page **n'a jamais été conforme** — ce n'est pas une régression : aucune
des règles concernées n'a bougé lors de la resynchronisation de la maquette.
Un diagnostic chiffré a déjà été fait, reproduis-le pour le confirmer avant de
corriger, puis va au-delà : il n'est pas exhaustif.

## Ce qui est déjà mesuré

### Rythme vertical

La maquette déclare `--home-block-gap: 16px` et `--home-hero-cats-gap: 24px`.
`.home-main` n'a **pas** de `gap` : l'espacement vient des blocs.

| Bloc | Maquette | Application |
|---|---|---|
| `.home-banner-wrap` | `padding-top: 16px`, `margin-bottom: 24px` | `pt-30`, **aucune marge basse** |
| `.home-categories` | `padding-top: 0` | `pt-22` |
| `.home-section` (×2) | `padding-top: 16px` | `pt-32` |

Noter aussi `.home-section > :not(.home-section-title) { margin-top: 16px }` —
une règle d'enfant, facile à manquer.

Conséquence : la seconde section démarre à **746px au lieu de 674**.

### Cartes de catégorie

`.home-cat` fait **128px** de haut dans la maquette, **178,3px** dans
l'application, à largeur identique (76,8px).

| Élément | Maquette | Application |
|---|---|---|
| `.home-cat` | `padding: 2px` | `p-16` |
| `.home-cat-icon` | 40×40, `margin-bottom: 6px`, image 22×22 | 48×48, marge 9 |
| `.home-cat-label` | 11px/**13px**, `flex: 1 1 auto`, largeur 72,8 | 11px/13,75px, largeur **44,8** |
| `.home-cat-btn` | 28×28, `margin: 12px 0` | 32×32, `mt-auto` |

Le libellé trop étroit passe à **trois lignes au lieu de deux** : c'est l'écart
le plus visible à l'œil.

## Ce qui reste à ta charge

Le diagnostic ci-dessus couvre le rythme et les cartes. **Il ne couvre pas** :

- l'intérieur de la bannière (`.home-banner-*`) ;
- les deux sections et leur contenu — cartes d'articles, carte de progression ;
- la barre supérieure et la barre de navigation basse.

Mesure-les toi-même, avec la même rigueur.

## Attention particulière

**Contenu venant de l'API.** Les deux sections affichent des données réelles
(articles, catalogue). Une différence de hauteur peut donc venir d'un **texte
plus long**, pas d'une erreur de mise en page. Distingue les deux : un écart de
donnée se signale, il ne se corrige pas en tordant le CSS. En cas de doute,
compare les **retraits et marges calculés** plutôt que les hauteurs.

**Fichiers partagés.** `app/config/home-categories.ts` porte les quatre
raccourcis. Si tu touches à `AppTopBar`, `QIcon` ou un composant de
`app/design-system/`, **signale-le** : d'autres pages en dépendent.

**Ne pas régler `--home-block-gap` en dur.** Ces valeurs sont des tokens de la
maquette : ajoute-les à `@theme` dans `app/assets/css/main.css` si elles
manquent, avec un commentaire disant d'où elles viennent.

## Critère de fin

Un tableau comparant, pour chaque enfant de `.home-main` : position absolue,
hauteur, intervalle. Les trois colonnes doivent coïncider avec la maquette.
Puis zéro écart réel sur l'ensemble des classes `.home-*`.
````

---

### Lot A7 bis — accueil, les deux sections

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

Terminer la conformité de `app/pages/index.vue` ← `maquette/pwa/pages/home.html`.

Le lot A7 a corrigé le **rythme vertical** et les **cartes de catégorie** : les
cinq blocs de `.home-main` coïncident désormais exactement en position, hauteur
et intervalle. **N'y touche pas.**

Il n'a pas traité les **deux sections**, qui restent à ta charge.

## Méthode obligatoire ici

Cette page n'emploie **aucune** classe de la maquette. Comparer par nom de
classe ne rapporte que des « absent dans l'app » et **rate les sept écarts
ci-dessous**. Utilise le parcours d'arbre en parallèle décrit dans le brief
commun.

## Les sept écarts déjà mesurés

| Chemin | Maquette | Application |
|---|---|---|
| `home-news-card > home-news-arrow` (×2) | 16×16, `padding: 8px` | **30×30**, décalée de 14px à gauche, 7px en haut |
| `home-news-card > home-news-body` (×2) | largeur 166, `padding-right: 4px` | largeur **152** |
| `home-progress-card … home-progress-btn` | largeur 83,1 | 79,5 |
| `home-topbar > home-menu-btn > IMG` | 31 | 30 |
| `home-logo-frame > IMG` | 170,9×113,1, **rognée** par un cadre 145×45 en `overflow: hidden` | 145×45, cadre en `overflow: visible` |

Le cadre du logo fait bien 145×45 des deux côtés : c'est le **traitement de
l'image** qui diffère — cadrage resserré contre réduction. Tranche en faveur de
la maquette.

Cette liste est un point de départ vérifié, **pas un inventaire**. Descends dans
les deux sections jusqu'à ce que le parcours parallèle ne signale plus rien.

## Contenu venant de l'API

Les deux sections affichent des données réelles. Une différence de hauteur peut
venir d'un **texte plus long**, pas d'une erreur de mise en page. Distingue les
deux : un écart de donnée se signale, il ne se corrige pas en tordant le CSS.
Compare les retraits et marges calculés plutôt que les hauteurs quand tu doutes.

## Hors périmètre

`AppSideMenu.vue` et `side-menu.ts` ont été modifiés par A7 sans être dans son
lot. La correction est juste — la maquette pointe bien `reglages.html` — mais le
menu latéral **n'a jamais été mesuré**. Ne l'élargis pas ici : signale-le, il
fera son propre lot.
````

---

### Lot A8 — menu latéral (résultat)

Mesuré par le superviseur directement, sur `main`, sans agent dédié — décision
prise avec le responsable pour traiter le menu pendant que le contexte de
l'accueil (structure `.home-*`, technique de parcours parallèle) était frais.

**Résultat : conforme au pixel sans aucun correctif.** Panneau (306,3×1196,8 à
375px, `min(331px, 82,34%)`), en-tête (logo 125×39, fermeture 36×36), bloc
bienvenue (avatar 59×59), boutons, séparateurs, intertitres, cinq entrées
(4 « NOS SERVICES » + 1 « AUTRE ») et encart d'aide coïncident au pixel —
position, taille, couleur, rayon, `letter-spacing`. Deux faux positifs
écartés : la géométrie brute de l'`<img>` du logo (même cause que sur la barre
supérieure de l'accueil, invisible car clippée par un cadre identique des deux
côtés) et un `<br>` de maquette contre un retour à la ligne littéral +
`white-space: pre-line` côté app (même texte, même rendu).

Aucune modification de code n'a donc été nécessaire : la correction faite par
A7 (`overflow-hidden` du `DialogContent`, cible `/reglages`, `mt-18` de l'aide)
suffisait déjà à la conformité.

---

### Lot B1 — offres de logement (résultat)

Traité par le superviseur directement, sur `main`, sans agent dédié.
`logement/[slug]` (une page par pays, tranché avec le responsable) — un
carrousel de trois formules (Comoé/Volga/Yukon), même famille `.formule-*`
qu'`orientation/formules.vue`. `logement/index.vue` était un sélecteur de
destination sans navigation (`offres-logement.html` n'avait pas de route) :
ses cartes retombent maintenant de `div` en `NuxtLink`, sur le modèle de
`DestinationCard.vue`.

Bug mesuré côté maquette, reproduit tel quel : le bouton plein de Yukon n'a
pas de bordure (`.formule-card--yukon .formule-card-btn--solid` ne fixe que
`border-color`, jamais `-style`/`-width`, contrairement au palier « everest »
générique) — 1,6px d'écart de hauteur, propagé aux trois cartes par
l'étirement du carrousel (`align-items: stretch`).

---

### Lot B2 — tunnel orientation (résultat)

Traité par le superviseur directement, sur `main`, sans agent dédié. Conflit de
route surfacé au responsable avant de coder : `orientation-scolaire.html`
revendiquait le même créneau « Orientation » de la barre de navigation
qu'`orientation.vue` (lot A4). Réponse du responsable : le contenu
d'`orientation-scolaire.html` **remplace** celui d'`/orientation`, le slug ne
change pas.

`app/pages/orientation.vue` → `app/pages/orientation/index.vue` (conflit de
routage Nuxt fichier-plat / dossier avec `orientation/formules.vue`).
`orientation/formules.vue` créé d'après `orientation-formules.html` — accent de
chaque palier codé en dur par nom (Jordan/Tyson/Pelé), pas par rang, comme la
maquette.

---

### Lot B3 — écrans de succès manquants (résultat)

Traité par le superviseur directement, sur `main`, sans agent dédié.

- `orientation/paiement-reussi` ← `orientation-post-paiement.html`, sur le
  modèle de `langues/[slug]/paiement-reussi.vue` (quatre étapes au lieu de
  cinq, bloc d'assistance qui bascule en colonne dès 400px — un vrai écart
  entre les deux tunnels, pas une coquille).
- `logement/paiement-reussi` ← `logement-post-paiement.html`. Malgré son nom,
  **pas** un écran de confirmation : c'est le tableau de bord envoyé par
  e-mail après l'achat, où le client complète ses préférences de logement —
  confirmé par le responsable après une question de cadrage. Coexiste avec
  `mon-projet/logement.vue` (même sujet, chronologie différente). Aucun
  endpoint pour les offres/préférences (Chantier C) : données d'essai dans
  `app/config/logement-offers.ts`. Bug réel de la maquette (CSS `.lp-panel`
  qui l'emporte sur l'attribut `hidden`, les deux onglets restent visibles) —
  **non reproduit**, casserait une fonctionnalité pour une fidélité purement
  cosmétique.

---

### Lot B4 — aperçu du projet

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

`mon-projet-apercu.html` est une maquette **distincte** de `mon-projet.html` :
classes `.projet-*`, blocs aperçu, statistiques et prochain rendez-vous. Elle
n'a pas de route.

Une implémentation existe dans l'historique : `app/pages/mon-projet.vue` **avant
le commit `ef4f94e`**. Elle avait été mesurée au pixel, puis remplacée quand on
a découvert que `/mon-projet` devait porter `mon-projet.html`. La récupérer
plutôt que repartir de zéro :

```bash
git show ef4f94e~1:app/pages/mon-projet.vue
```

Route déjà cadrée avec le responsable : `mon-projet/apercu`. Remesurer avant de
coder : la maquette a changé depuis.
````

---

### Lot C — gabarit commun pour la mise sous données

````markdown
[COLLER ICI LE BRIEF COMMUN § 1]

# Ta mission

Brancher **[ÉCRAN]** sur l'API à la place de ses données d'essai
(**[FICHIER]**).

## Première tâche, avant tout code

Vérifier qu'un endpoint expose réellement ces données. `ARCHITECTURE-API.md`
décrit l'API et ses défauts connus. Si rien ne l'expose :

**s'arrêter et le dire.** Ne pas inventer de contrat, ne pas simuler un
endpoint. Un écran sous données d'essai qui l'assume vaut mieux qu'un écran
branché sur une API imaginaire.

## Si l'endpoint existe

Respecter la couche anti-corruption : `repository` → `adapter` → `contract`, et
**aucun `$fetch` hors de `app/core/http/`**. Reprendre le motif d'un repository
existant (`app/core/repositories/`).

- Les contrats vivent dans `app/core/contracts/` ; ceux des données d'essai
  existent déjà et servent de point de départ.
- Les adapters normalisent ce que l'API renvoie de travers — lire la § 5 de
  `ARCHITECTURE-API.md` avant d'écrire le premier.
- Ajouter des tests d'adapter : `tests/*.adapter.spec.ts` en donne le motif.

## Ne pas casser le rendu

Ces écrans sont conformes **au pixel**. Après branchement, remesurer : des
données réelles plus longues ou plus courtes que celles de la maquette peuvent
changer des hauteurs. Si c'est le cas, le signaler — c'est une différence de
**donnée**, pas de mise en page, et elle ne se corrige pas en tordant le CSS.
````

---

## 4. Prompt de l'agent superviseur

````markdown
# Ton rôle

Tu vérifies et intègres le travail de plusieurs agents, chacun sur une ou deux
pages. Tu ne codes pas à leur place : tu contrôles, tu signales, tu fusionnes.

Dépôt : `C:\laragon\www\qiryna-front`. Lire `REPRISE.md`, `DESIGN-SYSTEM.md`,
`ARCHITECTURE-API.md`, et le brief commun du § 1 de `PROMPTS-AGENTS.md`.

# Ce que tu ne prends jamais pour argent comptant

Un agent qui déclare « conforme » ou « corrigé » a pu se tromper de méthode.
**Refaire la mesure toi-même**, sur la branche de l'agent, avant d'intégrer.

Trois erreurs de vérification déjà observées, à traquer :

1. **Vérifier sur la réponse HTTP au lieu du navigateur.** Un `curl` montre le
   rendu serveur, pas ce que voit l'utilisateur après hydratation. Un défaut i18n
   majeur est passé pour corrigé de cette façon. Toujours charger la page dans un
   navigateur, **attendre 3 secondes**, puis vérifier que
   `document.body.innerText.match(/\b[a-z][a-zA-Z]+\.[a-zA-Z]{3,}/g)` est vide.
2. **Mesurer sans avoir régénéré la feuille Tailwind.** Les classes nouvellement
   ajoutées manquent, et l'agent « corrige » des écarts qui n'existent pas.
   Redémarrer le serveur avant de mesurer.
3. **Se tromper de serveur.** Un serveur de dev peut occuper le port de la
   production. Signature : `/_nuxt/@fs/…` et `@nuxt/devtools` dans le réseau.

# Ta checklist, pour chaque lot rendu

```bash
npm run typecheck 2>&1 | grep -E "error TS" | grep -v nuxt.config   # vide
npm test                                                            # vert
grep -rn "MESURE-TEMP\|query.demo" app/                             # vide
npx vitest run tests/i18n-locales.spec.ts                           # vert
```

Puis, page par page :

- remesurer à 375px contre la maquette, faux positifs exclus ;
- vérifier que **tout lien mène à un écran réel** — un `<component :is>` mal
  construit rend un élément sans `href`, et la mesure au pixel ne le voit pas ;
- vérifier qu'aucune valeur de couleur, d'espacement ou de police n'est écrite en
  dur dans le gabarit ;
- vérifier la parité et le tri des locales, et l'absence de HTML dedans.

# Intégration

Une branche par lot, jamais de commit direct sur `main`, jamais de push sans feu
vert explicite du responsable. Fusionner en `--no-ff` avec un message qui dit ce
que le lot apporte.

Quand deux lots touchent un fichier partagé (`main.css`, `DestinationCard`,
`QPager`, `AppTopBar`), c'est **toi** qui arbitres : une correction de composant
partagé profite à toutes les pages, mais peut en casser une autre. Remesurer les
pages voisines après ce genre de fusion.

# Ce que tu remontes au responsable

- les lots conformes, avec la mesure qui le prouve ;
- les écarts qu'un agent n'a pas pu résorber, et pourquoi ;
- **les questions de cadrage laissées en suspens** (routes non tranchées,
  endpoints inexistants) — sans les trancher toi-même ;
- toute divergence entre deux agents sur un même parcours.
````

---

## 5. Règles de coordination

**Une branche par lot**, nommée d'après lui (`lot-a1-mon-projet`,
`lot-c4-messages`…). Jamais de commit sur `main` : le superviseur fusionne.

**Fichiers partagés à surveiller.** `app/assets/css/main.css` sera touché par
presque tous les lots (ajout de tokens) : conflits probables, mais faciles à
résoudre puisqu'ils s'ajoutent. En revanche `DestinationCard`, `QPager`,
`AppTopBar`, `PageState` sont **partagés** — un agent qui les modifie doit le
signaler au superviseur, qui remesure les pages voisines.

**Ne pas cadrer à la place du responsable.** Les routes non tranchées (lots B1,
B2, B4) et les endpoints manquants (lots C) remontent en question, pas en
décision unilatérale.

**Ordre conseillé.** Les lots A1 à A3 d'abord — ils réparent des pages livrées
que la resynchronisation a rendues non conformes, donc du travail visible tout
de suite. Les lots C ne démarrent que si l'endpoint existe.
