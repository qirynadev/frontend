# Test de charge : pages publiques et connexion

Tests lancés la nuit du 1er au 2 novembre 2026 sur **danube.qiryna.com**, relié au back-office de production **admin.qiryna.com**. Outil : k6 2.3.0. Sans paiement et sans compte réel. Script : `tests/load/public-load.js`.

## 1. Conclusion

**L'objectif de 1 000 à 1 200 visiteurs simultanés n'est pas validé.**

- **Plafond mesuré :** environ **75 requêtes dynamiques par seconde**. Au-delà, les réponses passent de 0,2 s à **3,7 s**, sans erreur.
- **Stabilité :** **aucune réponse 5xx** sur plus de 140 000 requêtes. Le site ralentit, il ne tombe pas.
- **Lecture en visiteurs :** cela dépend du temps entre deux pages.

| Temps entre deux pages | Visiteurs simultanés avant ralentissement (estimation) | Attente estimée à 1 200 visiteurs |
|---|---|---|
| 10 s (visite active, hypothèse du test) | environ 640 | 6 à 8 s |
| 30 s (lecture plus posée) | environ 1 900 | pas de ralentissement attendu |

Ces chiffres sont des estimations calculées à partir du plafond mesuré, pas des mesures directes à 1 200 visiteurs.

**Correctif le plus probable :** faire tourner le site sur plusieurs processus Node, puis refaire le test (voir §5).

## 2. Ce qui a été testé, et comment

**Mélange de pages :** accueil 25 %, destination 12 %, liste d'écoles 10 %, fiches d'écoles tirées au hasard dans le sitemap 20 %, langues 8 %, logement 5 %, orientation 5 %, formule 5 %, page de connexion 10 %. S'y ajoutent des appels de données (12 % des visites) et des tentatives de connexion avec de faux identifiants (5 %).

**Contrôles de la mesure :** une requête par seconde vers un fichier statique du site, et une vers Cloudflare. S'ils ralentissent aussi, c'est le réseau du poste qui sature, pas le serveur.

**Deux adaptations imposées par la connexion du poste** (430 Ko/s en réception, 139 ms de latence, passerelle en `10.x`, probablement une connexion mobile) :

- **Requêtes HEAD :** le serveur fait tout le rendu mais n'envoie pas le contenu. En pages complètes, ce poste plafonnerait à environ 20 pages/s, et on mesurerait sa connexion.
- **Deuxième test à débit fixe :** le premier a montré que ce poste ne tient pas des centaines de connexions. Le second envoie le même nombre de requêtes avec au plus 300 connexions. Pour le serveur, c'est équivalent, car Cloudflare termine les connexions des visiteurs.

## 3. Résultats

### Test 1 : visiteurs simultanés (5 à 15 s entre deux pages)

| Visiteurs | Requêtes | Réponse médiane | Réponse p95 | Requêtes en échec | Cause des échecs |
|---|---|---|---|---|---|
| 100 | 2 420 | 211 ms | 519 ms | 0 % | |
| 300 | 4 364 | 236 ms | 30 s | 23 % | Expirations autour de minuit, voir §4 |
| 600 | 19 945 | 274 ms | 645 ms | 1,4 % | Connexions impossibles depuis le poste |
| 1 000 | 36 203 | 234 ms | 582 ms | 24 % | Connexions et DNS du poste |
| 1 200 | 33 704 | 221 ms | 510 ms | 30 % | Connexions et DNS du poste, arrêt automatique |

**Ce test ne valide pas 1 000 ni 1 200 visiteurs.** Le nombre d'erreurs journalisées correspond exactement au nombre compté : ce sont des échecs côté client, sans réponse 5xx. Les messages sont `connection attempt failed` et `lookup: no such host`. Une panne DNS ne peut pas venir du serveur. Les visiteurs dont la connexion échouait n'envoyaient rien : la charge réelle était donc plus faible que l'affichage, ce qui explique les temps corrects.

### Test 2 : débit fixe, jusqu'à 300 connexions (test de référence)

| Débit demandé | Débit obtenu, montée comprise | Réponse médiane | Réponse p95 | 5xx | Requêtes expirées | Coupures réseau | Contrôle statique (méd.) |
|---|---|---|---|---|---|---|---|
| 40/s | 40,7/s | 204 ms | 497 ms | 0 | 0 | 0 | 151 ms |
| 80/s | 60,5/s | 3,25 s | 8,6 s | 0 | 1 | 12 | 162 ms |
| 120/s | 70,6/s | 3,73 s | 6,1 s | 0 | 5 | 13 | 160 ms |
| 180/s | 74,3/s | 3,71 s | 4,4 s | 0 | 0 | 0 | 153 ms |

Le palier à 180/s est le plus net :

- **Le poste n'est pas en cause :** aucune erreur, et les deux contrôles restent rapides (p95 de 246 ms sur le fichier statique).
- **Le plafond est côté dynamique :** demander plus de débit n'en donne pas plus.
- **File d'attente unique :** accueil, fiches et appels de données attendent tous 3,7 s, y compris les pages déjà en cache. C'est le signe d'une file commune avant le traitement, plutôt que d'une page lente. Un audit de septembre relevait déjà un seul processus Passenger.

Je n'ai pas accès aux indicateurs du serveur : cette cause reste à confirmer avec `passenger-status` pendant un test.

### Temps par page sans saturation (test 2 à 40/s)

| Page | Médiane | p95 |
|---|---|---|
| Accueil | 223 ms | 370 ms |
| Destination | 185 ms | 320 ms |
| Liste d'écoles | 188 ms | 340 ms |
| Fiche d'école | 190 ms | 331 ms |
| Page de connexion | 204 ms | 354 ms |
| Envoi de la connexion | 525 ms | 649 ms |

Ces temps comprennent environ 140 ms de latence réseau depuis le poste.

## 4. Autres constats

### La limite d'essais de connexion ne protège pas derrière Cloudflare (à corriger)

La limite est de 10 essais par minute et par adresse. Au test à 40/s, en 4 minutes et depuis une seule adresse, **366 tentatives ont atteint le back-office** (refus 422) et seulement **50 ont été bloquées** (429). Avec une limite effective, on attendrait environ 40 passages.

Le site retient l'adresse de Cloudflare, qui varie, au lieu de celle du visiteur. Cela confirme le risque signalé dans le point projet. Une attaque par essais de mots de passe obtient donc bien plus que les 10 essais prévus. Les autres formulaires et l'essai du code d'accès à qiryna.com dépendent du même calcul d'adresse.

**La connexion complète n'a donc été testée qu'à faible débit :** les faux identifiants ne mesurent pas la vérification d'un vrai mot de passe. Un test réaliste demanderait des comptes de test créés à cet effet, sur un environnement sans clients.

### Blocage de deux minutes à minuit, cause inconnue

À 300 visiteurs, **toutes les requêtes dynamiques lancées entre 00:00:01 et 00:02** ont expiré à 30 s (993 requêtes), alors que le fichier statique et le contrôle Cloudflare restaient normaux. Un tel blocage n'est pas revenu de 00:03 à 00:55, y compris à débit bien plus fort (seules 6 requêtes isolées ont expiré au test 2) : il ne paraît donc pas lié à la charge.

Le début à minuit pile fait penser à une tâche planifiée. La seule que le dépôt prévoit à cette heure est `sanctum:prune-expired`, qui ne semble pas capable d'expliquer un tel blocage sur les pages publiques. Une tâche du serveur reste possible.

**À vérifier :** journaux du serveur (nginx, Passenger, système) entre 00:00 et 00:02 le 2 novembre, cron de Plesk. Après le lancement, cela représenterait une coupure de deux minutes chaque nuit si elle se répète. À recontrôler par une sonde quelques minutes autour de minuit.

### Autres points

- **Effet des tests :** seules de fausses tentatives de connexion ont été envoyées, sans création de données. Cloudflare n'a rien bloqué (aucun 403). Les journaux du back-office et les statistiques Cloudflare de cette nuit montrent ce pic.
- **danube est indexable :** son `robots.txt` indique `Allow: /`, et son sitemap annonce des adresses en `http://`. La variable `NUXT_PUBLIC_SITE_URL` du serveur est à revoir, et qiryna.com doit recevoir `https://qiryna.com`.

## 5. Limites de ce test

- **Une seule adresse, une seule connexion :** on ne voit pas ce que tiennent Cloudflare et le serveur avec 1 200 vraies connexions.
- **Pas de téléchargement des pages :** ni le coût d'envoi, ni la bande passante du serveur, ni les fichiers statiques ne sont mesurés. Le plafond réel en pages complètes peut être un peu plus bas.
- **Modèle de visiteur simplifié :** un vrai visiteur enchaîne une page rendue par le serveur, puis des navigations par appels de données.
- **Environnement :** danube, sans accès aux indicateurs du serveur (processeur, mémoire, base de données). qiryna.com n'existe pas encore : il faudra refaire le test sur son serveur, avec ses réglages.
- **Code testé :** celui en ligne sur danube le 1er novembre. Les chantiers de cette nuit ne sont pas déployés.

## 6. Recommandations, par priorité

1. **Plusieurs processus Node sur qiryna.com (avant le 15 novembre).** Régler Passenger (`passenger_min_instances`, taille de pool) selon les cœurs du VPS, sous réserve de la mémoire. Confirmer d'abord avec `passenger-status`, puis refaire le test : le plafond devrait augmenter à peu près avec le nombre de processus, tant que le processeur suit. Le signal de mise à jour des contenus gère déjà plusieurs processus. Les limites d'essais comptent par processus : elles deviendront un peu moins strictes.
2. **Restaurer l'IP réelle derrière Cloudflare (avant le lancement).** Dans nginx (`real_ip_header CF-Connecting-IP`, plages Cloudflare de confiance), ou dans `server/utils/client-ip.ts`. Puis vérifier avec k6 que les 429 arrivent bien après 10 essais.
3. **Éclaircir le blocage de minuit** par les journaux du serveur.
4. **Refaire un test depuis un centre de données**, en pages complètes (`MODE=get`). Le lancement depuis GitHub est prêt : `.github/workflows/load-test.yml`. GitHub ne propose un lancement manuel que si le fichier est sur la branche par défaut.
5. **Option à étudier si le besoin dépasse ce que donnent les processus :** cache Cloudflare des pages publiques pour les visiteurs non connectés. Attention aux pages qui dépendent de la session, et à la purge par le signal de mise à jour.

## 7. Refaire le test

```bash
# Visiteurs simultanés, depuis une machine bien raccordée, en pages complètes
k6 run -e BASE_URL=https://qiryna.com -e VUS=1200 -e MODE=get -e RAMP=3m -e HOLD=5m tests/load/public-load.js
```

```bash
# Débit fixe, peu de connexions (120/s correspond à environ 1 000 visiteurs actifs)
k6 run -e BASE_URL=https://qiryna.com -e RATE=120 -e RAMP=1m -e HOLD=8m -e MAX_ERRORS=0.10 tests/load/public-load.js
```

Si le blocage par code est actif sur qiryna.com, le script reçoit le 403 et s'arrête aussitôt : tester avant de poser `NUXT_ACCESS_CODE`, ou retirer la variable le temps du test.
