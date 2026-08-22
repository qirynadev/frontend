# Directives back-office/API restantes — reconnexion mocks → réel (2026-08-22)

Suite à la session de reconnexion des écrans `mon-projet` et `offres` sur la
branche `app` (voir `MEMORY.md` / commit du jour). Pour chaque point : ce qui
manque ou est de qualité insuffisante côté API, et la forme attendue pour
pouvoir brancher l'écran sans dégrader le rendu que Kader a livré.

Convention : 🔴 aucune donnée du tout · 🟠 donnée présente mais de qualité
insuffisante (placeholder/test) · 🔵 question de sémantique/produit à trancher
avant de câbler quoi que ce soit.

## 1. 🟠 Offres domaine — prestations (`OfferTierCard`, mode `domain`)

`GET /all-data` → `offers[].items[].title` (consommé via `tier.features`).
Contenu vérifié en direct sur les 8 domaines (2026-08-22) :

| Domaine | Qualité constatée |
|---|---|
| Ingénierie | ✅ réel, 4 items rédigés et distincts |
| Management | ⚠️ réel mais **item 3 dupliqué** (la phrase "Dossier de candidature — …candidatures." apparaît deux fois collée) |
| MBA | ✅ réel, 7 items rédigés |
| Sciences exactes | 🔴 placeholder (« Enim sunt aut rerum », « Et laboriosam iure »…) |
| Architecture | 🔴 placeholder (« Qui rerum est est a »…) |
| Droit | 🔴 test/placeholder (« Lorem ipsum… », « tierco element to include here ») |
| Sciences humaines | 🔴 placeholder, 1 seul item (« Sed tempor voluptas ») |
| Médecine | 🔴 la même ligne « Lorem ipsum dolor sit amet… » répétée 4 fois |

**Pourquoi ça bloque** : `OfferTierCard.vue` (mode `domain`) affiche
aujourd'hui une liste fixe de 5 prestations (`DOMAIN_OFFER_FEATURE_IDS`,
`app/config/offer-domain-features.ts`) au lieu de `tier.features`, précisément
pour ce motif — un remplacement uniforme, pas conditionnel. Basculer
domaine par domaine sur la vraie donnée créerait une incohérence (contenu
correct sur 3 domaines, charabia sur 5) plutôt qu'une amélioration.

**Ce qu'il faut** : pour chacun des 5 domaines marqués 🔴, un contenu éditorial
réel et distinct (4 à 5 lignes, format libre court comme sur Ingénierie/MBA,
sans lorem ipsum ni texte de remplissage) ; et sur Management, retirer la
duplication de l'item 3. Une fois les 8 domaines à niveau, `OfferTierCard`
peut repasser sur `tier.features` partout et `offer-domain-features.ts`
peut être retiré.

## 2. 🔴 Fiche école — grade et durée de formation

`GET /all-data` → `schoolSheets[*].schools[*].formations[]` : vérifié sur les
1011 formations renvoyées (toutes écoles/destinations confondues), le champ
ne porte que `{title, description, description_en}` — **aucun champ
`grade` ni `duration`/`duration_label`**, sur aucune des 1011 lignes.

**Ce qu'il faut** : exposer `grade` (ex. « Grade Master », « Grade Bachelor »)
et `duration` (ex. « 2 ans », « 12 à 18 mois ») par formation. En attendant,
`app/config/formation-meta-mock.ts` (`resolveFormationMeta`) infère une valeur
plausible depuis le titre (Bachelor/Master/MBA/Mastère) — déjà en place,
documenté, pas de changement nécessaire côté front tant que l'API ne porte
pas ces champs.

## 3. 🟠 Professeur — qualification (`formations[].diploma`)

`GET /teachers`, `GET /user/plannings/teachers/{courseId}` : chaque professeur
a bien un champ `formations[].diploma`, mais qualité inégale, vérifiée sur
les deux coachs de test (2026-08-22) :

- Pierre Mouton → `diploma: "Master"` (réel, exploitable)
- Wing Meyers → `diploma: "Animi nobis expedit"` (texte de test/faker, pas
  une qualification)

**Ce qu'il faut** : s'assurer que chaque profil coach publié porte un
diplôme/certification réel dans `formations[].diploma` avant de l'afficher —
avec un seul profil « Animi nobis expedit » en production, ce champ reste en
mock (`langueTeachersMock`) le temps que l'admin nettoie les fiches existantes.

## 4. 🔵 Professeur — badge « vérifié » : quelle sémantique ?

`user.email_verified_at` existe et est renseigné (non `null`) pour les deux
coachs de test, ce qui en ferait un candidat pour le badge vérifié de la
maquette (`langueTeachersMock[*].verified: true`). Mais ce champ semble être
une confirmation d'e-mail technique posée à la création du compte, pas un
statut de vérification "professionnelle" du profil (diplômes/identité
contrôlés par un humain) que le badge est censé représenter visuellement.

**Question à trancher avec le responsable/produit** avant de câbler quoi que
ce soit : le badge doit-il refléter `email_verified_at`, ou faut-il un champ
dédié côté back-office (`is_verified_coach` ou équivalent) alimenté par un
contrôle humain ? Tant que ce n'est pas tranché, le badge reste en mock
(`verified: false` réel, jamais affiché pour les vrais professeurs) plutôt que
d'afficher une vérification qui ne voudrait rien dire.

## 5. 🔴 Certification langue (`/mon-projet/langues/certification`)

Aucun endpoint API ne couvre ce parcours (statut de certification, date
d'obtention, lien de téléchargement). L'écran reste 100 % Figma
(`langueCertificationPct`/`langueCertificationSteps`, tous deux à `done`/100 %
en dur). **Ce qu'il faut** : un endpoint exposant, par langue/commande, l'état
réel de la certification (non commencée / en cours / obtenue + lien du
certificat) si ce parcours doit devenir un vrai suivi plutôt qu'un écran
vitrine.

## 6. 🔴 `/mon-projet/apercu` — RDV conseiller

Trois éléments sans aucune contrepartie API :
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

**Ce qui bloque un câblage direct** : cet écran fusionne **plusieurs**
commandes par langue (règle métier confirmée le 2026-08-17 — deux achats
d'Anglais deviennent une seule carte). Si ces commandes ont des checklists à
des stades différents, quelle règle afficher (la plus avancée ? la plus
récente ? une moyenne) ? **Question produit à trancher avant tout câblage** —
en l'absence de règle validée, la barre reste statique plutôt que d'inventer
une agrégation.

## Pour mémoire — pas des écarts, aucune action requise

- **Prix professeur « à partir de »** (`docs/mon-projet-professeur-mocks.md`) :
  la maquette Figma elle-même affiche « - », conforme à l'absence de prix par
  professeur côté API (le prix est au niveau de la formule, pas du prof).
- **Pays / drapeau professeur** et **disponibilité** : résolus cette session
  (voir compte-rendu) — `country.name`/`country_flag` et le premier créneau
  libre de `plannings[]` sont réels et fiables, câblés dans
  `planning.adapter.ts` (`toTeacher`) et consommés par `professeur.vue` /
  `planifier.vue` via `app/utils/teacher-availability.ts`.
