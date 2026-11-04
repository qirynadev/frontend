# Qiryna : point du projet au 1er novembre 2026

Document de contexte destiné à un assistant (Claude) chargé de produire la liste exhaustive des tâches et actions à mener avant la mise en ligne du site et des applications mobiles Android et iOS.

État établi le 1er novembre 2026 à partir du code des trois dépôts, d'une lecture des **contenus réels de production** (servis par admin.qiryna.com, lus via danube.qiryna.com), de sondes publiques sur les domaines et des précisions de Victor. Un point non vérifié est signalé comme tel : ne le tiens pas pour acquis.

---

## 0. Ce que j'attends de toi (consigne pour l'assistant)

**Date cible de mise en production : 15 novembre 2026** (deux semaines).

À partir de ce document, établis la liste **exhaustive** des tâches et actions à réaliser avant la mise en ligne publique :

1. du **site web** (qiryna.com) ;
2. du **back-office** de production (admin.qiryna.com) ;
3. du **LMS** (lms.qiryna.com) : au lancement, **seulement le test de niveau** ;
4. des **applications mobiles Android et iOS** (Capacitor).

Pour chaque tâche, indique :
- le domaine (technique, contenu, juridique, stores, infrastructure, sécurité, mesure d'audience, tests, organisation) ;
- qui la porte (Victor, Doungnan, Prosper, Kader ou Claude) ;
- si elle est **bloquante pour le 15 novembre** ou peut suivre ;
- ses dépendances et une estimation grossière.

Ordonne par ordre d'exécution, en commençant par ce qui est long : comptes développeur, vérifications d'identité, revues Meta, Apple et Google. Dis clairement ce qui tient en deux semaines et ce qui ne tient pas. Propose un découpage (lancement du site le 15, applications ensuite) si c'est plus réaliste.

Signale aussi les **risques** (revue Apple, règles de paiement des stores, données personnelles, allégations publicitaires), les **décisions** à prendre avec leurs options, et les **informations manquantes** : pose-moi les questions plutôt que de supposer.

Contrainte forte : **l'équipe n'a ni Mac ni iPhone**. La distribution iOS de test est prévue via **TestFlight**. TestFlight ne règle que la distribution : il reste à organiser la compilation et la signature sans Mac, ainsi que l'accès à un iPhone pour les essais sur appareil réel (voir §6.3).

---

## 1. Le produit

Qiryna accompagne des étudiants (surtout francophones) dans un projet d'études à l'étranger. Le site est bilingue français / anglais. Quatre services payants :

| Service | Ce que le client achète | Fonctionnement |
|---|---|---|
| **Admission (écoles)** | Une formule d'accompagnement par domaine d'études (Management, Ingénierie, Médecine, Droit, Architecture, Classes prépa, Science politique, MBA) | Pages destinations et fiches écoles. Après achat : suivi du dossier, dépôt de documents par pièce, mentor attribué par l'équipe. |
| **Cours de langue** | Une formule par langue (français, anglais, allemand, espagnol). Paliers Volta, Ogooué, Zambèze, plus une formule gratuite « Test Free » sur deux langues. | Choix du professeur, planification des séances, visio **Zoom intégrée**, séances de groupe, **test de niveau obligatoire dans le LMS** avant la première séance. Le niveau choisi à l'achat est **indicatif** (sans effet sur le prix) ; le niveau mesuré sert à l'équipe et aux professeurs pour adapter les cours. |
| **Hébergement** | Une formule de recherche de logement par pays (Colorado, Zambeze, Amazone) | Formulaire de préférences après achat, suivi par l'équipe. |
| **Orientation (profilage)** | Une formule de bilan (Étudiant, Salarié, Spécialiste RH) | Parcours prévu au lancement : e-mail de confirmation à l'achat, puis communication ultérieure d'une date de test (voir ci-dessous). Une fois le test ouvert : bilan PDF et restitution. |

Espace client « Mon projet » (suivi par service), messagerie avec l'équipe, notifications.

**Paiement et tarifs** : paiement par **Stripe**. Au lancement, les tarifs de référence sont ceux enregistrés dans Stripe. Tous les produits et tarifs des formules des rubriques disponibles ne sont pas encore créés dans Stripe : leur ajout est à faire avant le lancement.

Point d'attention constaté dans le code : le site affiche le prix saisi dans le back-office (`amount`), alors que Stripe encaisse le tarif rattaché à la formule (`stripe_product_id`). Les deux valeurs sont indépendantes. La commande enregistre aussi le prix du back-office (`montant`). Le formulaire des formules d'accompagnement signale un écart sans le bloquer. Chaque prix du back-office doit donc être aligné sur son tarif Stripe, sinon le client verrait un montant et en paierait un autre.

**PT-TESTS / orientation** : l'API est actuellement configurée en mode de préproduction, et le mode production ne sera pas activé au lancement. Après l'achat d'une formule d'orientation, le client recevra un e-mail de confirmation, puis une communication ultérieure lui indiquera la date de son test d'évaluation. Le mode production et l'ouverture des tests sur E-testing seront activés seulement après quelques commandes payées. Le code ne réalise pas encore ce parcours : voir §5.1.

---

## 2. Équipe et responsabilités

| Personne | Rôle |
|---|---|
| **Victor** | Responsable technique du projet. Développe et améliore le site et le back-office avec Claude Code ; confie à Prosper des tâches back-end / back-office et les travaux de l'application mobile. |
| **Doungnan** | Promoteur du projet ; responsable des contenus. |
| **Prosper** | Prend en charge les tâches back-end / back-office confiées par Victor et les travaux de l'application mobile. A construit la branche mobile Capacitor et **a déjà produit un APK** Android signé (version 1.0.1, code 2). |
| **Kader** | Design (Figma) et intégration des écrans ; livre sur la branche `main` du site. |
| **Claude** (Claude Code) | Outil utilisé par Victor pour développer et améliorer le site et le back-office. Dans les attributions de tâches ci-dessous, « Claude » désigne le travail technique réalisé avec Claude Code, sous le pilotage de Victor. |

Victor pilote la partie technique ; Doungnan porte les contenus. Les tâches spécifiques attribuées à Prosper et Kader sont à confirmer avec eux si leur périmètre évolue.

---

## 3. Architecture, environnements, hébergement

### 3.1 Environnements

| Rôle | Site | Back-office / API | Hébergement back-office | Branches |
|---|---|---|---|---|
| Recette | my.qiryna.com | myadmin.qiryna.com | VPS **OVH** | site `app`, back-office `staging` |
| Démonstration | danube.qiryna.com | **admin.qiryna.com** | VPS **IONOS** | site `danube`, back-office `main` |
| **Production** | **qiryna.com** | **admin.qiryna.com** | VPS **IONOS** | site `main`, back-office `main` |
| LMS | lms.qiryna.com | lié à admin.qiryna.com | VPS **IONOS** | dépôt `qiryna-lms` |

- Le site, le back-office et le LMS de production sont sur le VPS **IONOS** (vérifié le 2 novembre par appel direct du serveur). La recette back-end **myadmin.qiryna.com** est hébergée sur le VPS **OVH**, qui porte aussi les boîtes @qiryna.com et le PMP. Les domaines concernés par les environnements sont **danube.qiryna.com**, **admin.qiryna.com**, **qiryna.com**, **lms.qiryna.com** et **my.qiryna.com**.
- **Tous les domaines sont déjà sur Cloudflare** (confirmé par Victor ; constaté le 1er novembre sur my, myadmin, danube, admin et lms, en-tête `Server: cloudflare`). qiryna.com y est ajouté depuis le 31 octobre : le site y est déployé et répond 403 par sa page à code tant qu'il n'est pas ouvert, et www redirige vers qiryna.com. Conséquences au §5.3.
- Déploiement automatique au push : webhook Git dans Plesk pour le site, GitHub Actions (rsync, puis migrations) pour le back-office.
- Fichiers téléversés stockés sur le disque des serveurs (`storage/app/public`).

### 3.2 Site public : `qiryna-front` (GitHub `qirynadev/frontend`)

- **Nuxt 4** rendu côté serveur, serveur Node (Nitro, Passenger dans Plesk) qui sert aussi de **BFF** : le navigateur parle à `/api/bff/...`, jamais directement à l'API.
- Tailwind 4, i18n FR/EN, deux interfaces : **mobile** (complète) et **ordinateur** (partielle, voir §5.1).
- Session : cookie `httpOnly` posé par le BFF, jeton Sanctum gardé côté serveur.
- Caches serveur vidés à chaque modification du back-office par un signal signé, à condition que les variables du §5.3 soient posées sur chaque serveur.
- Push web (six événements), bannière cookies avec Google Consent Mode v2, Google Analytics 4 (identifiant réglé dans le back-office), `robots.txt` et `sitemap.xml` qui distinguent la production de la recette.
- ~340 tests Vitest.

### 3.3 Back-office et API : `qiryna-backoffice` (GitHub `qirynadev/qiryna-backoffice`)

- **Laravel 13**, Inertia 2 + Vue 3, Pest 4 (~950 tests).
- Gestion : écoles, destinations, domaines, offres, langues et formules, professeurs, mentors, hébergement, profilage, commandes et suivi, clients, messagerie, CMS (accueil, pages, FAQ, articles, partenaires, publicités), journal des actions.
- Pages publiques principales **administrables** (textes, icônes, photos) ; choix des écoles mises en avant par destination.
- Génération des fiches écoles par l'**API Claude**, relues par un admin avant publication ; règle « FR + EN complets pour publier ».
- **Connecteur MCP Claude** (OAuth, administrateurs seulement).
- L'API dispose d'un filtrage par **adresse IP** (liste blanche réglable dans le back-office). **Son efficacité actuelle n'est pas établie** : voir §5.3.
- File Laravel en base traitée par un cron chaque minute ; **pas de worker permanent**.

### 3.4 LMS : `qiryna-lms`

- Application Laravel 13 autonome (base propre), interface apprenant et gestion.
- **Test de niveau adaptatif** livré (CECRL ramené à 3 niveaux), banque de questions, génération par l'IA, audio par synthèse vocale, connecteur MCP Claude.
- Liaison avec Qiryna : connexion unique par jeton signé à usage unique, webhooks HMAC dans les deux sens. Le back-office refuse la réservation de séances tant que le test n'est pas passé.
- Activation côté back-office : `LMS_ENABLED`, `LMS_PILOT_USERS` (mode pilote), `LMS_FRONT_ENTRY_PATH` à passer à `/lms/entree`.
- **Au lancement : test de niveau seulement**, les cours viendront après.

### 3.5 Services tiers

Stripe, Zoom (Video SDK, compte et facturation au §5.3), PT-TESTS / e-testing (API en préproduction), OAuth Google et LinkedIn (fonctionnels), **Facebook (non finalisé : demande de vérification de l'application pas encore soumise dans la console Meta)**, Web Push (clés VAPID par environnement), API Claude, SMTP **configuré avec Brevo pour l'envoi des e-mails**, **Google Analytics 4 (branché, sans événements de conversion)**, **Meta Pixel (absent)**.

---

## 4. Ce qui fonctionne aujourd'hui

- Catalogue : 6 destinations, 449 fiches écoles publiées en FR et EN, domaines, langues, hébergement, orientation, MBA par zone.
- Inscription, connexion e-mail, Google et LinkedIn, mot de passe oublié, confirmation de compte.
- Tunnels d'achat des quatre services avec Stripe (clé de test en recette, clé live en production), écrans de paiement réussi, offres gratuites. Le catalogue Stripe doit encore être complété (voir §1).
- Espace « Mon projet » : suivi admission (dépôt de documents), logement (préférences), orientation (test et bilan PDF, sur l'API de préproduction ; à adapter pour le lancement, voir §5.1), langues (professeur, planification, visio Zoom, séances de groupe, test de niveau réel via le LMS).
- Messagerie (lecture des échanges) et notifications ; envoi d'un message à l'équipe par le formulaire de contact des réglages.
- Back-office complet, contenus administrables, génération IA des fiches. Affichage immédiat des modifications sur les sites : fonctionnel, mais dépendant des variables du §5.3.
- Sécurité des formulaires (IP réelle du visiteur, limites de fréquence, pot de miel, adresses jetables refusées).

---

## 5. Ce qui reste ouvert

### 5.1 Fonctionnel absent, incomplet ou factice (inspection du code du site)

**Écrans encore factices ou sans action** (visibles par les clients) :

| Où | Constat | Gravité |
|---|---|---|
| **Fiche école, version ordinateur** | Les pastilles sous le titre sont des **valeurs de maquette** : toute école dont le nom ne contient pas « université / faculté / college » affiche « Grande école, Privée, AACSB, Equis, AMBA » ; les autres « Université, Publique ». Constaté sur danube (un institut public chinois étiqueté « Privée, AACSB, AMBA »). L'API n'a ni type d'établissement ni accréditations. | **Critique** : fausses accréditations, à retirer ou à alimenter par de vraies données avant le lancement |
| Accueil (mobile) | Aucun article en production : le bloc « Actualités » affiche **deux cartes factices** de la maquette. | Élevée |
| Réglages, droits RGPD | **Fait (2026-11-02, à déployer)** : suppression de compte réelle, demandes de droits et export des données par le formulaire de contact. La règle appliquée (voir décision 4) reste à faire valider. | Bloquant stores |
| Mon projet, langues : étape « Test final » | Mène à `/mon-projet/langues/certification`, écran **100 % maquette** (progression et étapes en dur), aucun parcours de certification réel. | Élevée |
| `/mon-projet/apercu` | Écran de maquette (rendez-vous « 12 mai 2026 » en dur, cartes de services illustratives, bouton de rendez-vous sans action). Aucun lien n'y mène, mais l'adresse répond. | Moyenne (à retirer ou masquer) |
| Mon projet admission et orientation | **Fait, à déployer** : « Contacter un conseiller » ouvre le formulaire prérempli avec la commande. | |
| Mon projet logement | Encart « Documents utiles » **sans action**. | Moyenne |
| Messagerie | Fils en **lecture seule** : **fait, à déployer**, un texte renvoie au formulaire de contact. | |
| Pied de page ordinateur | Badges App Store et Google Play **sans lien**. | Faible (à relier quand les applis seront publiées, ou masquer) |
| Mentions légales | Désormais **administrables** (Paramètres > Mentions légales, français et anglais ; déployé sur admin et danube). **Contenu à saisir et valider** : directeur de la publication et médiateur encore vides, hébergeur **IONOS**, exact pour la production (qui passe aussi par Cloudflare), date « 14/08/2026 ». | **Bloquant juridique** |
| Centre d'aide, mentions légales | **Numéro WhatsApp** : nouveau champ dans Paramètres, déployé, **numéro à saisir**. Sans numéro saisi, la carte WhatsApp est masquée : elle n'utilise plus le téléphone général, qui semble factice. | Élevée |
| Paramètres du site | Téléphone de contact affiché en production **+33 6 23 91 23 45** (ressemble à un numéro factice). | Élevée |

**Fonctions qui n'existent pas** :

- Fin du parcours langue : évaluation de mi-parcours, attestation de fin de formation, dépôt du certificat par l'équipe.
- Rendez-vous avec un conseiller, « être rappelé ».
- Formulaire de contact des visiteurs : message déjà enregistré dans la messagerie du back-office, accusé de réception **fait, à déployer**.
- Page des documents remis au client par l'équipe (attend un écran de Kader).
- Réglages des notifications (carte provisoire dans l'onglet Notification).
- Enregistrement et transcription des séances Zoom : options non souscrites, et aucune lecture des enregistrements sur le site (voir §5.3).
- Plusieurs achats de la même offre : comportement à définir.
- Connexion Facebook : **vérification de l'application Meta non soumise**.

**E-mails transactionnels** : l'envoi SMTP du back-end est configuré avec Brevo. Le design des e-mails de notification reste à revoir et à valider.

**Orientation au lancement : écart entre le parcours prévu (§1) et le code actuel** :

- **Réservation automatique** : à la vérification du paiement, le back-office appelle `bookForOrder` pour les commandes d'orientation et de langue. Si la formule a un paramétrage `etesting_*`, le test est réservé chez PT-TESTS et Mon projet affiche « Passer le test » avec son lien. Au lancement, le client arriverait donc sur un test de préproduction.
- **Moyen de l'éviter sans code** : retirer ce paramétrage des formules empêche la réservation. Le paramétrage actuel en production n'a pas été vérifié.
- **Effets traités (à déployer)** : Mon projet affiche « Commande confirmée, la date de votre test vous sera communiquée », l'e-mail d'achat et l'écran de paiement réussi annoncent la date à venir. **Restent** : la façon de communiquer la date (e-mail manuel, message, automatisation) et le retrait du paramétrage des formules.
- **Ouverture des tests plus tard** : `bookForOrder` n'a qu'un seul point d'appel, et aucune commande de rattrapage n'existe. Les commandes déjà payées resteraient sans test : prévoir ce rattrapage avant d'activer le mode production.

**Mesure d'audience et marketing** :

- Google Analytics 4 chargé avec Consent Mode v2 (refus par défaut), identifiant `G-…` réglé dans le back-office. **Le même identifiant sert en recette et en production** (le trafic de test pollue les statistiques).
- **Aucun événement de conversion** (inscription, début de paiement, achat, valeur).
- **Pas de Meta Pixel** (ni Conversions API côté serveur).
- Bannière cookies : **fait, à déployer**, refuser au même niveau qu'accepter, catégories mesure d'audience et marketing séparées. Le Pixel Meta devra respecter la catégorie marketing.
- `robots.txt` et `sitemap.xml` en place ; `NUXT_PUBLIC_SITE_URL` vaut par défaut `https://web.qiryna.com` et doit être posé à `https://qiryna.com`.

**Version ordinateur : écrans encore affichés en mise en page téléphone** :

| Avec une vraie version ordinateur | Encore en mise en page téléphone sur grand écran |
|---|---|
| Accueil, connexion, inscription, mot de passe oublié | Choix du pays de destination (grille des drapeaux) |
| Page destination, liste des écoles, fiche école | Objectifs de langue (avant le choix de formule) |
| Langues, logement, formule d'accompagnement, orientation | Formules d'orientation (`/orientation/formules`) |
| Paiements réussis | Messagerie |
| Mon projet (tableau de bord) et suivi admission | Mon projet : langues, professeur, planification, visio, certification, logement, orientation, aperçu |
| Réglages (toutes les sous-pages), CGU, cookies, confidentialité | Pages CMS génériques dont la **FAQ** (`/pages/faq`), entrée LMS |

Le **changement de thème (mode sombre) n'est pas encore disponible sur la version ordinateur**.

### 5.2 Contenus de production (lus le 1er novembre sur admin.qiryna.com)

Les prix ci-dessous sont ceux **affichés par le back-office**. La référence au lancement sera Stripe : ils ne prouvent rien sur le montant encaissé et sont à aligner (voir §1).

**Formules d'accompagnement (domaines)** :

| Domaine | Prix affiché | Problèmes |
|---|---|---|
| Ingénierie | **0 €** | 1 prestation sur 4 en faux texte, description en faux texte |
| Classes prépa | **1 €** | 1 prestation sur 3 en faux texte, description en faux texte, badge « Offre unique » |
| Architecture | 990 € | (rien de signalé) |
| Droit | 1 499 € | Version anglaise : 3 prestations dont 2 en faux texte, description EN en faux texte |
| Management | 1 499 € | **7 prestations sur 7 en faux texte**, description en faux texte |
| Science politique | **1 €** | 1 seule prestation |
| MBA | 1 499 € | Description EN en faux texte |
| Médecine | **100 €** | **4 prestations sur 4 en faux texte**, description en faux texte |

Aucune formule n'a de photo de bandeau propre (la photo de la maquette s'affiche).

**Cours de langue** :
- Formule **« Test Free » à 0 €** sur le français et l'anglais, avec des atouts en faux texte : à retirer ou à finaliser.
- **Version anglaise incohérente** : le palier à 290 € s'appelle « Everest » en anglais et « Volta » en français, avec 3 atouts dont du faux texte en anglais.
- Toutes les formules sont ouvertes aux trois niveaux.

**Hébergement** :
- Formule **Colorado à 1 €** dans les 5 pays (prix de test).
- Accroches anglaises **non traduites** (4 sur 5 restent en français ; Royaume-Uni : « Living expenses in England »).
- Pas de destination logement pour l'Allemagne.

**Orientation** :
- Formules **Étudiant (1 €)** et **Salarié (720 €)** entièrement en **faux texte** (FR et EN).
- **Spécialiste RH (950 €)** en partie en faux texte.

**Destinations et écoles** :
- 6 destinations. **Royaume-Uni : aucune école publiée.**
- Atouts (« Pourquoi étudier en… ») **absents en anglais** pour 5 destinations sur 6.
- Textes administrables de page saisis seulement pour la France ; écoles mises en avant choisies seulement pour la France.
- 449 écoles publiées (France 127, Allemagne 94, États-Unis 86, Chine 85, Canada 57, Royaume-Uni 0), dont 11 avec le logo par défaut. Aucun faux texte détecté dans les fiches publiées.

**Pages, accueil, réglages** :
- Pages CMS présentes : CGU, cookies, confidentialité, FAQ (pas de faux texte détecté ; **validation juridique à faire**).
- 0 article (fausses actualités affichées, voir §5.1) ; 8 partenaires, 2 bannières.
- **Chiffres marketing affichés**, à justifier ou retirer : « +10 000 profils analysés », « 98 % de satisfaction », « 4,9/5 », « +1000 étudiants accompagnés », « 85 % », « 3 étudiants sur 5 », « 100 % personnalisé ». La plupart sont administrables depuis peu, mais tant que rien n'est saisi, ce sont les valeurs de la maquette qui s'affichent.

### 5.3 Infrastructure et configuration de production

**En place** : le site qiryna.com (application Node dans Plesk IONOS), alimenté par la branche `main`, en HTTPS, fermé par sa page à code jusqu'à l'ouverture.

**Cloudflare (déjà actif sur tous les domaines, à sécuriser sans attendre le lancement)** :
- Mode SSL « Full (strict) » avec un certificat valide sur l'origine : réglage à vérifier.
- **Filtrage IP de l'API, à vérifier en priorité** : `/api/countries` répond **200** depuis un poste de développement sur admin.qiryna.com et myadmin.qiryna.com, alors que le même appel sur admin.qiryna.com répondait 403 le 30 septembre. Trois explications possibles, non départagées :
  - `ip_restriction_enabled` a été coupé ;
  - l'IP de ce poste figure dans `allowed_ips` ;
  - les plages Cloudflare y ont été ajoutées, ce qui ouvrirait l'accès à tout le monde.

  Action : relire ces deux réglages en production et refaire l'appel depuis une autre connexion. Le code lit l'adresse de l'appelant : derrière Cloudflare, une liste limitée aux serveurs du site refuserait le site lui-même, sauf si son trafic n'emprunte pas Cloudflare pour joindre l'API.
- **IP réelle des visiteurs, problème confirmé par le test de charge** : `server/utils/client-ip.ts` retient la dernière adresse de `X-Forwarded-For`, qui semble être celle de Cloudflare car nginx ne restaure pas l'IP réelle (`CF-Connecting-IP`, plages Cloudflare de confiance). Depuis une seule adresse, 366 tentatives de connexion ont atteint le back-office en 4 minutes, pour une limite de 10 par minute : la protection contre les essais de mots de passe est donc inefficace, comme celle des autres formulaires et du code d'accès à qiryna.com. **Correctif écrit le 2026-11-04, à déployer et à vérifier** : le site et le back-office remontent `X-Forwarded-For` en sautant les plages de Cloudflare et les relais locaux. Avant de déployer le back-office, vérifier le réglage `ip_restriction_enabled`, car l'API verra de nouveau la vraie adresse du serveur du site.
- **Cache** : ne pas activer de cache sur les pages HTML ni sur `/api` ; seulement sur les fichiers statiques. Les webhooks Stripe et le LMS ne doivent pas être bloqués par les protections anti-robots.

**Variables d'environnement** :
- **Site** : `NUXT_API_BASE_URL=https://admin.qiryna.com/api`, `NUXT_PUBLIC_SITE_URL=https://qiryna.com`, `NUXT_BFF_SHARED_KEY` (**nouvelle clé** propre à qiryna.com), `NUXT_PUBLIC_OAUTH_*`.
- **Back-office de production** :
  - `BFF_SHARED_KEY` et `FRONT_REVALIDATE_URLS=https://qiryna.com` (plus danube si conservé) ;
  - `FRONT_URL=https://qiryna.com` : les liens des e-mails de commande visent cette adresse, y compris pour un achat fait depuis danube, qui partage le même back-office ;
  - clés VAPID propres à la production ;
  - Stripe live (clés et secret des webhooks) ;
  - PT-TESTS, SMTP ;
  - clés Zoom : saisies dans les réglages du back-office, pas dans `.env` (voir ci-dessous) ;
  - `APP_URL` et `LMS_*` ;
  - `SESSION_COOKIE` distinct ;
  - puis `php artisan config:cache`.
- **OAuth** : URI de retour pour qiryna.com dans les consoles Google, LinkedIn, Facebook.
- **Google Analytics** : propriété ou flux séparé pour la production, ou analytics coupé en recette.

**Accès réservé avant l'ouverture (`NUXT_ACCESS_CODE`)** : à poser sur qiryna.com tant qu'il n'est pas ouvert, et aussi sur my et danube (T23), avec des codes différents. Le site répond alors par une page 403 avec un champ de code. Retirer la variable et redémarrer l'application ouvre le site à tous. Tant qu'il est actif, l'application mobile et les vérificateurs externes (Meta, Google, Apple) sont bloqués aussi : à prendre en compte pour les revues, qui demandent des pages publiques (confidentialité, suppression de compte). Le blocage doit être retiré à l'ouverture du 15 novembre.

**Contrôle des prix (T11)** : **fait, à déployer**. `php artisan prices:check` liste les écarts entre le back-office et Stripe, et l'enregistrement d'une formule est refusé en cas d'écart ou de tarif inconnu. **Conséquence** : tant que les prix de test ne sont pas alignés sur Stripe, modifier ces formules est refusé, même pour un simple texte. À lancer dès le déploiement, après avoir complété le catalogue Stripe.

**Conditions générales (I6)** : **fait, à déployer**. Case à cocher avant tout paiement, exigée côté serveur, horodatage visible sur la fiche de commande. Elle renvoie à la page CGU : **la page doit contenir les conditions de vente** avant le lancement (validation juridique, droit de rétractation).

**Compte Zoom Video SDK (séances de langue)** :

- **Titulaire actuel** : compte créé par Victor SESSOU avec l'adresse `qirynadev@gmail.com`, dénomination sociale Qiryna, siège en Côte d'Ivoire. **Aucun moyen de paiement enregistré.**
- **Offre** : SDK vidéo en paiement à l'usage, cycle mensuel, facturation en dollars. 10 000 minutes incluses, puis **0,0035 $ par minute**.
- **Consommation** : factures à 0,00 $ de mai à octobre 2026 ; 0 minute sur 10 000 sur le cycle affiché le 1er novembre.
- **Options non souscrites** :
  - Enregistrement Video SDK : à partir de 100 $ par mois ;
  - transcription et traduction : sur devis ;
  - plateforme de création (crédits prépayés), à partir de 100 $ par mois : mise à niveau proposée, non requise à ce stade.
- **À faire avant le lancement**, au choix (décision 13 du §7) :
  - mettre à jour les coordonnées du compte actuel au nom de Qiryna ou de Doungnan, puis ajouter un moyen de paiement ;
  - ou créer un nouveau compte Qiryna pour la production, avec un moyen de paiement.
- **Changement de compte dans le code** : aucun déploiement. Quatre valeurs sont à saisir dans les réglages du back-office (`zoom_sdk_key`, `zoom_sdk_secret`, `zoom_api_key`, `zoom_api_secret`), puis à valider par une vraie séance. Le test à deux, professeur et apprenant, n'a pas été fait à ce jour d'après nos notes du 23 septembre.
- **Enregistrement dans le code** : chaque séance est créée avec `auto_recording: cloud`. À trancher avant de souscrire l'option : toutes les séances pourraient alors s'enregistrer automatiquement, avec un coût de stockage et une question de consentement (RGPD, éventuels mineurs). Le bouton d'enregistrement du professeur reste désactivé tant que le compte ne le permet pas.
- **À vérifier** :
  - que les clés en production appartiennent bien à ce compte : le compteur doit bouger après une séance d'essai ;
  - le mode de décompte auprès de Zoom : si chaque participant compte, une séance de groupe consomme nettement plus de minutes qu'une séance individuelle ;
  - ce qui se passe au-delà de 10 000 minutes sans moyen de paiement ;
  - la date « Renouvellement le 13 septembre 2024 » affichée sur la page, alors que les factures courent jusqu'en octobre 2026.

**Exploitation** :
- **Recette indisponible au 1er novembre** : OVH a résilié le service qui héberge myadmin.qiryna.com (erreur 522 constatée). Doungnan est chargé du renouvellement manuel. Tant qu'il n'est pas rétabli, le déploiement de `staging` et les essais en recette sont bloqués. À vérifier au retour : données intactes, puis redéploiement de `staging`.
- **Échéances des services** : relever les dates et le mode de renouvellement de tous les services payants (VPS de production, domaine, Cloudflare, Brevo, Zoom, Stripe, comptes stores), avec un responsable et un moyen de paiement valide pour chacun, afin d'éviter une résiliation en production.
- **E-mails** : l'envoi SMTP du back-end passe par **Brevo**. Vérifier SPF, DKIM et DMARC du domaine d'envoi ; revoir et valider le design des e-mails de notification.
- **Worker de file permanent** (au lieu du cron minute) et `queue:restart` au déploiement.
- **Sauvegardes** : bases (back-office, LMS) et fichiers téléversés, avec un essai de restauration.
- **Supervision** : journaux, alertes d'erreur, disponibilité.
- **Charge, test du 2 novembre (`docs/rapport-charge-2026-11-01.md`), objectif de 1 000 à 1 200 visiteurs non validé** :
  - plafond d'environ **75 requêtes dynamiques par seconde** sur danube, puis attente de 3,7 s, sans aucune erreur 5xx ;
  - estimation : environ 640 visiteurs actifs avec 10 s entre deux pages, 6 à 8 s d'attente à 1 200 ;
  - cause probable, à confirmer avec `passenger-status` : un seul processus Node. **Action avant le lancement : plusieurs processus sur qiryna.com, puis refaire le test** ;
  - limites : test depuis une seule connexion, sans téléchargement des pages, sans accès aux indicateurs du serveur. Un second test depuis un centre de données est prêt (`.github/workflows/load-test.yml`) ;
  - **blocage constaté à minuit** : toutes les requêtes dynamiques lancées de 00:00:01 à 00:02 le 2 novembre ont expiré à 30 s, cause inconnue, à chercher dans les journaux du serveur.
- **`NUXT_PUBLIC_SITE_URL` sur danube** : `robots.txt` autorise l'indexation et le sitemap annonce des adresses en `http://`, à revoir.
- **Protection de my, danube et myadmin (T23)** : code prêt, reste à poser sur les serveurs. `NUXT_ACCESS_CODE` sur my et danube, avec un code différent. Pour myadmin : Cloudflare Access dans le tableau de bord, en laissant passer `/api/*` et `/storage/*` pour le site et les webhooks. `noindex` déjà automatique hors de qiryna.com (à déployer). Décider aussi du sort de danube après le lancement.

**Sécurité restante** :
- **Jetons Zoom (`POST /zoom-jwt`)** : faille corrigée le 1er novembre dans le back-office (jeton réservé aux participants de la séance et à son créneau) et **déployée sur admin.qiryna.com** (`c4f8d95`, déploiement GitHub Actions réussi). Reste à valider une vraie séance professeur et apprenant. La recette myadmin, indisponible, devra être redéployée à son retour.
- **Cloudflare Turnstile** : widget créé et clés posées sur danube le 2026-11-04 (refus 429 sans jeton constaté, jeton obtenu dans Chrome). **Attention, Prosper** : l'application mobile vise danube par défaut et n'envoie pas de jeton, donc ses versions installées voient refuser connexion, inscription, mot de passe oublié et contact. Il faut une version compilée avec la clé publique et `localhost` dans les noms d'hôte du widget ; le cas iOS (`capacitor://localhost`) reste à essayer, car Turnstile semble n'accepter que http et https. Solution retenue le 2026-11-04 : l'alias `mobile.qiryna.com`, dispensé de Turnstile et de la page 403 sur `/api/bff/`, avec une nouvelle version de l'application compilée sur ce domaine.
- Vérification d'origine des écritures sur le BFF : **fait, à déployer**. À contrôler sur danube juste après le déploiement : une connexion normale doit passer.
- **Pièces des clients (passeports, relevés...)** : disque privé et liens signés de 5 minutes, **déployés sur admin et danube** le 2 novembre. Les fichiers existants sont déplacés par la migration du déploiement ; à confirmer sur le serveur : `php artisan client-documents:privatize --dry-run` doit annoncer 0 (relançable sans l'option). La recette reste à déployer à son retour. L'application mobile doit s'adapter : `Accept: application/json` sur `/api/bff/admission/documents/file` renvoie le lien à ouvrir (Prosper).
- **Encore lisibles par URL publique** : documents remis au client (`photos/order_deliverables` : lettres d'admission, contrats) et pièces jointes de la messagerie. À traiter de la même façon. Une pièce remplacée par le client reste aussi conservée sur le disque, sans être effacée.
- Jetons Sanctum : 30 jours, déjà en place. Énumération des comptes à l'inscription : **fait, à déployer**, le titulaire est prévenu par e-mail. Le refus de la connexion sociale reste à relire.
- Profil d'exemple du tableau de bord : déjà retiré, vérifié dans le code.

### 5.4 Décisions déjà prises (à ne pas remettre en cause)

- Production : **qiryna.com** + **admin.qiryna.com**, date cible **15 novembre 2026**.
- LMS au lancement : **test de niveau seulement** ; test après l'achat, obligatoire avant la première séance.
- Niveau choisi à l'achat **indicatif**, sans effet sur le prix ; le niveau mesuré sert à adapter les cours.
- Paiement **sur le web** (Stripe), y compris depuis l'application mobile.
- Tarifs de référence au lancement : **ceux de Stripe**.
- PT-TESTS reste en **préproduction au lancement** ; mode production et ouverture des tests après quelques commandes payées.
- SMTP du back-end : **Brevo**.
- Distribution iOS de test : **TestFlight**.

---

## 6. Applications mobiles (Capacitor)

### 6.1 État au 29 octobre (branche `mobile-capacitor`, doc `MOBILE.md`)

- **Principe** : le site Nuxt livré en page unique (`NUXT_MOBILE=1 nuxt generate`) dans une coquille native **Capacitor 8**. Les appels passent par le BFF du site déployé en HTTP natif (pas de CORS) ; le cookie de session reste dans le stockage natif.
- **Identité** : nom « Qiryna », identifiant `com.qiryna.app` (Android et iOS), version 1.0.1 (code 2).
- **Fait** :
  - APK et AAB Android **signés** (clé d'envoi `qiryna-upload.jks`, hors dépôt) ;
  - projet iOS présent (Swift Package Manager) ;
  - icône et écran de démarrage ;
  - bouton retour Android ;
  - paiement Stripe dans le navigateur intégré, avec retour sur l'écran de succès de l'application ;
  - LMS dans le navigateur intégré ;
  - PDF du bilan ouvert dans la visionneuse du téléphone ;
  - autorisations caméra et micro pour Zoom.
- **Vérifié** seulement sur émulateur Android 15. **Non vérifié sur vrai téléphone** : connexion, paiement, visio Zoom complète, PDF, téléchargement des fichiers du chat.
- **Désactivé dans l'application** : connexion Google / Facebook / LinkedIn (impossible en WebView) et push web.
- L'application vise par défaut le BFF de **recette** ; pour les stores, elle devra viser **qiryna.com** (`NUXT_MOBILE_BFF_ORIGIN`), donc après la mise en ligne du site.
- La branche mobile n'est fusionnée ni dans `app` ni dans `danube`.
- Elle hérite des mêmes écrans que le site mobile, donc des points factices du §5.1.

### 6.2 Ce qui reste, selon `MOBILE.md`

- **Suppression de compte** dans l'application, plus une **page web de demande de suppression** (Google) : **bloquant Apple et Google**.
- **URL de politique de confidentialité**, fiches « Sécurité des données » (Google) et « Confidentialité » (Apple) : compte, e-mail, paiement Stripe, fichiers joints, mesure d'audience.
- **Compte de test** pour les équipes de revue, sur l'environnement visé.
- **Push natif** : Firebase Cloud Messaging et APNs, module `@capacitor/push-notifications`, jetons d'appareil et envoi côté back-office.
- **Connexion sociale native**, et alors **« Se connecter avec Apple » obligatoire** (règle App Store 4.8 ; le back-office n'a pas de fournisseur Apple).
- **Liens d'application** (Android App Links, iOS Universal Links) pour revenir du paiement : `/.well-known/assetlinks.json` et `apple-app-site-association` sur qiryna.com.
- **Versions** à incrémenter à chaque envoi ; **clé de signature** à sauvegarder dans un coffre.

### 6.3 Contrainte : ni Mac ni iPhone

Points à couvrir (avec options et coûts) :

- **Compilation iOS sans Mac** : service en ligne (Codemagic, Ionic Appflow, Bitrise, GitHub Actions macOS…) ou Mac loué dans le cloud.
- **Signature iOS** : compte Apple Developer, certificats et profils générés sans Xcode (clé API App Store Connect).
- **Distribution et essais iOS** : TestFlight est la solution prévue pour distribuer les versions de test. Il suppose une version déjà compilée et signée, donc les deux points ci-dessus et un compte Apple Developer. Il reste aussi à disposer d'un iPhone (prêt, achat ou service d'essais à distance) pour vérifier les parcours sur un appareil réel. Idem au moins un vrai téléphone Android pour les parcours connectés.
- **Comptes développeur** : Google Play Console et Apple Developer Program. Pour un compte **organisation**, numéro D-U-N-S chez Apple et vérification d'identité chez Google, délais à anticiper. Un compte Google **personnel** récent impose un test fermé (nombre minimal de testeurs pendant plusieurs jours) avant la production : à vérifier.

### 6.4 Risques à analyser (vérifier les règles en vigueur)

- **Apple, règle 4.2 (fonctionnalité minimale)** : une application qui n'est qu'un site dans une WebView peut être refusée ; les fonctions natives (push, PDF, visio, partage) aident.
- **Paiements dans l'application** (Apple 3.1, Google Play) : le paiement Stripe externe est admis pour des services consommés hors de l'application ou en temps réel entre personnes (accompagnement, logement, cours en visio). Des contenus numériques consommés dans l'application (futurs cours du LMS) pourraient exiger le paiement intégré. À qualifier formule par formule.
- **Niveau d'API Android cible** exigé par Google Play en 2026 : à vérifier.
- **Zoom dans une WebView** : à valider sur appareils.

---

## 7. Décisions en attente du responsable

1. Contenu exact du site de production (branche `main`, confirmée par Victor), sort de danube.qiryna.com après le lancement.
2. **Pastilles des fiches écoles** : retirer, ou ajouter le type d'établissement et les accréditations au back-office.
3. Écrans factices au lancement : certification, aperçu « Mon projet », boutons « Contacter un conseiller », « Documents utiles », fausses actualités : masquer ou brancher.
4. Règle de suppression de compte, **à valider** (voir aussi la durée de conservation avec un conseil juridique). Appliquée par défaut : profil, pièces, documents remis, messages, photo, favoris, newsletter et bilans PT-TESTS effacés ; séances à venir libérées ; commandes et séances passées conservées sans nom ni adresse, coordonnées d'un enfant retirées.
5. Liste et montants définitifs des formules à saisir dans Stripe, et sort de la formule gratuite « Test Free ». Ensuite : créer les tarifs dans Stripe (compte live), rattacher chaque formule à son tarif et aligner le prix du back-office.
6. Événements de conversion à suivre (Google et Meta) et outil (balises côté navigateur, Conversions API côté serveur, Google Tag Manager).
7. Protection de l'API, admin.qiryna.com étant déjà derrière Cloudflare : la garder proxifiée et la protéger autrement (clé partagée du BFF, règles Cloudflare), ou repasser l'API en DNS direct et rétablir la liste blanche IP.
8. Orientation au lancement (§5.1) : retirer le paramétrage E-testing des formules, texte de Mon projet et de l'e-mail d'achat, façon de communiquer la date du test, seuil de commandes qui déclenche l'ouverture.
9. Applications mobiles : en même temps que le site ou après ; push natif et connexion sociale native en V1 ou plus tard ; accès à un iPhone pour la validation sur appareil réel.
10. Solution de compilation iOS ; comptes stores au nom d'une organisation ou d'une personne.
11. Worker de file permanent avant le lancement ou non.
12. Écrans attendus de Kader : FAQ et autres pages ordinateur, être rappelé, documents remis, réglages des notifications, certification.
13. Compte Zoom de production : reprendre le compte actuel (coordonnées au nom de Qiryna ou de Doungnan, moyen de paiement) ou en créer un nouveau. Décider aussi si les séances sont enregistrées au lancement et, sinon, retirer `auto_recording: cloud`.
14. Capacité : combien de processus Node sur le VPS de qiryna.com (selon ses cœurs et sa mémoire), et quelle hypothèse de trafic retenir pour le lancement.
15. Documents remis au client et pièces jointes de la messagerie : les passer aussi en privé avant le lancement ou après.

---

## 8. Références dans les dépôts

- Site : `DEPLOIEMENT.md` (mise en ligne Plesk, variables, contrôles), `docs/directives-backend.md` (historique des demandes au back-office), `MOBILE.md` (branche `mobile-capacitor`), `docs/fiche-ecole-badges-mocks.md`, `docs/mon-projet-*-mocks.md` (écrans factices), `docs/rapport-charge-2026-11-01.md` et `tests/load/public-load.js` (test de charge).
- Back-office : `docs/push-web.md`, `docs/lms-site.md`, `docs/lms-mise-en-ligne.md`.
- LMS : `docs/contrat-qiryna.md`, `docs/deploiement.md`, `docs/claude-mcp.md`.
