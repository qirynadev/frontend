# Directives back-office/API restantes — reconnexion mocks → réel (2026-08-22)

Suite à la session de reconnexion des écrans `mon-projet` et `offres` sur la
branche `app` (voir `MEMORY.md` / commits du jour). Pour chaque point : ce qui
manque côté API, et la forme attendue pour pouvoir compléter l'écran.

**Règle de cette session (précisée par le responsable le 2026-08-22)** : tant
que le produit est en développement (pas en production), la **qualité**
éditoriale d'une donnée réelle (texte de test, lorem ipsum, faker) n'est
**jamais** un motif pour rester en mock — si le champ existe côté API dans un
format exploitable, on le câble tel quel. Seule l'**absence totale** de la
donnée justifie de documenter une directive backend ci-dessous.

Convention : 🔴 aucune donnée du tout, rien à câbler · 🟡 donnée réelle câblée
telle quelle, qualité éditoriale à parfaire côté back-office (n'empêche pas le
fonctionnement) · 🔵 question de sémantique/produit à trancher.

## 1. 🟡 Offres domaine — prestations (`OfferTierCard`, mode `domain`)

**Câblé** (2026-08-22) : `OfferTierCard.vue` affiche désormais `tier.features`
en priorité (repli sur la liste fixe `DOMAIN_OFFER_FEATURE_IDS` uniquement si
l'offre n'a encore aucune prestation renseignée). Contenu réel vérifié en
direct sur les 8 domaines (`GET /all-data` → `offers[].items[].title`) :

| Domaine | Qualité éditoriale constatée |
|---|---|
| Ingénierie | ✅ 4 items rédigés et distincts |
| Management | ⚠️ réel mais **item 3 dupliqué** (la phrase "Dossier de candidature — …candidatures." apparaît deux fois collée) |
| MBA | ✅ 7 items rédigés |
| Sciences exactes | texte de remplissage (« Enim sunt aut rerum », « Et laboriosam iure »…) |
| Architecture | texte de remplissage (« Qui rerum est est a »…) |
| Droit | texte de test (« Lorem ipsum… », « tierco element to include here ») |
| Sciences humaines | texte de remplissage, 1 seul item (« Sed tempor voluptas ») |
| Médecine | la même ligne « Lorem ipsum dolor sit amet… » répétée 4 fois |

**Ce qu'il faut, à terme (pas bloquant)** : sur les 5 domaines encore en texte
de remplissage, un contenu éditorial réel et distinct (4 à 5 lignes, format
libre court comme sur Ingénierie/MBA) ; et sur Management, retirer la
duplication de l'item 3. `offer-domain-features.ts` (repli Figma) peut être
retiré une fois les 8 domaines à niveau.

## 2. 🔴 Fiche école — grade et durée de formation

`GET /all-data` → `schoolSheets[*].schools[*].formations[]` : vérifié sur les
1011 formations renvoyées (toutes écoles/destinations confondues), le champ
ne porte que `{title, description, description_en}` — **aucun champ
`grade` ni `duration`/`duration_label`**, sur aucune des 1011 lignes. Rien à
câbler ici, contrairement au point 1 : la donnée n'existe pas du tout, ce
n'est pas une question de qualité.

**Ce qu'il faut** : exposer `grade` (ex. « Grade Master », « Grade Bachelor »)
et `duration` (ex. « 2 ans », « 12 à 18 mois ») par formation. En attendant,
`app/config/formation-meta-mock.ts` (`resolveFormationMeta`) infère une valeur
plausible depuis le titre (Bachelor/Master/MBA/Mastère) — déjà en place,
documenté, pas de changement nécessaire côté front tant que l'API ne porte
pas ces champs.

## 3. 🟡 Professeur — qualification (`formations[0].diploma`)

**Câblé** (2026-08-22) : `Teacher.qualification` lit `formations[0].diploma`
tel quel. Qualité éditoriale vérifiée sur les deux coachs de test :

- Pierre Mouton → `diploma: "Master"` (réel, exploitable)
- Wing Meyers → `diploma: "Animi nobis expedit"` (texte de test/faker)

**Ce qu'il faut, à terme (pas bloquant)** : que chaque profil coach publié
porte un diplôme/certification réel avant la mise en production.

## 4. 🟡 Professeur — badge « vérifié » (`user.email_verified_at`)

**Câblé** (2026-08-22) : `Teacher.verified` = `email_verified_at !== null`.
Fonctionne (les deux coachs de test l'ont, donc le badge s'affiche), mais ce
champ est une confirmation d'e-mail technique posée à la création du compte,
pas un contrôle de profil (diplômes/identité vérifiés par un humain) — tout
nouveau compte coach aura `verified: true` dès sa création, sans contrôle
réel.

**Question produit, pour la suite** : si le badge doit un jour représenter
une vraie vérification de profil (pas juste un e-mail confirmé), il faudra un
champ dédié côté back-office (`is_verified_coach` ou équivalent) alimenté par
un contrôle humain distinct de la confirmation d'e-mail.

## 5. 🔴 Certification langue (`/mon-projet/langues/certification`)

Aucun endpoint API ne couvre ce parcours (statut de certification, date
d'obtention, lien de téléchargement) — rien de disponible à câbler, pas une
question de qualité. L'écran reste 100 % Figma (`langueCertificationPct`/
`langueCertificationSteps`, tous deux à `done`/100 % en dur).

**Ce qu'il faut** : un endpoint exposant, par langue/commande, l'état réel de
la certification (non commencée / en cours / obtenue + lien du certificat) si
ce parcours doit devenir un vrai suivi plutôt qu'un écran vitrine.

## 6. 🔴 `/mon-projet/apercu` — RDV conseiller

Trois éléments sans aucune contrepartie API (pas une question de qualité,
rien n'existe) :
- Date « Prochain RDV » (actuellement `12 mai 2026` en dur dans le template).
- CTA « Prendre rendez-vous » (non lié, aucune action).
- Compteur « À venir » (toujours `1`, aucune notion de commande "à venir"
  côté `/payment/list` — seuls `pending`/`confirmed`/`failed` existent).

**Ce qu'il faut** : si un système de prise de rendez-vous conseiller existe ou
est prévu côté back-office, exposer au minimum le prochain RDV programmé (date,
lien) et un compteur de RDV à venir pour ce client.

## 7. 🔵 `/mon-projet/langues` — étapes de parcours (Inscription → Certification)

Les 4 étapes affichées en haut de `/mon-projet/langues` (`langueProgressSteps`)
sont 100 % statiques (aucune commande, aucun calcul). Une vraie checklist par
commande existe pourtant (`Order.checklist`, type `Course` → 5 étapes,
alimentée pour les commandes créées après le 17/08/2026 — vérifié sur le
compte de test : plusieurs commandes langue ont bien `checklist.length === 5`).

**Ce qui bloque un câblage direct — pas une question de qualité, une question
de règle métier** : cet écran fusionne **plusieurs** commandes par langue
(règle confirmée le 2026-08-17 — deux achats d'Anglais deviennent une seule
carte). Si ces commandes ont des checklists à des stades différents, quelle
règle afficher (la plus avancée ? la plus récente ? une moyenne) ? **Question
produit à trancher avant tout câblage** — en l'absence de règle validée, la
barre reste statique plutôt que d'inventer une agrégation.

## 8. ✅ Corrigé : `POST /client-data/store` refuse toute commande logement confirmée

**Corrigé côté API** (commit `6f15259`, *« fix(client-data): reconnaît les
commandes réellement payées »*, poussé sur `staging` le 2026-08-27 — donc
déployé sur `admin.stage.qiryna.com`). `store()` et `checkStatus()`
reconnaissent maintenant les commandes réellement payées (statuts
`OrderTrackingStatusEnum`), plus la chaîne littérale `'paid'` qui ne
correspondait à aucune valeur stockée en base. Le formulaire de préférences
logement (`logement/paiement-reussi.vue`) devrait fonctionner de bout en
bout désormais — **à revérifier en direct avec une commande réelle** avant
de considérer le sujet clos côté front.

<details>
<summary>Détail original du bug (pour mémoire)</summary>

**Reproduit en direct** (2026-08-24) sur une commande `CostOfLiving` réelle,
statut `Vérifié` (`e65f8a4b…`, `966b839a…`) : `POST /client-data/store` (et
donc le nouveau formulaire de préférences de `logement/paiement-reussi.vue`,
tout juste câblé côté front) répond **404 « Commande introuvable »**, y
compris en appelant l'API directement (donc pas un problème de relais côté
front) :

```
curl -X POST https://admin.stage.qiryna.com/api/client-data/store \
  -H "Authorization: Bearer <token compte de test>" \
  -d '{"order_id":"966b839a-6e0b-42bd-903d-3cc3cc74d4f9","planned_arrival_date":"2026-09-01"}'
→ 404 {"message":"Commande introuvable","status":false}
```

**Cause probable** : `ClientDataController::store()` (`qiryna-backoffice`)
filtre la commande avec `->where('status', 'paid')` — une valeur littérale
anglaise — alors que `/payment/list` (et donc l'état réel d'une commande vue
par le client) renvoie des libellés français (`Vérifié`, `En attente de
vérification`…) via `OrderTrackingStatusEnum`. Le même genre d'écart avait
déjà été trouvé et corrigé côté front (`toOrderStatus`, voir mémoire projet)
— ici c'est côté API que la comparaison de statut est fausse, sur un
mécanisme d'écriture cette fois (pas juste de lecture). `checkStatus()`
utilise apparemment le même filtre et serait probablement affecté de la même
façon (non testé directement, mais code identique sur ce point).

**Ce qu'il faut** : corriger la comparaison de statut dans `store()` (et
vérifier `checkStatus()`) pour reconnaître les commandes réellement payées,
quel que soit le libellé exact stocké — cohérent avec ce que `/payment/list`
considère déjà comme confirmé. Tant que ce n'est pas corrigé, **aucune**
commande logement ne peut enregistrer ses préférences, même si le
formulaire front est fonctionnel et correctement câblé.

</details>

## 9. ✅ Contact (`/reglages/contact`) — résolu en utilisant le bon endpoint

**Un premier câblage** (2026-08-27) utilisait `POST /send-email` (public,
aucune session) — fonctionnel (201, e-mail envoyé) mais son code source
porte `// TODO: #56 save email in database` : rien n'était enregistré en
base, donc rien de visible dans le back-office lui-même, seulement dans une
boîte mail.

**Corrigé en trouvant le bon endpoint, déjà existant** : `POST /user/messages`
(`MessageController::sendMessage`) fait exactement ce qu'il faut — il crée un
vrai enregistrement `Messaging` (`sender_id` = le client connecté,
`receiver_id` = un admin) **et** appelle en interne le même `MessageAction::
sendEmail`. Confirmé en lisant `MessageController.php` (web/Inertia, route
nommée `messages.index`) : son écran `Messages/Index` charge **tous** les
`Messaging::with(['sender','receiver'])->oldest()->get()` sans filtre — c'est
la rubrique « Messagerie » du back-office, et elle affichera bien les
messages du formulaire de contact. Vérifié en direct (2026-08-27) : message
réellement créé et visible via `GET /user/messages`.

**Reste un point mineur, pas bloquant** : `POST /user/messages` n'a qu'un
champ `text` — le sujet choisi par le client n'apparaît que dans le corps du
message (regroupé par le front), pas dans une colonne dédiée. Si un jour la
« Messagerie » doit filtrer/trier par sujet, une colonne `subject` sur
`Messaging` serait utile — pas nécessaire pour que ça fonctionne aujourd'hui.

**Le `TODO #56` sur `/send-email` reste d'actualité pour son propre usage**
(la page `/reglages/mentions`/autres appels publics sans session pourraient
encore s'en servir un jour) mais n'est plus un blocage pour le contact
client, qui passe maintenant par `/user/messages`.

## 10. ✅ Corrigé : `POST /auth/register` plantait sur toute inscription

**Corrigé côté API** (commit `c691ef7`, *« fix(auth): repli ?? null sur les
champs optionnels non fournis à l'inscription/mise à jour »*, poussé sur
`staging` le 2026-08-27 — déployé). Corrige `register()` **et**, par la même
occasion, `updateUserData()` (`address`/`city` — le risque repéré ci-dessous
était donc réel, maintenant traité aussi). Testé par un test Pest dédié côté
API (inscription sans `lc_country_id` → 201).

Le contournement front (`server/api/bff/account/index.post.ts`, envoi
explicite de `lc_country_id: null`) reste en place — inoffensif et redondant
maintenant que l'API ne plante plus sans lui, pas nécessaire de le retirer.

<details>
<summary>Détail original du bug (pour mémoire)</summary>

**Reproduit en direct** (2026-08-27, signalé par le responsable après un
test réel) : l'inscription d'un nouveau client échoue systématiquement.

```
POST /auth/register {"email":"...","password":"...","first_name":"Test","last_name":"Qiryna", ...}
→ 500 {"message":"Undefined array key \"lc_country_id\""}
```

**Cause** : `AuthController::register` (`qiryna-backoffice`) valide
`lc_country_id` comme facultatif (`'lc_country_id' => 'nullable'`) mais
l'utilise ensuite sans repli :

```php
$profil = Profile::create([
    ...
    'lc_country_id' => $data['lc_country_id'],   // plante si la clé est absente
    ...
]);
```

Notre formulaire d'inscription ne demande pas le pays et n'envoie donc
jamais cette clé — `$data['lc_country_id']` n'existe pas dans le tableau,
PHP lève une erreur non interceptée par la validation (`nullable` autorise
une valeur *nulle*, pas une clé *absente*).

**Contourné côté front en attendant** (`server/api/bff/account/index.post.ts`,
2026-08-27) : on envoie désormais `lc_country_id: null` explicitement à
chaque inscription — confirmé en direct que ça suffit (201, compte créé).
Mais c'est un contournement, pas une correction : n'importe quel autre
client de cette API (mobile, intégration tierce) qui n'envoie pas cette clé
plante de la même façon.

**Ce qu'il faut** : `'lc_country_id' => $data['lc_country_id'] ?? null,`
(une ligne). **À vérifier par la même occasion** — `updateUserData` (même
fichier, méthode « mettre à jour mon profil », utilisée par `/compte`) a
exactement le même risque sur `address`/`city`/`photo` (accédés sans repli,
alors que les règles de validation associées sont commentées/absentes) :
non reproduit ni testé cette fois-ci, mais mérite le même correctif
préventif tant qu'on est dans ce fichier.

</details>

## 11. ✅ Corrigé : achat d'une fiche école (domaine) impossible — 404 « Domaine d'étude introuvable »

**Reproduit en direct** (2026-08-27) : `POST /payment/init` échouait
systématiquement pour toute offre domaine (testé sur Management), avec
« Domaine d'étude introuvable ». Le legacy (`./legacy`, app pré-refonte)
fonctionnait correctement sur ce même parcours — comparaison qui a permis de
localiser précisément le problème.

**Corrigé côté API** (commit `5c39435`, *« fix(offer): résout la 404 "Domaine
d'étude introuvable" à l'achat d'une offre école »*, poussé sur `staging`
le 2026-08-27 — déployé), **deux bugs distincts** :

1. `Offer::areaOfStudy()` appelait `$this->morphTo('model')` — ce premier
   argument sert à la fois de préfixe de colonnes (`model_type`/`model_id`,
   correct) **et** de clé de relation pour l'eager loading. Avec `'model'`
   comme clé, `->with('areaOfStudy')` (utilisé par `/all-data`) peuplait
   `relations['model']` au lieu de `relations['areaOfStudy']`, qui restait
   `null` — d'où `offers[].area: null` pour les 8 offres domaine, malgré un
   lien réel et correct en base. Corrigé en nommant explicitement la
   relation et les colonnes séparément : `morphTo('areaOfStudy',
   'model_type', 'model_id')`.
2. `AreaController::getOffer()` faisait `respondWithSuccess($offer->resource)`
   — `->resource` déballe le modèle Eloquent brut et contourne
   `OfferResource::toArray()`, là où `'area' => $this->areaOfStudy` doit
   s'exécuter. Corrigé en retirant `->resource`.

Testé par l'équipe backend via Tinker (reproduction isolée de chaque bug) et
deux nouveaux tests Pest. **Revérifié côté front le 2026-08-27** : `/all-data`
renvoie désormais `offers[].area.id` correctement peuplé (confirmé en direct
sur l'offre Management), et un clic réel sur « Démarrer mon accompagnement »
redirige bien vers Stripe (`buy.stripe.com`) — le parcours d'achat école est
rétabli de bout en bout, sans aucun changement nécessaire côté front
(`toDomainOfferPage` utilisait déjà `area.id` en priorité).

## 12. Optimisation API — sortir progressivement de `/all-data`

Rappel de l'intention déjà écrite dans `server/utils/catalog.ts` (« le seul
fichier à modifier quand l'API sera découpée ») : `/all-data` pèse 4,4 Mo et
sert de source unique pour du contenu qui n'a souvent aucun rapport entre
lui. Chaque fois qu'un écran de cette session s'appuie dessus, la demande
d'endpoint dédié correspondante :

- **Prestations d'offre domaine** (point 1) : `offers[].items` vient
  aujourd'hui de `/all-data`. Demander un endpoint dédié par offre (ex.
  `GET /offers/{id}` ou `GET /areas-of-studies/{id}/offer`) — ce qu'`/offres/
  [domaine]` affiche n'a besoin que d'une seule offre, pas du dump entier.
- **Formations d'école** (point 2) : `schoolSheets[*].schools[*].formations[]`
  vient aussi de `/all-data`. En plus d'ajouter `grade`/`duration` (point 2),
  demander que les formations d'une école soient exposées par un endpoint
  dédié (ex. `GET /schools/{id}/formations`) plutôt que noyées dans le dump —
  `GET /schools/{countryId}/{areaId}` existe déjà pour lister les écoles d'un
  domaine, un complément par école serait cohérent avec ce qui existe.

**Pas concerné, déjà dédié** : les professeurs (`/teachers`, `/user/plannings/
teachers/{courseId}`) ont déjà leurs propres endpoints — le champ `teachers`
présent dans `/all-data` n'est pas consommé par ce front et peut être ignoré
sans risque (à confirmer avec le back-office si son retrait de `/all-data` est
possible côté API, dans la même logique d'allègement).

## Pour mémoire — pas des écarts, aucune action requise

- **Prix professeur « à partir de »** (`docs/mon-projet-professeur-mocks.md`) :
  la maquette Figma elle-même affiche « - », conforme à l'absence de prix par
  professeur côté API (le prix est au niveau de la formule, pas du prof).
- **Pays / drapeau professeur** et **disponibilité** : résolus cette session
  (voir compte-rendu) — `country.name`/`country_flag` et le premier créneau
  libre de `plannings[]` sont réels et fiables, câblés dans
  `planning.adapter.ts` (`toTeacher`) et consommés par `professeur.vue` /
  `planifier.vue` via `app/utils/teacher-availability.ts`.
- **Bonus côté back-office** : en corrigeant les points 8/10/11, l'équipe
  backend a aussi trouvé et corrigé (commit `b218784`, `qiryna-backoffice`)
  un crash de création de créneau professeur sans date (même famille de bug
  — accès à une clé de tableau validée `nullable` sans repli). Pas demandé
  explicitement, trouvé par audit du pattern déjà connu — mentionné ici pour
  traçabilité, aucune action front associée.
