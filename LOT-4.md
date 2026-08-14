# Lot 4 — Tunnel public

> Les huit écrans que voient les prospects et les moteurs de recherche.

---

## 1. Les huit pages

| # | Page | Maquette | Source de données | État |
|---|---|---|---|---|
| 1 | [`index.vue`](app/pages/index.vue) | `home.html` | `/all-data` + `/articles` | ✅ |
| 2 | [`destinations/index.vue`](app/pages/destinations/index.vue) | `destination-etude.html` | `/all-data → schoolSheets` | ✅ |
| 3 | [`destinations/[slug]/index.vue`](app/pages/destinations/%5Bslug%5D/index.vue) | `domaines-etude.html` | `schoolSheets` + `offers` | ✅ ¹ |
| 4 | [`destinations/[slug]/ecoles/index.vue`](app/pages/destinations/%5Bslug%5D/ecoles/index.vue) | `liste-ecole.html` | `schoolSheets[].schools` | ⚠️ ² |
| 5 | [`.../ecoles/[school].vue`](app/pages/destinations/%5Bslug%5D/ecoles/%5Bschool%5D.vue) | `ecole-detail.html` | idem, fiche complète | ✅ |
| 6 | [`offres/[slug].vue`](app/pages/offres/%5Bslug%5D.vue) | `formule.html` | `courses[].formulas` **et** `offers[]` | ✅ |
| 7 | [`orientation.vue`](app/pages/orientation.vue) | `offre-orientation.html` | `/profilage` | ✅ ³ |
| 8 | [`langues/index.vue`](app/pages/langues/index.vue) | `langue-apprentissage.html` | `/courses` | ✅ |

¹ chiffres du bandeau · ² filtre par domaine · ³ prix — détail au § 4.

> **Une correction de chemin.** Le brief demandait `destinations/[slug].vue`. Avec un
> dossier `[slug]/` voisin, Nuxt en fait une **route parente** : `/destinations/france/ecoles`
> rendait alors la fiche destination, pas la liste d'écoles (constaté, puis corrigé).
> Le fichier est donc `destinations/[slug]/index.vue` — même URL, comportement attendu.

---

## 2. Ce qui a été ajouté à la couche du Lot 2

Trois endpoints supplémentaires, découverts en sondant l'API :

| Endpoint | Contenu | Sans lui |
|---|---|---|
| **`GET /courses`** | 4 langues, leurs niveaux **et leurs 3 paliers tarifaires** | ni page langues, ni `formule.html` |
| **`GET /profilage`** | l'offre d'orientation et ses 4 « catégories » | pas de page orientation |
| **`GET /articles`** | actualités — **répond `[]`** en recette | pas d'actualités sur l'accueil |

Ils sont chargés en parallèle de `/all-data`, chacun avec son propre `catch` : une panne
sur l'un d'eux ne fait pas tomber le site.

### La convergence des deux formes tarifaires

`formule.html` montre un carrousel de trois paliers. L'API expose la même intention
commerciale sous **deux structures incompatibles** :

| Source | Forme | Exemple |
|---|---|---|
| `courses[].formulas` | 3 paliers mensuels | Kilimandjaro 200 € · Aconcagua 300 € · Everest 400 € |
| `offers[]` | 1 paiement unique | Ingénierie 490 € |

`toLanguageOfferPage` et `toDomainOfferPage` les ramènent au même contrat `OfferPage`.
La page `offres/[slug].vue` n'a donc **qu'un cas à traiter** — et affiche un carrousel
au-delà d'un palier, une carte simple en dessous.

Au passage : l'API renvoie les paliers dans l'ordre **200, 400, 300**. Sans tri, le plus
cher se retrouvait au milieu. `orderTiers` trie par prix croissant et met le dernier en
avant.

---

## 3. Les quatre états, sur chaque page

La maquette ne montre que le nominal. Les trois autres passent par
[`PageState`](app/components/common/PageState.vue), écrit une fois :

| État | Traitement |
|---|---|
| **Chargement** | squelettes calés sur la silhouette réelle du contenu — jamais de spinner plein écran |
| **Vide** | `QEmptyState` avec un message propre à la page, et une action quand elle a du sens (« Effacer la recherche ») |
| **Erreur** | `QAlert` + bouton « Réessayer ». Le message est **traduit selon `ApiError.kind`**, jamais le message brut de l'API : celui-ci est technique, souvent anglais, et parfois révélateur |
| **Nominal** | le contenu |

Une ressource inexistante (`/destinations/atlantide`) lève un vrai **404** : elle ne doit
pas être indexée. Vérifié sur les trois routes à slug.

---

## 4. Écarts avec la maquette — et pourquoi

Chacun est un cas où la maquette montre une donnée que **l'API ne possède pas**. Le
choix a été systématiquement : afficher le réel, ou ne rien afficher. Jamais inventer.

| Maquette | API | Décision |
|---|---|---|
| Accueil : progression « 60 % » | valeur propre à un compte connecté | Le bloc devient une invitation à démarrer l'orientation. La version personnalisée arrive avec la session (Lot 5). |
| Accueil : 2 articles | `/articles` → `[]` | État vide soigné. C'est le cas **nominal** aujourd'hui. |
| Destinations : « 350+ logements » | aucun décompte de logements | Nombre d'écoles, qui est réel. |
| Fiche destination : « 350+ universités », « 430 000+ étudiants », « 3ᵉ destination », « 8 prix Nobel » | **rien** — pas même un champ vide | Un seul chiffre affiché : le nombre d'écoles. Quatre valeurs sourcées Campus France / UNESCO n'ont pas à être figées dans du code front. |
| Domaines : « 20+ écoles » par domaine | aucun lien école ↔ domaine | Le prix de l'accompagnement, qui est réel. |
| **Liste d'écoles : puces de filtre par domaine** | **`/areas-of-studies/{id}` répond 500** | **Non livré.** Voir § 5. |
| Langues : 8 langues, étiquettes « La plus demandée » | 4 langues, `badge` à `null` partout | Les 4 langues réelles ; le nombre de niveaux à la place de l'étiquette. Le `badge` s'affichera seul le jour où il sera renseigné. |
| Orientation : **« 899 € — paiement unique »** | **aucun prix** | Bloc tarifaire masqué, remplacé par « Tarif communiqué par nos conseillers ». Un montant commercial est la dernière chose à coder en dur. |

---

## 5. Ce qui est bloqué, et pourquoi

**Le filtre par domaine d'étude de `liste-ecole.html` n'est pas livré.**

```
GET /areas-of-studies                → 404
GET /areas-of-studies/{destination}  → 500
```

Et aucune des 570 écoles de `/all-data` ne porte de champ de domaine. Le rattachement
école ↔ domaine n'existe donc **nulle part** aujourd'hui.

Livrer des puces qui ne filtrent rien aurait été pire que de ne pas les livrer. À la
place, la page offre une **recherche par nom ou par ville** — réelle, exécutée côté
serveur, paginée, et reflétée dans l'URL (un résultat se partage et se recharge).

Le retour des puces ne demandera pas de réécriture : `schoolRepo.list()` accepte déjà un
critère, et le BFF filtre déjà côté serveur.

---

## 6. Robustesse face au contenu de recette

Les pièges annoncés dans le brief, et où ils sont traités :

| Piège | Traitement | Vérifié |
|---|---|---|
| `presentation` en lorem ipsum | affiché tel quel — c'est du contenu, pas une erreur | — |
| `formations` / `details` = `[{title: null}]` | **écartés par l'adapter**, puis l'onglet correspondant n'est pas rendu | 428 écoles sur 570 n'ont que ça |
| Deux écoles `universite-lille` | arbitrage déterministe (premier `id` croissant) fait par le BFF : la fiche ouverte est bien celle de la liste | `/destinations/france/ecoles/universite-lille` → 200 |
| `founded_year` / `student_count` `null` | le bloc « chiffres clés » n'est rendu que si au moins un existe | `null` sur les 570 |
| IMD (Lausanne) rattachée à la France | la fiche affiche **la ville et le pays de l'école**, jamais ceux de la destination parcourue | — |
| École sans titre ni slug | écartée à l'adaptation | 1 cas dans le catalogue |

Aucun accès à une donnée n'est fait en supposant qu'elle existe : les adapters
normalisent, les pages testent avant d'afficher.

---

## 7. Deux corrections de fond apportées au passage

### 7.1 Le site anglais servait du contenu français

Le BFF lit la langue dans l'en-tête `lang`, mais `bffFetch` ne l'envoyait pas : toutes
les pages, y compris `/en/**`, recevaient du français. Or **l'API traduit réellement** :

```
lang: fr → « L'avantage d'un bon profilage »
lang: en → « The advantage of good profiling »
```

La langue est désormais **transmise explicitement** à chaque appel (`bffFetch(…, { locale })`),
et chaque page la surveille pour recharger son contenu au changement de langue.

> Le passage par une variable de module aurait été plus court — et faux : au rendu
> serveur, cet état serait partagé entre requêtes concurrentes, et un visiteur
> anglophone pourrait recevoir la page d'un francophone. La langue est une entrée de
> requête : elle se passe en paramètre.

Vérifié : `/en/orientation` → « The advantage of good profiling ».

### 7.2 Le HTML du back-office finissait dans un `v-html` sans filtre

Sept champs (`presentation`, `description`, `content`, descriptions de formations…)
viennent d'un éditeur riche et sont injectés en HTML. Une injection en base, un compte
d'administration compromis ou un import mal contrôlé auraient suffi à exécuter du script
chez chaque visiteur.

[`core/adapters/sanitize.ts`](app/core/adapters/sanitize.ts) applique une **liste
blanche** — balises, attributs, schémas d'URL — appliquée dans les adapters, donc une
fois, sans qu'aucune page ait à y penser. **21 tests** : `<script>`, `<iframe>`,
`onclick`, `javascript:`, `data:`, classes arbitraires, balises inconnues, balisage mal
fermé.

Les liens externes reçoivent `rel="noopener noreferrer"`.

---

## 8. Vérifications

```bash
npm test        # 151 tests, 9 fichiers, 1,3 s
npm run build   # ✅
```

Typecheck application **et** serveur : 0 erreur.

Dans le navigateur, **18 vues** (9 pages × 2 langues), viewport 375 px :

| Contrôle | Résultat |
|---|---|
| Statut HTTP | 200 sur les 18 |
| Débordement horizontal | **aucun** |
| Texte tronqué par sa boîte | **aucun** — la contrainte FR/EN tient |
| Un seul `<h1>` par page | ✅ |
| `alt` sur toutes les images | ✅ |
| Titres SEO localisés | `Écoles en France` / `Schools in France` |

Comportements vérifiés à la main : recherche (`?q=lyon` → résultats, `?q=zzzznope` → état
vide), pagination (`?page=3`), 404 sur slug inconnu (3 routes), navigation client sans
rechargement.

### Un point de vigilance pour le Lot 6

**Les slugs sont traduits par l'API** :

| Français | Anglais |
|---|---|
| `/destinations/chine` | `/en/destinations/china` |
| `/offres/anglais` | `/en/offres/english` |

Les liens internes sont générés depuis les données localisées : la navigation est
correcte **dans** une langue. Mais un basculement de langue depuis une page de détail
tomberait sur un 404. Le sélecteur de langue aura besoin d'une table de correspondance
de slugs — à traiter avec les alternates et le sitemap du Lot 6.

---

## 9. Composants ajoutés

Aucun n'introduit de style : tous composent les primitives du Lot 1.

| Composant | Rôle |
|---|---|
| `PageState` | les quatre états, une fois pour toutes |
| `RichText` | HTML éditorial (déjà assaini) + typographie de la maquette |
| `AppTopBar` | retour · logo · cloche — absorbe les 12 `*-topbar` |
| `AppLogo` | logotype **SVG inline** — voir ci-dessous |
| `TrustStrip` | bandeau de réassurance, contenu éditorial traduit |
| `DestinationCard`, `SchoolCard`, `DomainCard`, `LanguageCard`, `OfferTierCard`, `HomeCategoryCard`, `ArticleCard` | cartes métier |

**Le logo est un logotype typographique reconstruit.** La maquette ne fournit que
`logo.png`, **1,93 Mo** — que la règle images interdit d'embarquer. Le fichier vectoriel
d'origine est à demander à l'équipe design ; le remplacer ne touchera que
[`AppLogo.vue`](app/components/common/AppLogo.vue).

**Aucune image de la maquette n'a été importée.** Les visuels affichés viennent tous du
back-office via `<NuxtImg format="webp">` : photos de destinations, logos d'écoles,
icônes de domaines, et les **drapeaux en SVG** servis par l'API
(`/vendor/blade-flags/country-fr.svg`) — là où la maquette embarquait des PNG de 2 Mo.
