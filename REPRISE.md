# Reprise — état du projet et prochaines étapes

> Document de passation entre sessions. À lire **en premier** au démarrage d'une
> nouvelle session Claude Code. Complète — ne remplace pas — `LOT-5.md`,
> `DESIGN-SYSTEM.md`, `ARCHITECTURE-API.md`, `DEPLOIEMENT.md`.

Dernière mise à jour : après `mon-projet` (4 écrans), `logement`,
`reglages` (5 écrans) et `messages`, tous mesurés au pixel.

---

## 0. Démarrage immédiat

```bash
npm run dev          # http://localhost:3000
npm test             # 193 tests, ~1,5 s
npm run typecheck    # 0 erreur hors nuxt.config (voir § 5)
npm run maquette:sync   # met la maquette de référence à jour depuis GitHub
```

Le dépôt est **local, sans distant** (`git remote` vide). Historique propre,
une branche par chantier, fusion dans `main` après validation. **Ne rien
pousser sans feu vert** du responsable.

---

## 1. Où en est le produit

**Lot 5 (auth + paiement) livré et mesuré au pixel** : connexion, inscription,
mot de passe oublié, les deux écrans de paiement réussi (langues + domaines),
`mon-projet` (aperçu). Session `httpOnly`, intention de paiement, gardes de
route. Détail dans `LOT-5.md`.

**Apports Antigravity intégrés puis assainis** : `logement/index`,
`reglages/index`, `orientation`, `sitemap.xml`, `schema.org`. La dette qu'ils
portaient (16 erreurs de typecheck, i18n dé-trié, source d'icônes double) est
résorbée.

**Correction d'infra majeure** : les icônes sont servies sous **`/img/icons/`**,
jamais `/icons/` — ce dernier est un **alias Apache système réservé**
(`Alias /icons/ /usr/share/apache2/icons/`) qui détourne la requête en
production. Voir `QIcon.vue` et `DEPLOIEMENT.md` § g bis. Ne pas revenir en
arrière.

---

## 2. Le travail décidé : **B puis A**

### B — Produire les sous-pages manquantes

| Maquette | Route | État |
|---|---|---|
| `mon-projet.html` | `mon-projet/index` | ✅ mesuré |
| `mon-projet-admission.html` | `mon-projet/admission` | ✅ mesuré, 3 onglets |
| `mon-projet-logement.html` | `mon-projet/logement` | ✅ mesuré, 2 onglets |
| `mon-projet-orientation.html` | `mon-projet/orientation` | ✅ mesuré |
| `logement.html` | `logement/index` | ✅ refait et mesuré |
| `reglages.html` | `reglages/index` | ✅ refait et mesuré |
| `reglages-langues/mdp/theme/mentions.html` | `reglages/{langues,mot-de-passe,theme,mentions}` | ✅ mesurés |
| `messages.html` | `messages.vue` | ✅ mesuré, 2 onglets |
| **`offres-logement.html`** | route à cadrer (`logement/[slug]` ?) | ❌ **prochain chantier** |
| `orientation-scolaire.html`, `orientation-formules.html` | à cadrer | ❌ |
| `orientation-post-paiement.html` | `orientation/paiement-reussi` | ❌ |
| `logement-post-paiement.html` | `logement/paiement-reussi` | ❌ |
| `mon-projet-apercu.html` | route à cadrer — **maquette distincte** | ❌ |

`mon-projet-apercu.html` (classes `.projet-*`, blocs aperçu / statistiques /
RDV) n'est **pas** `mon-projet.html`. L'ancienne implémentation reste dans
l'historique, sur `app/pages/mon-projet.vue` avant le commit `ef4f94e`.

Le responsable a indiqué qu'il repasserait sur **les URL et la précision de
chaque parcours** : les entrées sans écran restent des `div`, jamais des liens
morts, comme le `#` des maquettes.

### A — Mesurer les pages Antigravity déjà là

`logement/index` et `reglages/index` sont faits. **Restent** : `orientation.vue`,
et les écrans du Lot 4 jamais mesurés — `destinations/[slug]`, `.../ecoles`, la
fiche école, `/offres/[slug]` (18px d'écart déjà repéré sur la carte de palier
à 380px).

Ce qu'a donné la mesure de ces deux pages, à titre d'ordre de grandeur : elles
n'employaient **aucune** classe de la maquette, des préfixes `sm:` absents du
gabarit mobile, et `logement/index` affichait un contenu sans rapport avec sa
maquette. Présumer la même chose des suivantes.

⚠️ `destination-etude.html` n'a **plus** de sous-titre, `destinations/index` en
affiche encore un. Signalé, non corrigé : c'est du contenu visible.

---

## 3. La méthode de mesure (indispensable, la seule qui marche)

Une reconstruction « à partir des valeurs CSS » a déjà été rejetée. On mesure
le DOM des deux versions côte à côte.

1. `npm run dev`. La maquette est servie sur la même origine :
   `http://localhost:3000/_maquette/pages/<page>.html`.
2. Cookie `qiryna_locale=fr` **avant** de comparer (sinon on compare une
   maquette FR à une page EN).
3. Dans le navigateur intégré, injecter le harnais : deux `<iframe>` de 375px,
   `getBoundingClientRect()` + `getComputedStyle()` élément par élément.
4. **Viewport de référence : 375px.** Le piège récurrent est le
   `@media (max-width: 390px)` (et 360/380/400) : il s'applique **à 375px**,
   donc au cas nominal. Antigravity construit systématiquement la version
   > 390px et oublie ces règles. **Toujours lire les média queries de la page
   dans `app.css` avant de coder.**
5. Faux positifs à ignorer : `rounded-full` mesuré `2.68e7px` vs `9999px` ;
   `font-size: 13.33px` et `color: rgb(0,0,0)` sur un `<button>` UA ;
   `box-shadow` composé par Tailwind (la liste se termine par la bonne ombre,
   le reste est transparent) ; différences de longueur de texte dues aux
   données réelles.

### Cinq artefacts d'environnement qui font perdre des heures

- **Régénérer la feuille Tailwind avant de mesurer.** Après ajout d'un token
  ou d'une classe inédite, le serveur de dev ne les intègre pas tout de suite :
  on mesure alors des « écarts » qui n'existent pas. Redémarrer le serveur.
- **Service worker de la maquette** (scope `/_maquette/`) : il sert des copies
  périmées de `app.css` et des pages. Le désenregistrer et vider `caches`
  **à chaque** chargement d'iframe — il se réenregistre tout seul.
- **Barre de défilement.** Une iframe de 375px donne un `clientWidth` de 360 —
  soit le seuil de `@media (max-width: 360px)`. Compenser la largeur. Et
  plusieurs maquettes posent `scrollbar-gutter: stable` ou font défiler un
  conteneur interne : 15px de moins, inexistants sur mobile où les barres se
  superposent. Neutraliser avant de conclure.
- **Transitions figées.** Le panneau navigateur ne compose pas d'images : une
  `transition` reste bloquée sur sa valeur de départ et les états actifs
  paraissent inversés. Injecter `transition: none !important` des deux côtés.
- **Vérifier quel serveur répond.** Un serveur de dev peut se rabattre sur le
  port prévu pour la production. Signature d'un serveur de dev : des URL
  `/_nuxt/@fs/…` et `@nuxt/devtools` dans le réseau.

### Trois pièges de cascade, invisibles à la lecture

- Une règle peut être **inerte** : `.mpl-step:first-child` ne s'applique jamais,
  le premier enfant étant un conteneur de traits. Reproduire l'**effet** mesuré,
  pas l'intention lue.
- Un sélecteur positionnel compte ce qu'on ne croit pas :
  `.rg-section:nth-of-type(n+3)` inclut `.rg-intro`, qui est aussi une
  `<section>`.
- Une classe peut battre un attribut : `.rm-match { display: block }` l'emporte
  sur `hidden`, et la ligne « masquée » occupe bel et bien sa marge.

### Utilitaires Tailwind qui ne font pas ce qu'on croit

- `m-0 mb-12` : à spécificité égale, `m-0` gagne. Écrire `mt-0 mb-12`.
- `text-base leading-12` : `text-base` impose sa paire d'interligne. Forcer
  avec `leading-[12px]`.
- `rounded-2xl` vaut **12px** dans ce thème, pas 16.
- Deux utilitaires de **même famille** se départagent par l'ordre de la
  feuille, pas par l'ordre d'écriture : `size-30` perd contre le `size-32`
  d'un composant. Une valeur arbitraire (`size-[30px]`) tranche.
- Le preflight supprime le `padding: 1px` que le navigateur applique aux
  `input` : 2px de moins sur un champ de recherche.
- Une graisse non déclarée dans `@theme` ne produit rien (`font-extrabold`
  était muet avant l'ajout de `--font-weight-extrabold`).
- `<component :is>` : importer `NuxtLink` depuis `#components`.
  `resolveComponent('NuxtLink')` rend un élément inconnu `<nuxtlink>`, sans
  `href` ni clic — et la mesure au pixel ne le voit pas.

Pour mesurer un écran **protégé par `auth`** : commenter temporairement
`definePageMeta({ middleware: 'auth' })` (marqueur `// MESURE-TEMP`), mesurer,
**restaurer avant de committer**. Idem pour les écrans qui exigent une commande
réelle : jeu d'essai `DEMO` derrière `import.meta.dev && route.query.demo==='1'`,
retiré ensuite. Vérifier `grep -rn "MESURE-TEMP\|DEMO\|query.demo" app/` = vide
avant tout commit.

---

## 4. Règles permanentes (rappel condensé)

- **Aucune valeur en dur** (couleur, espacement, rayon, police) : tout via les
  tokens de `app/assets/css/main.css` `@theme`. Si une valeur manque, l'ajouter
  au thème avec un commentaire sur son origine.
- **Aucune chaîne visible en dur** : i18n fr **et** en, clés triées
  alphabétiquement, parité vérifiée. `mon-projet` en avait 11 (piège
  Antigravity : il traduit les libellés de statut mais oublie le contenu).
- **Aucune balise HTML dans un message i18n.** Le plugin rejette alors le
  **fichier de locale entier** : le client démarre sans aucun namespace et
  toutes les pages affichent leurs clés brutes après hydratation, le rendu
  serveur restant correct. Une coupure de ligne ou un fragment en gras se
  traitent au gabarit, avec des clés séparées.
  `tests/i18n-locales.spec.ts` le vérifie, avec la parité et le tri.
- **Aucun `$fetch` hors de `app/core/http/`.**
- **Icônes → `/img/icons/`** via `QIcon`, jamais `/icons/`.
- **Quatre états par vue** : chargement (squelettes), vide, erreur, nominal
  (`PageState`).
- Écrans de compte (`mon-projet`, `compte`, `messages`, paiement réussi) :
  `definePageMeta({ middleware: 'auth' })`.
- Fond de shell teinté : `definePageMeta({ shellBackground: 'tint' })`.

Vérifs i18n avant commit :
```bash
node -e "const fr=require('./i18n/locales/fr.json'),en=require('./i18n/locales/en.json');const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?flat(v,p+k+'.'):[p+k]);const a=flat(fr).sort(),b=flat(en).sort();console.log('ecarts',a.filter(k=>!b.includes(k)).concat(b.filter(k=>!a.includes(k))).length);const s=o=>{const k=Object.keys(o);return JSON.stringify(k)===JSON.stringify([...k].sort())&&Object.values(o).every(v=>typeof v!=='object'||v===null||s(v))};console.log('tri',s(fr)&&s(en))"
```

---

## 5. Dette connue, non bloquante

- **`nuxt.config.ts`** produit ~7 erreurs de typecheck (`process`, `lazy`,
  `@types/node`) — **pré-existantes**, sans effet sur le build. Filtrer avec
  `grep -v nuxt.config`. Ne pas s'en préoccuper sans décision dédiée.
- **Valeurs exactes hors échelle** (tokens `--text-exact-*`, `--radius-exact-7`)
  : la fidélité au pixel a rendu mesurables des normalisations du Lot 1. Réflexe
  : si une taille/rayon de la maquette diffère de 0,5–2px du token le plus
  proche, créer un token `*-exact-*` plutôt que d'arrondir.
- **Clé Stripe `pk_live_…` en recette** : à remonter avant tout branchement du
  paiement (`GET /all-data → settings.site.stripe_pk_api_key`).
- **Slugs traduits par l'API** (`/destinations/chine` ↔ `/en/destinations/china`)
  : un changement de langue depuis une page de détail tombe sur un 404. Table de
  correspondance à prévoir (Lot 6).
- **`legacy/`** (67 Mo) est **gitignoré** : référence à porter, jamais éditée,
  reste sur disque.

---

## 6. Déploiement (Plesk, qiryna.lewebartisan.com)

Tout est dans `DEPLOIEMENT.md`. Les points qui ont coûté du temps :
- HTTPS obligatoire (sinon le cookie de session est refusé).
- L'IP du VPS **est** autorisée par le back-office (`/api/bff/catalog` → 200).
- Icônes en 404 = alias Apache `/icons/` réservé → servir sous `/img/icons/`
  (déjà fait dans le code) **ou** droit de lecture nginx (§ g bis).
- Ne jamais copier `node_modules`/`.output` depuis Windows (`sharp` recompile).

---

## 7. Commandes de fin de chantier

```bash
npm run typecheck 2>&1 | grep -E "error TS" | grep -v nuxt.config   # doit être vide
npm test                                                            # 193 verts
grep -rn "MESURE-TEMP\|query.demo" app/                             # doit être vide
git checkout -b <chantier> && git add -A && git commit              # jamais sur main directement
```
