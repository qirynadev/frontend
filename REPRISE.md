# Reprise — état du projet et prochaines étapes

> Document de passation entre sessions. À lire **en premier** au démarrage d'une
> nouvelle session Claude Code. Complète — ne remplace pas — `LOT-5.md`,
> `DESIGN-SYSTEM.md`, `ARCHITECTURE-API.md`, `DEPLOIEMENT.md`.

Dernière mise à jour : après la mesure au pixel de `mon-projet` (aperçu).

---

## 0. Démarrage immédiat

```bash
npm run dev          # http://localhost:3000
npm test             # 186 tests, ~1,3 s
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

### B — Produire les sous-pages manquantes (priorité)

La maquette « mon projet », « orientation », « logement » et « réglages » ont
éclaté en tunnels complets. Ces écrans **n'existent pas** encore dans l'app :

| Maquette | Route à créer | Notes |
|---|---|---|
| `mon-projet-admission.html` | `mon-projet/admission` (ou onglet) | **onglets** (3), le plus gros |
| `mon-projet-logement.html` | `mon-projet/logement` | onglets (2) |
| `mon-projet-orientation.html` | `mon-projet/orientation` | — |
| `orientation-scolaire.html` | à cadrer | — |
| `orientation-formules.html` | à cadrer | — |
| `orientation-post-paiement.html` | `orientation/paiement-reussi` | un écran de succès par tunnel (cf. LOT-5 § 7 quinquies) |
| `logement.html`, `offres-logement.html` | à mesurer vs `logement/index` existant | — |
| `logement-post-paiement.html` | `logement/paiement-reussi` | — |
| `reglages-langues/mdp/theme/mentions.html` | sous-pages de `reglages/` | — |
| `messages.html` | `messages.vue` (placeholder aujourd'hui) | — |

⚠️ **Cadrer les routes avec le responsable avant de coder** : onglets d'une
même page vs pages séparées, ce n'est pas tranché. `mon-projet.vue` est
aujourd'hui l'aperçu ; les 3 détails sont des drill-downs.

### A — Mesurer les pages Antigravity déjà là

Après B, repasser au pixel les écrans qu'Antigravity a construits sans mesure :
`logement/index.vue`, `reglages/index.vue`, `orientation.vue`. La mesure de
`mon-projet` (aperçu) a montré 5 écarts réels sur une page qui « semblait
finie » — **présumer que les autres en ont aussi**.

Écrans du Lot 4 jamais mesurés au pixel, également suspects :
`destinations/[slug]`, `.../ecoles`, la fiche école, `/offres/[slug]`
(18px d'écart déjà repéré sur la carte de palier à 380px).

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
   `font-size: 13.33px` sur un `<button>` UA ; différences de longueur de
   texte dues aux données réelles.

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
npm test                                                            # 186 verts
grep -rn "MESURE-TEMP\|query.demo" app/                             # doit être vide
git checkout -b <chantier> && git add -A && git commit              # jamais sur main directement
```
