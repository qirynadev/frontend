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

## 8. Optimisation API — sortir progressivement de `/all-data`

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
