# Lot 5 — Authentification et paiement

> **État : partiel.** Quatre chantiers sur sept sont livrés et mesurés.
> Trois écrans restent à produire — voir § 8.

---

## 1. Ce qui est livré

| # | Chantier | État |
|---|---|---|
| 1 | Session de bout en bout (contrats, adapters, BFF, garde) | ✅ mesuré, testé |
| 2 | [`connexion.vue`](app/pages/connexion.vue) | ✅ mesuré au pixel |
| 3 | [`inscription.vue`](app/pages/inscription.vue) | ✅ mesuré au pixel |
| 4 | Intention de paiement + reprise après authentification | ✅ vérifié de bout en bout |
| 5 | [`langues/[slug]/paiement-reussi.vue`](app/pages/langues/%5Bslug%5D/paiement-reussi.vue) | ✅ mesuré au pixel |
| 6 | [`mot-de-passe.vue`](app/pages/mot-de-passe.vue) | ✅ mesuré au pixel |
| 7 | [`paiement-reussi.vue`](app/pages/paiement-reussi.vue) | ✅ mesuré au pixel |
| 8 | `mon-projet.vue` | ⛔ non livré |

Une correction hors périmètre a été apportée en cours de route sur `/langues`
(Lot 4), écran signalé comme non conforme — voir § 7 bis.

---

## 2. Une correction au brief : le paiement n'est pas Stripe Elements

Le brief annonçait, comme « correction importante », que le flux réel de
`legacy/` serait **Stripe Elements** — saisie de la carte dans la page — et non
une redirection.

**C'est l'inverse.** Vérifié :

```bash
grep -rn "StripeCard\|vue-stripe-js\|@stripe/stripe-js" legacy/src/ \
  | grep -v "^legacy/src/components/atoms/StripeCard.vue"
# → aucun résultat
```

`StripeCard.vue` n'est **importé nulle part** : c'est du code mort, resté dans
le dépôt. Les **douze** points d'appel réels font tous la même chose :

```ts
const ok = await paymentStore.iniPayment(orderData)
if (ok) window.location.replace(paymentStore.redirectUrl)
```

`redirectUrl` est donc une **URL absolue vers une page hébergée par Stripe**, et
le parcours quitte le site. Conséquences pour ce lot :

- aucune dépendance Stripe côté front (`@stripe/stripe-js`, `vue-stripe-js`,
  `@vue-stripe/vue-stripe` : aucune n'est installée) ;
- aucun `<ClientOnly>` lié au paiement ;
- **la clé publique `stripe_pk_api_key` n'est jamais lue par le front** — ce qui
  neutralise, côté client, le problème signalé au § 7.

> À confirmer avec l'équipe API avant la recette : `/payment/init` renvoie-t-il
> bien une URL Stripe Checkout, ou une page intermédiaire du back-office ? Le
> front s'accommode des deux (il redirige vers ce qu'on lui donne), mais le
> libellé de l'écran de retour en dépend.

---

## 3. La session

### Le trajet du jeton

```
navigateur                     Nitro (BFF)                back-office
    │                              │                           │
    │  POST /api/bff/session       │                           │
    ├─────────────────────────────►│  POST /auth/login         │
    │                              ├──────────────────────────►│
    │                              │  { access_token, user }   │
    │                              │◄──────────────────────────┤
    │  Set-Cookie: httpOnly        │                           │
    │  { user, pendingPayment }    │                           │
    │◄─────────────────────────────┤                           │
```

**Le jeton ne redescend jamais.** Le navigateur reçoit l'utilisateur, pas la
session. Tout appel authentifié repart du BFF, qui rattache `Authorization`
côté serveur — [`server/utils/session.ts`](server/utils/session.ts) est le seul
fichier du projet qui lit le cookie.

### Les routes

| Route | Rôle | Garde |
|---|---|---|
| `POST /api/bff/session` | connexion | — |
| `GET /api/bff/session` | session courante | répond `null`, jamais 401 |
| `DELETE /api/bff/session` | déconnexion + purge de l'intention | — |
| `POST /api/bff/session/social` | Google · Facebook · LinkedIn | — |
| `POST /api/bff/account` | inscription | — |
| `POST /api/bff/account/confirm` | code reçu par e-mail — **ouvre la session** | — |
| `POST /api/bff/account/resend-code` | renvoi du code | — |
| `POST /api/bff/account/forgot-password` | demande de réinitialisation | — |
| `POST /api/bff/account/reset-password` | nouveau mot de passe | — |
| `PUT · GET · DELETE /api/bff/payment/intent` | intention d'achat | — |
| `POST /api/bff/payment/init` | crée la commande | **401 sans session** |
| `POST /api/bff/payment/validate` | issue du paiement | **401 sans session** |
| `POST /api/bff/payment/retry` | relance | **401 sans session** |
| `GET /api/bff/orders` | commandes du compte | **401 sans session** |

### Deux décisions qui méritent d'être connues

**`GET /api/bff/session` répond `null`, pas 401.** L'absence de session est un
état normal du site. Un 401 déclencherait `onUnauthorized()` dans `bffFetch` —
donc une purge et une redirection vers `/connexion` — **sur chaque page
publique**.

**Un refus d'identifiants repart en 422, pas en 401.** Le back-office refuse par
un 400 (« Connexion echouée »). Relayé tel quel, il ferait réagir `bffFetch` :
depuis l'écran d'inscription, un mot de passe trop court expulserait
l'utilisateur vers `/connexion`, formulaire vidé. `rethrowAuthError` traduit
donc un refus en **erreur de saisie**, avec ses `fieldErrors`.

---

## 4. Le parcours de paiement

### La règle

> Le paiement n'est déclenché que si l'utilisateur est inscrit et connecté.

Elle est appliquée **deux fois, pour deux raisons** :

| Où | Quoi | Pourquoi |
|---|---|---|
| [`useCheckout`](app/composables/useCheckout.ts) | redirige vers `/connexion` | confort — l'utilisateur comprend ce qui se passe |
| [`payment/init.post.ts`](server/api/bff/payment/init.post.ts) | **401 avant tout appel réseau** | garde — un contrôle qui n'existerait que dans le composant se contourne en appelant la route directement |

### L'intention

Cookie **`httpOnly`** (`qiryna_payment_intent`), 30 minutes, **usage unique**,
effacé **avant** l'appel au back-office pour qu'un rechargement ne relance pas
un second paiement.

Ce qu'elle n'est pas : une garantie d'intégrité. Son contenu (offre, service,
options) n'est rien que l'utilisateur ne puisse déjà choisir dans l'interface, et
le montant est calculé par le back-office. Ce qu'elle garantit, c'est qu'aucun
paiement ne démarre sans session.

### Vérifié réellement

| Contrôle | Résultat |
|---|---|
| `POST /payment/init` sans cookie de session | **401** |
| Intention forgée avec `amount: 999` | champ **ignoré** (liste blanche) |
| Intention forgée avec `returnPath: "//evil.example.com"` | ramené à **`/`** |
| Intention périmée | cookie **effacé**, traité comme absente |
| Cookie tronqué / modifié à la main | traité comme absent |
| Clic « Choisir cette formule » déconnecté | intention posée (vrai `stripe_product_id`), redirection `/connexion?redirect=/offres/anglais` |
| Écran de connexion | « Votre commande vous attend : Kilimandjaro — Anglais » |
| `/langues/anglais/confirmation` sans session | **302** vers `/connexion?redirect=…` |

---

## 5. OAuth — logique portée, paquets écartés

L'ancien front s'appuyait sur `vue3-google-login`,
`@healerlab/vue3-facebook-login` et `vue3-linkedin-login` : trois greffons Vue 3
**sans rendu serveur**, qui touchent `window` à l'initialisation. Deux d'entre
eux ne font qu'appeler trois fonctions du SDK du fournisseur.

[`useSocialAuth`](app/composables/useSocialAuth.ts) reprend donc **la logique**,
pas les paquets. Ce qui est conservé mot pour mot de
`legacy/src/pages/Login/_Partials/` :

- le `state` CSRF de LinkedIn (`crypto.getRandomValues`), comparé au retour puis
  effacé ;
- le nettoyage de l'URL après le retour (`replaceState`), pour qu'un F5 ne
  rejoue pas un code déjà consommé ;
- l'enchaînement `login` → `register` de Google et Facebook, sans lequel une
  **première** connexion tierce échoue sur « User not found » ;
- la troisième issue de `/auth/social/register` : `requires_confirmation`, qui
  demande de rattacher le fournisseur à un compte existant.

---

## 6. Écarts avec la maquette — et pourquoi

| Maquette | Réel | Décision |
|---|---|---|
| Mot de passe : **un seul écran** (demande du lien) | `/auth/forgot-password` envoie un **code**, `/auth/new-password` l'attend avec le nouveau mot de passe | seconde étape rendue à la place de la première, même carte, mêmes primitives — comme pour l'inscription |
| Mot de passe : connecteurs de la frise | les SVG sont des traits **horizontaux** (32×1 et 72×1) posés dans une boîte de largeur nulle | reproduit tel quel — voir § 7 ter |
| Bouton **Apple** sur `connexion` et `inscription` | le back-office n'expose que `google`, `facebook`, `linkedin` | **LinkedIn prend le troisième emplacement.** Géométrie inchangée (trois colonnes `flex: 1 1 0`) ; seuls le logo et le mot diffèrent. Un bouton Apple inerte aurait été fidèle au dessin et faux pour l'utilisateur. |
| Confirmation : « QRY-20240521-4587 » | aucun numéro de commande en base | Référence **dérivée** de l'identifiant (`QRY-` + 8 caractères), comme l'ancien front. |
| Confirmation : « Equilibre & progression » | `description` **vide** sur les 12 formules du catalogue | L'étiquette n'est rendue que si elle est renseignée. |
| Confirmation : 5 étapes avec statuts | seule la première a une source (l'e-mail part avec la commande) | Étape 1 pilotée par `confirmed` ; les quatre autres gardent les statuts de la maquette. Aucun endpoint ne décrit le test de niveau, le choix de professeur, le planning ni la visio. |
| Confirmation : pastille de notification « 3 » | aucun compteur exposé | Pas de pastille. |
| Inscription : un seul écran | `/auth/register` **n'ouvre pas de session** — un code part par e-mail | Seconde étape rendue **à la place** du formulaire, dans la même carte et avec les mêmes primitives. C'est la solution qui invente le moins. |
| `border-radius: 5px` des étiquettes de formule | — | Ramené à 4px : normalisation **déjà actée au Lot 1** (DESIGN-SYSTEM.md § 4.3). Seul écart de 1px du lot. |

---

## 7. À remonter à l'équipe

### 🔴 Clé Stripe *live* sur l'environnement de recette

`GET /all-data` → `settings.site.stripe_pk_api_key` vaut `pk_live_51M3VTj…`.
Une clé live en recette permet des paiements réels depuis un environnement de
test.

Atténuation côté front : le flux étant une redirection (§ 2), **le front ne lit
jamais cette clé**. Le risque reste entier côté back-office, qui l'utilise pour
créer la session de paiement.

### 🟠 Aucun identifiant client OAuth n'est fourni

Les trois boutons de connexion tierce sont **grisés** tant que ces variables ne
sont pas renseignées :

```
NUXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID
NUXT_PUBLIC_OAUTH_FACEBOOK_APP_ID
NUXT_PUBLIC_OAUTH_LINKEDIN_CLIENT_ID
```

Ce sont des identifiants **clients**, publics par nature (ils apparaissent dans
l'URL d'autorisation). Les secrets restent côté back-office, qui valide les
jetons.

L'URL de retour LinkedIn doit être déclarée chez le fournisseur : `https://<domaine>/connexion` **et** `https://<domaine>/inscription`.

### 🟠 Quotas OAuth du back-office

`/auth/social/login` : 10 requêtes/minute · `/auth/social/register` : 5/minute.
L'enchaînement `login` → `register` consomme les deux compteurs sur une première
connexion.

### 🟡 Dette héritée : `nuxt.config.ts` ne typecheck pas

Quatre erreurs **préexistantes**, sans rapport avec ce lot :

```
nuxt.config.ts(22,17): TS2591: Cannot find name 'process'.        (×3)
nuxt.config.ts(59,5):  TS2353: 'lazy' does not exist in NuxtI18nOptions
```

`@types/node` n'est pas installé, et `lazy` a été retiré du type dans
`@nuxtjs/i18n` v10 (le chargement différé y est le comportement par défaut).
Non corrigé : cela touche les dépendances et la configuration i18n, hors
périmètre. **Tout le reste — `app/`, `server/`, `tests/` — typecheck à zéro
erreur.**

---

## 7 bis. Correction apportée à `/langues` (Lot 4)

Écran signalé comme non conforme après coup. Trois écarts réels, tous corrigés :

| Écart | Cause | Correction |
|---|---|---|
| **Drapeaux rectangulaires** au lieu des ronds de la maquette | la carte affichait `country_flag` de l'API — des `blade-flags` **rectangulaires** — alors que la maquette dessine des drapeaux **ronds**, déjà présents dans `public/icons/flags/` | le dessin de la maquette est servi ; l'URL de l'API reste le repli pour une langue qu'elle ne dessine pas |
| **Étiquettes toutes violettes**, libellées « 3 niveaux » | `badge` vaut `null` sur les quatre langues ; le Lot 4 affichait le nombre de niveaux dans une teinte unique | sept tonalités de `.langue-tag--*` portées ; libellés éditoriaux dans `config/language-badges.ts` — **`badge` l'emporte dès qu'il est renseigné** |
| **Ordre des cartes** | la grille suivait l'ordre de l'API (Français en premier) | tri sur l'ordre de la maquette (Anglais, Allemand, Français, Espagnol) |

Deux espaces insécables de fin — sur l'étiquette et sur le bouton « Demander » —
valaient 3 et 3,6px de largeur : reproduites dans les gabarits, pas dans les
traductions.

> ⚠️ **Les libellés d'étiquette sont des affirmations commerciales** (« La plus
> demandée », « En forte croissance »). L'API ne les porte pas ; la maquette les
> impose. Ils sont donc écrits dans `config/language-badges.ts`, sur le même
> principe que `config/language-goals.ts` — **à faire valider par le client,
> puis à administrer côté back-office.**

Reste un écart de **donnée**, non corrigeable côté front : la maquette montre
**huit** langues (arabe, mandarin, japonais, coréen), l'API n'en administre
**quatre**. La grille est donc plus courte de 157px, ce qui décale vers le haut
tout ce qui la suit. Les quatre langues manquantes sont à créer côté back-office.

---

## 7 quater. Écrans protégés, menu, et deux corrections

### La garde s'applique aux quatre écrans de compte

`/compte`, `/messages`, `/mon-projet` et `/langues/[slug]/paiement-reussi`
portent `definePageMeta({ middleware: 'auth' })`. Un visiteur non connecté est
renvoyé sur `/connexion?redirect=…`, destination conservée.

La garde vit **sur la route**, pas sur l'onglet de la barre basse : un onglet
masqué se contourne en tapant l'URL. Les cinq onglets restent donc visibles,
comme dans la maquette.

Vérifié : les quatre routes répondent **302** vers `/connexion` avec le bon
`redirect`.

### Le menu latéral suit la session

« Se connecter » et « S'inscrire » pointaient tous deux vers `/compte`. Ils
mènent désormais à `/connexion` et `/inscription`. Connecté, le menu salue par
le prénom et remplace les deux boutons par « Mon compte » et « Se déconnecter » —
proposer « Se connecter » à quelqu'un qui l'est déjà décrédibilise le reste.

### Rupture d'affichage : un décalage d'un pixel, corrigé

La maquette écrit `@media (max-width: 360px)`, qui **inclut** 360. Le variant
`max-*` de Tailwind v4 génère `@media (width < 360px)`, qui l'**exclut**. À
exactement 360px, les quatre raccourcis de l'accueil restaient sur une rangée
là où la maquette passe en 2×2. Même décalage sur les ruptures 380 et 400.

Les trois bornes valent désormais `360.02px`, `380.02px`, `400.02px` — `max-*`
devient équivalent à `<=` sur toute largeur réelle. Aucun variant `min-` ne les
emploie, le décalage est donc sans autre effet.

Vérifié aux largeurs 320 / 359 / **360** / 361 / 375 / 400 : géométrie
identique à la maquette partout. `/langues/[slug]/objectifs` à 400px, qui
divergeait pour la même raison, concorde maintenant lui aussi.

### Cinq liens morts, corrigés

Les écrans d'authentification renvoyaient vers `/pages/cgu`,
`/pages/politique-de-confidentialite` et `/pages/contact` — trois routes
inexistantes. Un consentement aux conditions générales qui pointe vers une 404
n'est pas un consentement.

| Lien | Correction |
|---|---|
| CGU | `/pages/cgu` — la route éditoriale existe désormais |
| Confidentialité | `/pages/privacy` — le slug administré, pas celui que j'avais supposé |
| « Nous contacter » | `mailto:` sur `settings.site.email`, la donnée réelle du back-office |

[`app/pages/pages/[slug].vue`](app/pages/pages/%5Bslug%5D.vue) rend les quatre
pages administrées (`cgu`, `cookies`, `faq`, `privacy`) via `pageRepo` et
`RichText` — donc du HTML **déjà assaini**. Un slug inconnu lève un vrai 404.
Aucune maquette ne décrit cet écran : il reprend la barre supérieure, le
bandeau de réassurance et la typographie éditoriale déjà portés.

---

## 7 ter. 🟡 À signaler au design : les connecteurs de `mot-de-passe.html`

`ic-step-connector-short.svg` mesure **32 × 1** et `ic-step-connector-long.svg`
**72 × 1** : ce sont des traits **horizontaux**. La maquette les place dans une
boîte de **largeur nulle** et de 32px (ou 72px) de haut. Résultat mesuré : un
trait horizontal de 32px à `x = 28`, et de 72px à `x = 53,5` — en travers de
l'espace vertical, là où la frise appelle visiblement un trait *vertical*.

La rotation s'est vraisemblablement perdue à l'export Figma (`.langue-trust-sep`
la porte, elle : `transform: rotate(90deg)`).

**Reproduit tel quel** : la maquette fait foi, et « corriger » un écran validé
sans arbitrage produirait un écart là où on croit en résorber un. Un ajout de
`rotate-90` sur les deux connecteurs suffira le jour où le design tranche.

---

## 7 quinquies. Un écran de succès **par tunnel**

`langues-post-payment.html` et `paiement-reussi.html` sont deux maquettes
distinctes, et elles ne diffèrent pas d'un détail : cinq étapes contre quatre,
une frise verticale contre une rangée horizontale, un récapitulatif de formule
contre un récapitulatif d'école. Logement et orientation auront les leurs.

D'où le nommage adopté — un chemin par tunnel, plutôt qu'un écran unique
paramétré :

| Tunnel | Route | État |
|---|---|---|
| Langues | `/langues/[slug]/paiement-reussi` | ✅ livré |
| Domaines d'étude | `/paiement-reussi` | ⛔ à produire (`paiement-reussi.html`) |
| Orientation | `/orientation/paiement-reussi` | à venir |
| Logement | `/logement/paiement-reussi` | à venir |

Ces pages divergent par leur **contenu**, pas par une option : le jour où deux
tunnels convergent, c'est un composant partagé qu'on extraira — pas un `v-if`
de plus. `useCheckout` choisit le `returnPath` selon `offer.kind`.

---

## 7 sexies. Deux arrondis du Lot 1, annulés

`paiement-reussi.html` a mis en évidence que les **normalisations de l'échelle
typographique** (DESIGN-SYSTEM.md § 4.2) et des **rayons** (§ 4.3) produisent
des écarts désormais mesurables :

| Maquette | Lot 1 ramenait à | Effet mesuré |
|---|---|---|
| `font-size: 15.5px` | 15px (`text-2xl`) | titre du récapitulatif **6px trop court** |
| `font-size: 10.5px` | 11px (`text-md`) | étiquette Stripe **1,1px trop large** |
| `border-radius: 7px` | 8px (`radius-lg`) | vignette 64×48 visiblement plus ronde |

Ces arrondis dataient d'avant l'exigence de fidélité au pixel. Les valeurs
exactes sont rétablies sous un préfixe qui dit ce qu'elles sont —
`--text-exact-10-5`, `--text-exact-15-5`, `--text-exact-16`,
`--radius-exact-7` — plutôt qu'insérées dans la suite `4xs…6xl`, ce qui aurait
obligé à renuméroter tout ce qui est au-dessus.

### Le format de date n'existait pas

`i18n.config.ts` déclarait `numberFormats` mais **aucun `datetimeFormats`**.
Conséquence : `d(date, 'long')` renvoyait une **chaîne vide, sans erreur** — la
ligne « Date de paiement » était donc vide sur les **deux** écrans de succès,
et rien ne le signalait. Les formats `long` et `short` sont ajoutés.

### Deux écarts de donnée sur cet écran

| Maquette | Réel | Décision |
|---|---|---|
| « 2 juillet 2026 **à 17:31** » | `created_at` est au format `JJ/MM/AAAA` — **l'heure n'existe pas en amont** | date seule |
| « stripe · Carte bancaire · **...4242** » | `/payment/validate` ne renvoie aucune information de carte | les quatre derniers chiffres sont retirés |

Les deux blocs étant alignés à droite, seul leur bord gauche se déplace.

---

## 8. Ce qui reste à produire

| Écran | Maquette | Ce qui est déjà en place |
|---|---|---|
| `paiement-reussi.vue` | `paiement-reussi.html` | `paymentRepo.validate`, contrat `Order`, tokens `--color-step-*`, illustration `hero-paiement.webp` déjà convertie |
| `mon-projet.vue` | `mon-projet.html` | `paymentRepo.orders`, contrat `Order`, middleware `auth`, illustration `hero-mon-projet.webp` déjà convertie |

Aucun de ces trois écrans n'a besoin de nouvelle couche API : les repositories,
les routes BFF et les contrats existent et sont testés.

`config/navigation.ts` devra recevoir `/paiement-reussi` dans le `match` de
l'onglet *Mon projet* — le préfixe `/paiement` actuel ne le couvre pas
(`resolveActiveNavId` exige une correspondance exacte ou un segment complet).

---

## 9. Vérifications

```bash
npm test        # 186 tests, 12 fichiers, 2,1 s
npm run build   # ✅
npm run typecheck
```

### Tests ajoutés (35)

| Fichier | Ce qui est couvert |
|---|---|
| `session.adapter.spec.ts` | nominal, `name` absent (comptes OAuth), `profile: null`, `is_activated` en 0/1, **session sans jeton refusée**, demande de rattachement |
| `order.adapter.spec.ts` | nominal, référence dérivée, entrées fantômes, **deux vocabulaires de `service_type`**, état lu dans `status` **ou** `confirmed`/`failed`, `redirectUrl` vide → `null` |
| `payment-intent.spec.ts` | champs hors liste blanche ignorés, **redirection ouverte bloquée**, options non textuelles écartées |

### Mesures navigateur, viewport 375px, `qiryna_locale=fr`

Comparaison élément par élément avec la maquette servie sur la même origine
(`/_maquette/pages/…`), sur `getBoundingClientRect()` **et**
`getComputedStyle()` : `w`, `h`, `x`, `y`, `fontSize`, `lineHeight`,
`fontWeight`, `letterSpacing`, `borderRadius`, `background`, `color`,
`padding`, `gap`, `border`.

| Écran | Éléments comparés | Écarts réels |
|---|---|---|
| `/connexion` | 26 | **0** |
| `/inscription` | 26 | **0** |
| `/langues/[slug]/paiement-reussi` | 29 | **0** |
| `/mot-de-passe` | 31 | **0** |
| `/paiement-reussi` | 31 | **0** hors deux écarts de donnée (heure et carte, § 7 sexies) |
| `/langues` (correction Lot 4) | 12 | **0**, hors écart de donnée (4 langues sur 8) |

Faux positifs écartés, tous documentés : `font-size: 13.33px` et `color: black`
sur `<button>` (défauts UA, sans effet — le texte est dans un `<span>` stylé) ;
`border-radius: 9999px` vs `calc(infinity)` (`rounded-full`, rendu identique) ;
`color` sur un `<img>` (sans effet).

### Trois corrections trouvées **par la mesure**, pas à la lecture

1. **`padding: 1px 2px` des champs de saisie.** La maquette s'appuie sur le
   défaut des navigateurs, que le preflight Tailwind supprime. Sans lui, le
   texte saisi commence 2px trop à gauche.
2. **Débordement de 0,6px des pictogrammes de champ.** `inset: -4.8% -3.69%`
   sur 16,25 × 12,5 et `-3.33% -4.29%` sur 14 × 18 : le même 0,6px, exprimé en
   pourcentage de boîtes différentes. Sans lui, le dessin est 8% trop petit.
   D'où `iconBleed` sur `QInput` — et `max-w-none`, sans quoi le `max-width:
   100%` de la base annule le débordement.
3. **Les marges par défaut des `<p>` dans `.help-box`.** `app.css` ne les remet
   pas à zéro dans cet encart — à la différence de `.inscription-help-box` — et
   le preflight Tailwind, lui, les supprime. L'encart y perdait **34px** de
   hauteur.
4. **La frise verticale de la confirmation est calée en JavaScript.** Un
   `top: 10px / bottom: 10px` en CSS ne tombe juste que si les cartes font la
   hauteur d'une pastille — faux dès 375px, où le texte passe à la ligne.
   `measureLine()` reprend la mécanique de la maquette, avec un
   `ResizeObserver` là où elle se contente d'un `resize` : les cartes changent
   aussi de hauteur quand Jost remplace la police de repli.

---

## 10. Ajouts au design system

Aucun composant nouveau. Cinq primitives **corrigées** contre la maquette :

| Primitive | Correction |
|---|---|
| `QInput` | portage littéral de `.input-group` / `.input-field` — libellé 12/16, pictogramme non carré (`iconWidth`/`iconHeight`/`iconBleed`), œil en absolu à `right: 10px`, retrait interne restitué |
| `QSocialButton` | fournisseur `linkedin`, bord `#e2e8f0`, resserrement sous 360px |
| `QPasswordStrength` | `hintTone` — la maquette ne connaît que trois états d'indication (neutre / insuffisant / valide) là où les barres en comptent quatre : un mot de passe « moyen » affiche des barres oranges et un message **rouge**, parce qu'il est refusé |
| `QAlert` | slot `actions` — un message peut appeler une décision |
| `QCheckbox`, `QSpinner` | inchangés, vérifiés conformes |

Deux composants d'écran : `AuthToggle`, `AuthSocialRow`.

Une option de page : `shellBackground: 'tint'` — `langues-post-payment.html` est
le seul écran de la maquette à teinter le shell entier (`#faf9fe`). Déclarée
dans `page-meta.d.ts`, donc typée : une faute de frappe est refusée à la
compilation.

Images : cinq illustrations converties du PNG au WebP —
**5 715 Ko → 72 Ko** (−98,7 %), toutes sous 45 Ko.

---

## 11. Un piège de développement à connaître

**Tailwind ne génère pas les classes d'un fichier créé après le démarrage du
serveur de développement.** Une page neuve s'affiche alors sans une partie de sa
mise en page, ce qui ressemble à une faute de frappe et n'en est pas.

```bash
# Force la régénération sans redémarrer
node -e "const f=require('fs'),p='app/assets/css/main.css';f.writeFileSync(p,f.readFileSync(p,'utf8'))"
```
