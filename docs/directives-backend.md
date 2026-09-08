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

- ✅ **Formations d'école** — résolu le 2026-08-31 (voir point 20) :
  `GET /schools/{id}/formations` existe désormais, `grade`/`duration`
  compris, câblé côté front (`[school].vue` ne dépend plus de `/all-data`
  pour son onglet Formations).
- 🔴 **Fiche école complète, prestations d'offre domaine** — routes déjà
  disponibles (`GET /schools/{id}`, `GET /areas-of-studies/offer/{id}`),
  mais **bloquées par un problème de résolution slug→UUID** commun aux
  deux : voir point 21.
- **Listes destinations/écoles** : `GET /school-files` existe (fiches pays,
  sans pagination) mais réutilise `SchoolFileResource`, qui embarque
  toujours chaque école en entier (formations/détails/présentation) — pas
  plus léger que `/all-data` pour lister des écoles. Le vrai allègement des
  listes vient de `GET /schools/{countryId}/{areaId}` (déjà utilisé par
  `ecoles/index.vue`, paginé 5 par page). À confirmer avec Prosper que
  `/school-files` est bien pensé pour les seules infos pays (titre, stats,
  bandeau), pas pour transporter les écoles rattachées.

**Pas concerné, déjà dédié** : les professeurs (`/teachers`, `/user/plannings/
teachers/{courseId}`) ont déjà leurs propres endpoints — le champ `teachers`
présent dans `/all-data` n'est pas consommé par ce front et peut être ignoré
sans risque (à confirmer avec le back-office si son retrait de `/all-data` est
possible côté API, dans la même logique d'allègement).

## 13. ✅ Câblé : dépôt de pièces admission (`/mon-projet/admission?tab=document`)

**Corrige une conclusion erronée d'une session précédente** (« aucun endpoint
n'expose de suivi par pièce, `ClientPostPurchaseData` n'est qu'un formulaire
global ») : en relisant `ClientDataController::store()` en entier (pas
seulement les champs `diplomas`/`additional_documents`/`is_complete` déjà
repérés), **quatre pièces ont bien une colonne de fichier dédiée** —
`id_document_path`, `transcripts_path`, `language_certificate_path`,
`cover_letter_path`. Vérifié en direct sur `stage.qiryna.com` (comptes de
test, 2026-08-27) : upload réel via `multipart/form-data`, fichier persisté
sur le disque `public` (`client-documents/{user}/{order}/…`) et
téléchargeable (`GET /storage/...` → 200). Câblé côté front dans
`admissionDocumentsRepo`/`MpaDocsCard.vue`.

**Trouvé par la même occasion, sans lien avec l'onglet Document** : le bug du
point 8 (`->where('status', 'paid')`) était déjà corrigé côté back-office au
moment de cette session (commit `6f15259`, poussé le matin même du
2026-08-27) — `POST /client-data/store` fonctionne désormais pour de vraies
commandes, tous types confondus (vérifié aussi sur une commande admission).

**Les deux limites ci-dessous sont résolues** (`qiryna-backoffice` commit
`1b38ef2`, 2026-08-28 — citant explicitement ce point 13 dans son message) :

1. ✅ **Envoi unique, verrouillage immédiat** — résolu. `store()`/
   `storeViaToken()` ne posent plus `is_complete=true` à chaque appel : un
   nouveau champ `finalize` (booléen) sépare « enregistrer les pièces
   fournies » (absent/`false` — le dossier reste ouvert, le client peut
   revenir envoyer/remplacer d'autres pièces) de « clôturer le dossier »
   (`true` — pose `is_complete`/`completed_at`, tout envoi suivant refusé en
   400). Un admin peut aussi rouvrir/refermer un dossier depuis
   `Order/Edit.vue` (`POST commandes/{id}/client-data/toggle-complete`).
   **Front reconstruit en conséquence** (2026-08-28) : `MpaDocsCard.vue`
   envoie chaque pièce indépendamment dès qu'elle est choisie
   (`admissionDocumentsRepo.uploadDocument`), avec un bouton séparé
   « Finaliser mon dossier » (`admissionDocumentsRepo.finalize`) — plus de
   sélection groupée forcée avant un unique envoi.
2. ✅ **`diploma`/`recommendation` sans colonne dédiée** — résolu. Deux
   nouvelles colonnes `diploma_path`/`recommendation_path` (migration
   `2026_08_28_120000_...`), sur le même modèle que les quatre autres pièces ;
   validation, `store()`, préremplissage et affichage/téléchargement
   back-office mis à jour. **Front reconstruit en conséquence** : le
   contournement par préfixe de nom de fichier dans `additional_documents[]`
   est retiré (`admission-documents.adapter.ts` lit directement
   `diploma_path`/`recommendation_path`, comme les quatre autres pièces).

**Statut par pièce (validé/en attente/à téléverser) approximé, pas exact** :
il n'existe aucun suivi de vérification **par pièce**, ni côté API ni côté
back-office lui-même — `Order/Edit.vue` (page admin) n'a qu'un statut de
**commande** entière (« Vérifié »/« En attente de vérification »/« Annulé »).
Le front réutilise ce statut de commande pour toutes les pièces déjà
envoyées : `Vérifié` → badge « Validé », sinon → badge « En attente ». C'est
une lecture honnête d'un champ réel, pas une vérité par document — si un jour
la vérification doit vraiment se faire pièce par pièce, il faudrait un statut
dédié par colonne (`id_document_status`, etc.) plutôt que le seul statut de
commande.

**Point annexe découvert en testant** : `store()` exige que la commande soit
`en attente de vérification` ou `vérifiée` (`whereIn('status', […])`) — une
commande encore `en attente de paiement` (paiement non abouti) est refusée en
404 « Commande introuvable », **normal et voulu**, mais ce front n'a
actuellement aucun moyen de distinguer ces deux « en attente » différents
pour choisir la bonne commande à afficher sur cet écran à route fixe (déjà
documenté comme limitation dans `useAdmissionData.ts` — non traité ici,
simplement confirmé qu'il peut se manifester en pratique).

## 14. 🔵 Retour Stripe après paiement langue : atterrit sur l'écran générique au lieu du sien

**Reproduit en direct** (2026-08-29, signalé par le responsable après un
achat réel) : un cours de langue payé (commande `b89ba93d-aad8-49cb-
9463-303c43da076f`, `service_type: App\Models\Course`, cours « Apprendre
l'anglais », `slug: anglais`) redirige après Stripe vers `/paiement-
reussi?order_id=…` (écran générique, domaines d'étude) au lieu de
`/langues/anglais/paiement-reussi?order_id=…` (son propre écran).

**Ce n'est pas un manque de code** : `PaymentController::buildSuccessPath()`
(commit `838bf75`, 2026-08-17) route déjà correctement par `service_type` —
`Course` → `/langues/{slug}/paiement-reussi`, `CostOfLiving` → `/logement/
paiement-reussi`, `Profilage` → `/orientation/paiement-reussi`, école →
`/paiement-reussi` (repli documenté seulement si le slug ne se résout pas).
Vérifié que ce n'est pas la cause ici : le cours `f38db26d-…` de la commande
existe bien via `GET /courses` avec un slug réel (`anglais`), pas de repli à
attendre. `838bf75` est un ancêtre direct de `6f15259`
(`git merge-base --is-ancestor 838bf75 6f15259` → vrai), commit dont j'ai
déjà vérifié en direct qu'il est bien actif sur `stage.qiryna.com` (session
du 2026-08-27, bug de statut `client-data`) — donc `buildSuccessPath()`
*devrait* déjà tourner en production.

**Cause non identifiée côté front** : soit un déploiement qui n'a pas
effectivement pris ce commit malgré son ancienneté (12 jours) et malgré
`6f15259`, plus récent, confirmé actif — soit un comportement d'exécution
qui diverge de la lecture statique du code (cache d'opcode, config
`qiryna.front_url` d'un autre environnement, etc.). Aucun des deux n'est
diagnosticable depuis le front — ni logs serveur, ni accès déploiement.

**Ce qu'il faut** : vérifier côté back-office que `buildSuccessPath()`
tourne réellement sur l'instance qui sert `stage.qiryna.com` (logs de
`[PAYMENT] 🌐 URL de redirection Stripe`, déjà en place dans
`createPayment()`, devraient suffire à trancher immédiatement — la ligne
loggue `success_url` avant l'appel Stripe).

**Contourné côté front en attendant** (`app/pages/paiement-reussi.vue`,
2026-08-29) : cet écran générique redirige maintenant lui-même vers le bon
tunnel (`langues/{slug}`, `logement`, `orientation`) dès que la commande
validée n'est pas une commande école — `order.serviceType`/`serviceSlug`
suffisent, déjà disponibles côté front. **Un filet de sécurité, pas une
correction du fond** : ça évite l'écran trompeur au client tout de suite,
mais laisse un aller-retour de navigation évitable, et ne dit rien sur la
cause réelle tant qu'elle n'est pas confirmée côté back-office.

**Détail sans lien direct, repéré au passage** : le front calcule déjà
`PaymentIntent.returnPath` par tunnel (`useCheckout.ts`) mais ne l'envoie
jamais à `POST /payment/init` (`server/api/bff/payment/init.post.ts` ne le
transmet pas) — code mort aujourd'hui, sans incidence tant que le
back-office calcule sa propre URL sans lire de champ client. À garder en
tête seulement si un jour le back-office décide de laisser le front piloter
cette URL plutôt que de la déduire lui-même de `service_type`.

## 15. 🔴 Objectifs d'apprentissage (`/langues/{slug}/objectifs`) — 100 % éditorial front, à administrer

Les 6 objectifs proposés sur cet écran (Examens internationaux, Conversation,
Anglais professionnel, Remise à niveau, Admission internationale, Autre) ne
viennent d'aucun endpoint API — ils vivent entièrement dans
`app/config/language-goals.ts` (id/icône/teinte) et les traductions
`i18n/locales/{fr,en}.json` (clés `goal.*`). Rien à câbler aujourd'hui, ce
n'est pas une question de qualité : la donnée n'existe simplement pas
côté back-office.

**Corrigé en attendant côté front (2026-08-30)** : les textes citaient
l'anglais explicitement (« Anglais professionnel », « Améliorez votre
anglais… », examens « IELTS, TOEFL, TOEIC, Cambridge » — tous propres à
l'anglais) alors que l'écran sert n'importe quelle langue du catalogue.
Les clés `goal.professional`, `goal.professionalDesc`, `goal.examsDesc`,
`goal.admissionDesc` interpolent maintenant `{language}` (le nom réel de la
langue du cours, déjà utilisé par `goal.seoTitle`) pour rester génériques
tant que ces textes restent en dur.

**Ce qu'il faut, pour rendre ces objectifs éditables depuis le back-office**
un endpoint (ex. `GET /language-goals`) exposant, par objectif :
- `id` (slug stable — sert de valeur à l'`objectif` transmis dans l'URL de
  l'étape suivante, `/offres/{slug}?objectif={id}`, donc ne doit pas changer
  une fois publié) ;
- `label` et `description` traduits (respectant l'en-tête `lang`, comme
  `/all-data` le fait déjà pour le reste du contenu éditorial) ;
- `popular` (ou équivalent) — un seul objectif porte aujourd'hui l'étiquette
  « Populaire », en dur sur le premier (`exams`) ;
- un `order` d'affichage, si l'admin doit pouvoir réordonner.

**Volontairement hors périmètre de cet endpoint** : l'icône et la teinte de
pastille (`icon`/`tint` dans `language-goals.ts`) restent des assets front,
pas du contenu éditorial — pas la peine de les administrer, un identifiant
front (`id`) suffit à les résoudre côté client, comme c'est déjà le cas.

**Point produit à trancher avec le back-office** : ces objectifs sont-ils
globaux (les 6 mêmes pour toutes les langues, ce qu'implique l'écran
actuel) ou personnalisables par langue (ex. proposer un objectif spécifique
pour le chinois qui n'aurait pas de sens pour l'espagnol) ? La réponse
change la forme de l'endpoint (`GET /language-goals` global vs `GET
/courses/{slug}/goals` par langue) — à clarifier avant de le spécifier
définitivement.

## 16. 🔴 Espace professeur (`qiryna-backoffice`) — la visio ne se connecte plus, SDK Zoom obsolète

**Pas un bug de `qiryna-front`** — reproduit par le responsable en direct
(2026-08-30) sur `admin.stage.qiryna.com/espace-professeur/meeting/{id}`,
qui vit entièrement dans `qiryna-backoffice` (`resources/js/Pages/
AuthTeacher/Meeting.vue`), une application distincte de ce dépôt. Signalé
ici uniquement parce que ça bloque le même parcours (séance de cours) que
la visio élève tout juste câblée côté front, et que je n'ai ni accès de
déploiement ni le code source modifiable de ce dépôt-là depuis ici.

**Symptôme** : en rejoignant une séance en tant que professeur, la page
affiche indéfiniment un spinner de chargement, avec un bandeau Zoom natif
« UIKit : la version actuelle du SDK n'est plus prise en charge, veuillez
passer à la dernière version. » — la session ne se connecte jamais.

**Cause probable** : `qiryna-backoffice/package.json` épingle `@zoom/
videosdk-ui-toolkit` en `^1.10.8-2` — un composant de plus haut niveau que
le `@zoom/videosdk` (SDK brut) utilisé côté front pour l'élève, propre au
côté professeur (`uitoolkit.joinSession(...)` dans `Meeting.vue`).
`npm view @zoom/videosdk-ui-toolkit versions` liste la dernière version
publiée à `2.5.0-1` : la ligne `1.x` est plusieurs versions majeures
derrière, cohérent avec un rejet côté service Zoom plutôt qu'une panne
locale.

**Ce qu'il faut** : dans `qiryna-backoffice`, monter `@zoom/
videosdk-ui-toolkit` vers une version `2.x` récente, vérifier que `config`
(`videoSDKJWT`/`sessionName`/`userName`/`features`/`language`) et l'API
`uitoolkit.joinSession/onSessionClosed/onSessionJoined` n'ont pas changé de
signature entre les deux versions majeures, puis redéployer. Le SDK brut
utilisé côté élève (`@zoom/videosdk`, front) n'est pas concerné — versions
et paquets différents, aucune action nécessaire de ce côté.

## 17. 🔴 Onglet « Notification » (`/messages`) — seul le nouveau message écrit dans `notifications`

**Câblé** (2026-08-30) : `/messages` a désormais deux onglets réels — Messages
(`GET /user/messages`, déjà utilisé par `/reglages/contact`) et Notification
(`GET /user/notifications`, `unread-count`, `{id}/read`, tous déjà exposés côté
`qiryna-backoffice` et fonctionnels). Rien de mock : les deux onglets affichent
ce que l'API renvoie, vide compris.

**Ce qui manque** : `NotificationController`/`AppNotification` existent et
fonctionnent, mais un seul déclencheur les utilise —
`MessageController::sendMessage` (nouveau message reçu). Tous les autres
événements listés par le produit pour cet onglet (confirmation d'achat/
paiement, mise à jour de statut de commande, confirmation d'inscription à une
formation, rappel avant séance) ont chacun leur classe `Notification` dédiée
(`OrderCompletedNotification`, `OrderVerificationStatusNotification`,
`PlanningReminderNotification`, `CourseExpiryWarningNotification`…) mais leur
`via()` ne renvoie que `['mail']` — rien n'est écrit dans la table
`notifications`, donc rien n'apparaîtra jamais dans ce flux tant que ces
classes ne gagnent pas `'database'` dans leur `via()` (comme
`AppNotification`, qui est déjà générique et conçue pour ça d'après son
commentaire source : *"Use for any event that should appear in a user's
notification feed (new message, order update, etc.)"*).

**Ce qu'il faut, côté `qiryna-backoffice`** : pour chaque événement que le
produit veut voir dans ce flux, soit ajouter `'database'` au `via()` de la
notification existante (avec un `toArray()`/`toDatabase()` qui produise
`{type, title, body, url}`, la forme lue par `NotificationResource`), soit
faire `->notify(new AppNotification(...))` en plus de l'e-mail au même endroit
que l'action déclenchante — exactement le patron déjà en place dans
`MessageController::sendMessage`. Sans ça, l'onglet restera généralement vide
pour un compte qui n'a jamais reçu de message d'un conseiller, même actif sur
la plateforme (commandes payées, formations en cours…).

## 18. ✅ Contourné : `POST /send-email` plante sans le champ `phone`

**Reproduit en direct** (2026-08-30, en rendant `/reglages/contact`
accessible sans connexion — voir commit du jour) : notre nouvelle route
publique n'envoyait pas de champ `phone` (le formulaire ne le demande pas),
et `POST /send-email` répondait **500** (page d'erreur Laravel brute, pas un
422 de validation).

```
curl -X POST https://admin.stage.qiryna.com/api/send-email \
  -d '{"first_name":"Test","last_name":"Automatique","email":"...","subject":"general","message":"..."}'
→ 500 Internal Server Error
```

**Cause** : même motif exactement que le point 10 (`lc_country_id`).
`FrontendDataController::sendEmail()` valide `phone` en `nullable` (optionnel),
mais `MessageAction::sendEmail()` y accède ensuite sans repli :

```php
Notification::route('mail', ...)->notify(
    new ContactMailNotification(
        ...
        phone: $inputs['phone'],   // plante si la clé est absente
        ...
    )
);
```

`attachment`/`image`, juste en dessous, ont bien `?? null` — seul `phone` en
est privé. Confirmé qu'envoyer `phone: ""` explicitement suffit (201, e-mail
bien reçu par le réglage `site.email`).

**Contourné côté front** (`server/api/bff/messages/public.post.ts`) : envoie
désormais `phone: ''` à chaque appel. **Ce qu'il faut, côté API** :
`'phone' => $inputs['phone'] ?? null,` (une ligne, comme le correctif déjà
appliqué à `lc_country_id`) — le contournement front reste inoffensif après
correction, pas la peine de le retirer.

## 19. 🔵 Suggestion : un vrai champ dédié pour « Points forts » (fiche école)

**Pas un bug côté front** — corrigé le 2026-08-31 : la fiche école
(`/destinations/{slug}/ecoles/{ecole}`, onglet « Points forts ») n'affichait
que le libellé du champ (littéralement « Points Forts »), jamais son contenu
réel. `School.details[]` est un mécanisme de champs additionnels
**génériques** (libellé + description libres, saisis par l'admin), pas un
champ dédié — l'admin utilise la convention `title: "Points Forts"` pour ce
qui doit apparaître dans cet onglet, mais rien ne garantit cette
orthographe/cette convention dans le temps (accent, casse, pluriel…). Le
front fait maintenant `details.find(d => d.title.trim().toLowerCase() ===
'points forts')`, tolérant sur la casse — mais une faute de frappe de
l'admin dans le libellé (« Point fort », « Points forts de l'école »…) fait
silencieusement disparaître le contenu de l'onglet, sans erreur nulle part.

**Suggestion** (remontée par le responsable) : un vrai champ dédié
`points_forts` (ou équivalent) sur `SchoolFile`/`School`, au même titre que
`description`/`subtitle`, plutôt que de dépendre d'une convention de nommage
dans un champ générique. Fiabilise l'onglet et évite qu'un renommage anodin
dans l'admin casse silencieusement l'affichage.

## 20. ✅ Résolu : `grade`/`duration` par formation + endpoint dédié (fiche école)

Écrit initialement le 2026-08-31 comme suggestion (chaque formation n'avait
que `title`/`description` côté back-office, un mock front devinait grade/
durée depuis le titre — retiré le même jour, `-` en repli). **Déjà résolu
au moment de l'écriture** : le commit `591cc9a` (Prosper, poussé sur
`staging` la veille) avait ajouté exactement ces deux champs **et** un
endpoint dédié, `GET /schools/{id}/formations` — la suite du point 12
ci-dessus (formations d'école) était donc déjà traitée sans qu'on le sache.

Câblé côté front le jour même :
- `server/api/bff/schools/[id]/formations.get.ts` (nouveau) : relaie
  l'endpoint dédié, adapté via `toFormations()` (déjà exportée).
- `schoolRepo.formations(schoolId, locale)`.
- `[school].vue` : l'onglet Formations vient de cet appel dédié, plus de
  `/all-data` — `School` (contrat) ne porte plus `formations` du tout.

**Piège rencontré en vérifiant** : juste après le push, la route répondait
encore avec la forme **paginée** de `GET /schools/{countryId}/{areaId}`
(route préexistante — `/schools/{n'importe quoi}/{n'importe quoi}` la
matchait aussi, y compris `/schools/{uuid}/formations`), signe que le
déploiement n'avait pas encore rattrapé le commit. Revérifié quelques
minutes plus tard : réponse correcte (`[{title, description, grade,
duration}]`). Si un futur endpoint fraîchement ajouté par le back-office
semble ignorer son propre code, revérifier après quelques minutes avant de
conclure à un bug plutôt qu'à un déploiement encore en cours.

## 21. 🔴 Bloquant : résoudre un slug en UUID pour `/schools/{id}` et `/areas-of-studies/offer/{id}`

Plan de priorité transmis par Prosper (par le responsable, 2026-08-31) pour
sortir la fiche école et la page offre de `/all-data`, dans l'ordre :

1. Fiche école → `GET /schools/{id}` + `GET /schools/{id}/formations` — 85 %
   du poids d'un coup. Formations déjà câblées côté front (point 20).
2. `/offres/[domaine]` → `GET /areas-of-studies/offer/{id}` — 13 % de plus.
3. Listes destinations/écoles → `GET /school-files` + `GET /schools/
   {countryId}/{areaId}` — déjà utilisé pour ce second endpoint.

**Ce qui bloque les points 1 et 2** : ces deux routes n'acceptent que
l'UUID — `SchoolAction::get()` fait `School::find($schoolId)`,
`OfferAction::get()` fait `Offer::find($offerId)`, aucune des deux ne
cherche par slug. Le front, lui, route ces deux écrans **par slug**
(`/destinations/{destSlug}/ecoles/{schoolSlug}`, `/offres/{offerSlug}`) —
un choix voulu pour des URL lisibles et partageables, à ne pas changer pour
router par UUID à la place (casserait les liens déjà partagés et le
référencement, ces deux écrans ayant un SEO réel — `useContractSeo`/
`useSchoolSchemaOrg`). Aucune route de résolution slug→UUID n'existe
aujourd'hui pour ni l'une ni l'autre ressource.

**Demande** : un petit endpoint de résolution par slug pour chacune des
deux ressources — par exemple :

- `GET /schools?slug={slug}` (ou `/schools/by-slug/{slug}`) → l'école
  complète directement (économise un aller-retour côté front, qui a de
  toute façon besoin de la fiche entière juste après).
- Pour l'offre, l'équivalent : `GET /areas-of-studies/offer/by-slug/{slug}`
  — ou si plus simple côté back-office, un moyen de la retrouver depuis le
  domaine d'études (l'offre est déjà rattachée à un `AreaOfStudy`).

Une fois ces deux résolutions disponibles, les deux écrans peuvent
abandonner `/all-data` en entier (pas seulement les formations).

**Décidé avec le responsable (2026-08-31)** : ne pas contourner côté front
en attendant (ex. faire transiter l'UUID via la navigation interne depuis
les pages de liste) — remonter le besoin à Prosper plutôt que maintenir un
contournement.

## 22. 🔴 Parcours cours de langue : étapes de checklist fictives après la planification

Analyse du parcours client complet (relu avec le responsable, 2026-09-01),
confronté au code front **et** back-office. Tout ce qui précède la
planification des séances fonctionne réellement (achat, paiement, e-mail de
confirmation, choix du professeur, réservation de créneau, rappel avant
séance, visio Zoom). À partir de là, trois maillons sont **fictifs** :

**1. Le test de niveau n'est jamais réellement déclenché pour une commande
de langue.** `ETestingAction::bookForOrder()` (réservation d'une évaluation
externe PT‑TESTS) existe et fonctionne, mais dans
`StripeWebhookController::handleCheckoutCompleted()` :

```php
if ($newStatus === OrderTrackingStatusEnum::VERIFIED && $order->service_type === Profilage::class) {
    ...->bookForOrder($order);
}
```

Filtré sur `Profilage::class` uniquement — jamais `Course::class`. Aucun
e-mail « passez votre test de niveau » n'est donc jamais envoyé pour une
commande de langue. Le modèle `Formula` (utilisé par les commandes `course`
comme par `profilage`) porte déjà les mêmes champs `etesting_type`/
`etesting_refs` : probablement réutilisable directement, à condition qu'une
formule de langue ait ce paramétrage renseigné en admin.

Symptôme révélateur côté checklist — `OrderChecklistStepEnum::courseSteps()`
marque `LEVEL_TEST` **« terminé » automatiquement à l'achat** :
```php
// Cours : inscription + test de niveau terminés à l'achat, "cours en cours" actif, reste à venir.
Course::class => [OrderChecklistStepEnum::courseSteps(), 3, 4],
```
Le pourcentage affiché côté front (`orderChecklistProgress`, câblé le
2026-08-31) est un reflet honnête de cette donnée — mais la donnée
elle-même compte un test jamais passé comme fait.

**2. `MIDTERM_EVALUATION` et `FINAL_CERTIFICATION` ne sont l'un ni l'autre
reliés à quoi que ce soit de réel.** Aucune notification n'existe pour
« résultat d'évaluation disponible » ni « certification disponible »
(`app/Notifications/` ne contient que paiement, rappel de séance, expiration
de cours, statut de vérification). Aucun mécanisme ne permet à l'équipe
Qiryna de déposer un résultat d'évaluation ou un certificat de fin de
formation contre une commande — voir point 23, ce besoin est commun aux
autres parcours.

**3. `mon-projet/langues/certification.vue` (front) est un mockup, pas un
écran incomplet.** `100%` codé en dur, 4 étapes toutes « done » codées en
dur, bouton « Voir mon rapport » sans action, page non paramétrée par
commande (pas de `courseId`/`orderId` dans la route). À reconstruire une
fois les points 1 et 2 réglés — inutile avant.

**Aujourd'hui, le seul chemin vers 100 %** : bascule manuelle par un employé
depuis le back-office (`Order/Edit.vue`, `OrderController::
updateChecklistItem`, déjà fonctionnel pour n'importe quelle étape) — rien
n'automatise `midterm_evaluation`/`final_certification`.

## 23. 🔴 Mécanisme générique manquant : livrables de commande (résultats, rapports, certifications, documents utiles)

En vérifiant le point 22, le même trou se retrouve **à l'identique** sur
les autres parcours à checklist — pas la peine d'attendre une relecture
narrative de chacun, le code des checklists suffit à le confirmer :

- **Logement** (`OrderChecklistStepEnum::livingSteps()`) : `HOUSING_SHEET`
  (fiche logement), `NEIGHBORHOOD_SHEET` (fiche quartier) et
  `CONTRACT_SIGNED` (contrat signé) sont des étapes qui, par nature,
  devraient chacune livrer un document — recherché dans tout le code
  (front + back), **aucune des trois n'a de mécanisme de dépôt/consultation,
  seulement le libellé de l'étape**.
- **Admission école** (`schoolSteps()`) : `ADMISSION_OBTAINED` (dernière
  étape) — l'obtention d'une admission s'accompagne normalement d'une
  lettre d'acceptation ou d'un document équivalent délivré par l'école,
  aujourd'hui sans aucune place pour l'accueillir.
- **Langue** (`courseSteps()`) : rapport de test de niveau, certificat de
  fin de formation — voir point 22.
- **Orientation** : seul cas déjà résolu, mais par un mécanisme différent —
  `ETestingEvaluation`/`orientationEvaluationRepo.pdf()` sert des PDF
  **générés par le service externe PT‑TESTS**, pas déposés par un employé.
  Ne couvre donc que ce que PT‑TESTS produit lui-même, rien qu'un
  conseiller Qiryna voudrait ajouter à la main.

**Ce qui existe déjà et ne convient pas à ce besoin** :
`ClientPostPurchaseData`/`ClientDataController` est un mécanisme de dépôt
de documents, mais dans le sens **client → dossier** (pièce d'identité,
diplôme, certificat de langue *fourni par le candidat* pour son admission).
Le besoin ici est inverse : **Qiryna/l'équipe → client**, un document ou
résultat que le client doit recevoir/consulter, pas fournir.

**Suggestion** : un mécanisme générique par commande plutôt que quatre
solutions ad hoc — par exemple une table `order_deliverables` (ou un champ
JSON sur `Order`, au même modèle que `SchoolFile.stats`/`details`) avec au
minimum `order_id`, `label` (libellé libre ou lié à un `step_key` de
checklist), `type` (rapport, certificat, document), `file_path` ou
`external_url`, `delivered_at` — visible et gérable depuis `Order/Edit.vue`
côté admin, exposé en lecture par l'API pour l'espace client. Un seul
mécanisme, réutilisable pour la fiche logement, la fiche admission, le
rapport de langue et tout futur parcours à checklist.

**Sur la suite** : le responsable a proposé deux options — (a) attendre et
faire la même relecture de parcours client pour chacun des 3 autres
parcours existants avant d'élaborer un chantier back-office consolidé, ou
(b) avancer cas par cas. Vu que la vérification ci-dessus n'a demandé
qu'une relecture des checklists déjà en main (pas une nouvelle narration
complète par parcours), **cas par cas est déjà possible sans attendre** :
les besoins concrets par parcours sont listés ci-dessus, suffisants pour
lancer un chantier back-office unique et bien élaboré dès maintenant,
plutôt que quatre demandes séparées dans le temps.

## 24. 🔴 Verrou « test de niveau » avant planification (`/mon-projet/langues`) — remis en front à titre cosmétique, pas de contrôle réel possible aujourd'hui

**Demande produit (2026-09-02)** : sur `/mon-projet/langues`, l'accès aux
onglets « cours planifiés »/« à planifier » et au bloc « prochain cours » ne
doit s'ouvrir qu'une fois le test de niveau du client validé — jusque-là,
seule une carte « Votre test de niveau » avec un CTA doit s'afficher.

**Remis en front, mais purement cosmétique** (`mon-projet/langues/index.vue`,
`mockEtape`) : le CTA pose `?etape=2` dans l'URL, sans aucun appel API — état
non persisté (perdu au rechargement sans le paramètre), contournable en
éditant l'URL à la main. Réintroduit tel quel car **le point 22 a déjà établi
qu'aucune donnée réelle n'existe pour distinguer** un client qui a passé son
test de niveau de celui qui ne l'a pas passé : `ETestingAction::bookForOrder()`
n'est jamais déclenché pour une commande `Course` (filtré sur
`Profilage::class` uniquement), et `OrderChecklistStepEnum::courseSteps()`
marque `LEVEL_TEST` « terminé » automatiquement à l'achat, sans rapport avec
un test réellement passé.

**Ce qu'il faut pour remplacer ce mock par un vrai verrou** — reprend
exactement la correction déjà proposée au point 22 :
1. Débrider `StripeWebhookController::handleCheckoutCompleted()` pour
   déclencher `ETestingAction::bookForOrder()` aussi sur `Course::class` (pas
   seulement `Profilage::class`), à condition qu'une formule de langue porte
   bien `etesting_type`/`etesting_refs` en admin.
2. Exposer un statut réel et interrogeable côté client — soit via
   `GET /etesting/evaluations` (déjà utilisé côté orientation,
   `orientationEvaluationRepo`) filtré par commande, soit un champ dédié sur
   l'`Order`/le `Course` (`level_test_status` ou équivalent) si le test de
   niveau langue ne doit pas forcément passer par PT-TESTS.
3. Une fois ce statut réel disponible, `mockEtape` se remplace par une
   lecture de ce statut (`etat_eval`/équivalent) — le front sait déjà
   dériver un affichage à 3 états depuis ce genre de donnée (voir
   `mon-projet/orientation.vue`/`useOrientationData.ts`, même famille de
   problème côté profilage).

**Tant que ceci n'est pas fait** : le verrou actuel est un théâtre de
validation, pas un contrôle — n'importe quel client peut le contourner en
ajoutant `?etape=2` à l'URL. Acceptable temporairement sur demande explicite
du responsable, mais à ne pas présenter comme un vrai contrôle métier.

## 25. 🔴 Logo (clair/sombre) et favicon administrables — actuellement des fichiers statiques du dépôt

**Contexte (2026-09-04)** : le mode sombre est maintenant fonctionnel côté
front (`app/assets/css/main.css`, `theme.store.ts`). Un point reste bloquant :
le logo est une **image raster figée dans le dépôt**
(`AppLogo.vue` → `public/img/logo.webp`, wordmark noir sur fond transparent),
illisible sur fond sombre — aucune CSS ne peut « éclaircir » un texte déjà
cuit dans les pixels d'un PNG/WebP. Le favicon (`public/favicon.ico`, ajouté
le 2026-09-03) est dans la même situation : un fichier statique, jamais
administrable.

**Ce qu'il faut côté back-office** — trois champs image dans le bloc `site`
déjà existant (`Setting::key = 'site'`, le même mécanisme que
`name`/`email`/`phone` gérés par `SettingController`) :

| Champ | Rôle |
|---|---|
| `logo_light` | Logo affiché en thème clair (remplace l'actuel `logo.webp`) |
| `logo_dark` | Logo affiché en thème sombre — fond transparent, wordmark clair |
| `favicon` | Icône d'onglet — idéalement fournie en `.png` (multi-tailles) plutôt qu'`.ico`, plus simple à uploader/valider côté admin |

**Backend, par analogie avec `SettingController::homeUpdate()`** (seul
endroit du contrôleur qui gère déjà un upload de fichier — `og_image`,
`storeAs('photos/home_page/seo', …, 'public')`) : `SettingController::update()`
ne gère aujourd'hui que des valeurs texte fusionnées telles quelles
(`array_merge($existing, $value)`) — il faut lui ajouter le même traitement
`UploadedFile` que `homeUpdate()`, pour ces trois clés spécifiquement, avant
la fusion dans `site` (stocker le **chemin** retourné par `storeAs()`, pas le
fichier lui-même — supprimer l'ancien fichier au remplacement, comme
`homeUpdate()` le fait déjà pour `slides`/`steps`). Ajouter `logo_light`,
`logo_dark`, `favicon` à `SettingController::PUBLIC_SITE_FIELDS` (page
Paramètres générale, pas « Clés & Intégrations » — ce ne sont pas des
secrets).

**Admin (`resources/js/Pages/Setting/Index.vue`)** : `siteForm` n'a
aujourd'hui que des champs texte (`InputField`) — ajouter trois champs de
type fichier (image) pour `logo_light`/`logo_dark`/`favicon`, avec aperçu de
l'image actuelle comme le fait déjà `Setting/Home.vue` pour `og_image`.

**API publique** : exposer ces trois chemins dans la réponse de
`/all-data` → `settings.site` (déjà lu par `toSiteSettings()` côté front,
`app/core/adapters/common.adapter.ts:131`) — mêmes conventions que les
autres images du site (`Storage::disk('public')->url(...)`, voir
`SchoolResource`/`AreaResource`).

**Côté front, une fois ces champs disponibles** (pas encore fait, à la
charge du front une fois le backend prêt) :
- `SiteSettings` (contrat + `toSiteSettings()`) : ajouter `logoLight`,
  `logoDark`, `favicon` (repli sur `null` → `AppLogo.vue` garde
  `/img/logo.webp` en dur tant que rien n'est renseigné, comme aujourd'hui).
- `AppLogo.vue` : choisir `logoLight`/`logoDark` selon `useThemeStore().htmlAttr`
  résolu (pas juste `preference`, qui vaut aussi « système » — il faut la
  valeur **effective**, y compris quand elle vient de la media query, donc
  probablement `prefers-color-scheme` lu côté client en plus du store).
- Favicon : posé via `app.head.link` (`rel: 'icon'`), remplace l'actuel lien
  statique de `nuxt.config.ts`/`public/favicon.ico`.

**Pas bloquant pour la production** : le logo reste lisible en thème clair
(le mode par défaut), qui restera probablement le choix de la plupart des
visiteurs pour un moment — mais à faire avant de mettre le sélecteur de
thème en avant dans le produit.

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
