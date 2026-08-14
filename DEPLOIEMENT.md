# Mettre Qiryna en ligne

> Objectif : une URL que l'équipe et le client peuvent ouvrir pour voir l'état
> du front.

---

## 0. Cinq contraintes à connaître avant de choisir

Elles éliminent la moitié des hébergements possibles. Les lire avant de choisir
évite d'y revenir après.

### 1. C'est une application **rendue côté serveur** — pas un site statique

`nuxt.config.ts` déclare `ssr: true`, et le BFF Nitro (`server/api/bff/**`) est
le seul endroit qui parle à l'API. `npm run generate` produirait un site mort :
plus de session, plus de paiement, plus de catalogue.

→ **Il faut un serveur Node.** GitHub Pages, un bucket S3, un hébergement
mutualisé PHP : non.

### 2. **HTTPS est obligatoire**, sinon personne ne peut se connecter

Le cookie de session est posé avec `secure: !import.meta.dev`
([`session.constants.ts`](app/core/http/session.constants.ts)) : en production
il est **refusé par le navigateur sur une URL en `http://`**. La connexion
semblera « échouer sans message » — le serveur répond 200, mais le cookie n'est
jamais conservé.

→ Certificat TLS obligatoire. Pas de `http://ip-du-serveur:3000`.

### 3. Le back-office **filtre par adresse IP**

`GET /all-data` peut répondre **403** selon l'IP appelante
(ARCHITECTURE-API.md § 1, constat n° 14). C'est le serveur qui appelle l'API,
pas le navigateur : **c'est l'IP sortante de l'hébergement qui doit être
autorisée**.

→ Avant de déployer, demander à l'équipe back-office d'ajouter l'IP du serveur.
Sur un VPS c'est une IP fixe, donc simple. Sur Vercel / Netlify / Cloudflare
Workers, les IP sont dynamiques et partagées : **ces plateformes ne
fonctionneront pas** tant que le filtrage est en place.

### 4. `sharp` est compilé pour l'architecture de build

Le build vient de le dire :

```
[@nuxt/image] sharp binaries have been included in your build for win32-x64.
Make sure you deploy to the same architecture.
```

→ **Ne pas copier un `.output/` construit sous Windows vers un serveur Linux.**
Construire sur la cible, ou dans un conteneur Linux.

### 5. Node 20 ou plus

Nuxt 4 / Nitro 2.13. `node --version` sur la cible avant tout.

---

## 1. Le plus rapide : partager le poste de développement (10 minutes)

Pour montrer l'écran à trois personnes cet après-midi, sans serveur. HTTPS
compris, et l'IP sortante est celle du poste — **déjà autorisée**, puisque le
développement fonctionne.

```bash
npm run build
```

```bash
node .output/server/index.mjs
```

Puis, dans un second terminal :

```bash
npx cloudflared tunnel --url http://localhost:3000
```

`cloudflared` affiche une URL du type
`https://quelque-chose.trycloudflare.com` — publique, en HTTPS, à partager
telle quelle.

**Ce que ça vaut, et ce que ça ne vaut pas**

| ✅ | ❌ |
|---|---|
| HTTPS, donc la connexion fonctionne | l'URL meurt quand vous fermez le terminal |
| aucune configuration réseau | le poste doit rester allumé |
| l'IP sortante est déjà autorisée | l'URL change à chaque lancement |
| gratuit, sans compte | inadapté à une démonstration client |

> ⚠️ Cette URL est **publique et non protégée**. Ne la laissez pas tourner sans
> surveillance : elle expose l'API de recette à qui possède le lien.

---

## 2. La bonne solution : un VPS (1 à 2 heures)

C'est ce que le projet vise (`sharp` est déjà signalé comme à vérifier sur le
VPS). Exemple sous Debian/Ubuntu, avec **Caddy** — qui obtient et renouvelle le
certificat TLS tout seul.

### 2.1 Préparer la machine

```bash
sudo apt update && sudo apt install -y curl git caddy
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
```

Vérifier :

```bash
node --version
```

### 2.2 Déposer le code et construire **sur place**

```bash
sudo mkdir -p /var/www/qiryna && sudo chown "$USER" /var/www/qiryna
git clone <url-du-depot> /var/www/qiryna && cd /var/www/qiryna
npm ci
```

```bash
npm run build
```

> `npm ci` recompile `sharp` pour `linux-x64` — c'est pour cela qu'on
> construit sur la cible plutôt que d'envoyer un `.output/` fabriqué ailleurs.

### 2.3 Les variables d'environnement

Créer `/var/www/qiryna/.env` à partir de [`.env.example`](.env.example) :

```bash
NUXT_API_BASE_URL=https://admin.stage.qiryna.com/api
NUXT_CATALOG_CACHE_TTL=300
NUXT_API_TIMEOUT=15000

# Vides = boutons de connexion tierce grisés. Voir LOT-5.md § 7.
NUXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID=
NUXT_PUBLIC_OAUTH_FACEBOOK_APP_ID=
NUXT_PUBLIC_OAUTH_LINKEDIN_CLIENT_ID=
```

> `NUXT_API_BASE_URL` n'est **jamais** exposé au navigateur : `runtimeConfig`
> ne le place pas dans `public`. Seuls les trois identifiants OAuth le sont, et
> ils sont publics par nature.

### 2.4 Lancer le serveur au démarrage

`/etc/systemd/system/qiryna.service` :

```ini
[Unit]
Description=Qiryna front (Nuxt)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/qiryna
EnvironmentFile=/var/www/qiryna/.env
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=127.0.0.1
ExecStart=/usr/bin/node /var/www/qiryna/.output/server/index.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now qiryna && sudo systemctl status qiryna
```

> `HOST=127.0.0.1` : le serveur Node n'écoute que la boucle locale. Tout passe
> par Caddy, donc par HTTPS. Sans cela, le port 3000 resterait joignable en
> clair, et le cookie `secure` y serait perdu.

### 2.5 TLS et reverse proxy

`/etc/caddy/Caddyfile` :

```
demo.qiryna.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo systemctl reload caddy
```

Caddy obtient le certificat Let's Encrypt au premier appel. Le `A` du DNS doit
pointer sur le serveur **avant** ce rechargement.

### 2.6 Protéger la démonstration

L'API de recette contient de vraies données. Sur une URL publique, ajouter une
authentification HTTP :

```bash
caddy hash-password --plaintext 'un-mot-de-passe-solide'
```

```
demo.qiryna.com {
    basic_auth {
        equipe $2a$14$le-condensat-renvoye-ci-dessus
    }
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
```

### 2.7 Mettre à jour

```bash
cd /var/www/qiryna && git pull && npm ci && npm run build && sudo systemctl restart qiryna
```

---

## 2 bis. VPS géré par **Plesk**

Plesk sait faire tourner une application Node — c'est son extension **Node.js**,
qui pilote un Passenger. Deux différences avec le § 2 : on ne touche pas à
systemd, et le TLS passe par Let's Encrypt intégré.

### a. Installer ce qu'il faut, une fois

Dans **Outils & Paramètres → Mises à jour et mises à niveau → Ajouter des
composants**, cocher **Node.js**. Puis, dans **Extensions**, installer
**Let's Encrypt** si ce n'est pas déjà fait.

Vérifier la version proposée : **Node 20 minimum**. Plesk livre parfois une
14 ou une 16 par défaut ; on choisit la version par domaine à l'étape (d).

### b. Créer le domaine

**Sites web & domaines → Ajouter un domaine** → `demo.qiryna.com`.
Racine du document : laisser `httpdocs`.

Puis **SSL/TLS Certificates → Install a free basic certificate** (Let's
Encrypt), et cocher **Redirect from http to https**.

> ⚠️ Cette redirection n'est **pas** un confort : sans HTTPS, le cookie de
> session est refusé par le navigateur et personne ne peut se connecter
> (§ 0.2).

### c. Déposer le code

Le plus simple est **Git** (Plesk l'intègre) : **Sites web & domaines → Git →
Ajouter un dépôt**, branche `main`, dossier de destination `/httpdocs`.

À défaut, un envoi par le gestionnaire de fichiers ou en SFTP — mais **sans le
dossier `node_modules` ni `.output`** : ils seront reconstruits sur place
(§ 0.4).

### d. Construire sur le serveur

**Sites web & domaines → Node.js** :

| Champ | Valeur |
|---|---|
| Version de Node.js | **20.x ou plus** |
| Racine de l'application | `/httpdocs` |
| Fichier de démarrage | `.output/server/index.mjs` |
| Mode d'application | `production` |

Cliquer **NPM install** (Plesk exécute `npm install` — c'est là que `sharp` se
compile pour Linux), puis **Run script** → `build`.

En SSH, l'équivalent est :

```bash
cd /var/www/vhosts/demo.qiryna.com/httpdocs && npm ci && npm run build
```

### e. Les variables d'environnement

Toujours dans le panneau **Node.js**, section **Variables d'environnement
personnalisées** :

| Nom | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `NUXT_API_BASE_URL` | `https://admin.stage.qiryna.com/api` |
| `NUXT_CATALOG_CACHE_TTL` | `300` |
| `NUXT_API_TIMEOUT` | `15000` |

Les trois `NUXT_PUBLIC_OAUTH_*` restent vides tant que les identifiants ne sont
pas fournis (LOT-5.md § 7).

> **Ne pas définir `PORT` ni `HOST`.** Passenger choisit lui-même la socket
> d'écoute ; les figer casse le démarrage.

Puis **Restart App**.

### f. Protéger la démonstration

**Sites web & domaines → Protection par mot de passe** → ajouter une zone
protégée sur `/`. L'API de recette contient de vraies données : une URL publique
sans mot de passe les expose.

### g. Le piège Plesk à connaître

Plesk crée un `httpdocs` servi comme un site statique. Une fois l'application
Node activée, **c'est Passenger qui répond**, plus le serveur de fichiers. Si
vous voyez la page « Bienvenue » de Plesk ou un index de dossier, c'est que
l'application n'est pas démarrée : vérifier **Fichier de démarrage** et le
journal (**Node.js → Logs**).

Autre symptôme classique : une erreur `Cannot find module` au démarrage signifie
que `npm run build` n'a pas tourné, ou a tourné **avant** le dernier `git pull`.

### g bis. `/icons/` est un alias Apache réservé — déjà contourné

Symptôme rencontré en production : `/img/logo.webp` répond 200 mais
`/icons/ic-bell.svg` répond **404**, alors que le fichier existe sur le disque.

**Cause :** sous Apache — donc sous Plesk — `/icons/` est un **alias système
réservé par défaut** :

```apache
Alias /icons/ "/usr/share/apache2/icons/"
```

Il sert les pictogrammes d'indexation d'Apache. Toute requête `/icons/*` est
donc détournée vers ce dossier système **avant** d'atteindre les fichiers du
site : le répertoire existe (403 sur le listing), mais nos SVG n'y sont pas
(404). Aucun `chmod` ni build n'y change quoi que ce soit — c'est le **préfixe
d'URL** qui est capturé.

**C'est déjà réglé dans le code.** `QIcon` et les rares `<img>` en dur servent
les icônes sous **`/img/icons/`** — un préfixe qu'aucun alias ne réserve, et
qui est prouvé fonctionnel sur ce serveur (`/img/logo.webp` répond 200). La
source unique est `public/img/icons/` (378 fichiers). Il n'y a donc **rien à
faire côté serveur** : le simple dépôt du `public/` (ou le build) suffit.

> Historique : deux tentatives antérieures — une route Node servant `/icons/`,
> puis une copie partielle sous `/img/icons/` — ont été retirées. La première
> ne s'exécutait jamais (Apache intercepte avant Node) ; la seconde était
> incomplète (208 icônes sur 378, 170 en 404). La migration est désormais
> **complète et unique**.

> ⚠️ **Ne jamais reservir d'assets sous `/icons/`.** Le même piège vaut pour
> tout autre alias Apache par défaut (`/error/`, `/doc/`). En cas de doute,
> nichez sous `/img/` ou `/assets/`.

### h. Mettre à jour

**Git → Pull maintenant**, puis **NPM install**, **Run script → build**,
**Restart App**. En SSH :

```bash
cd /var/www/vhosts/demo.qiryna.com/httpdocs && git pull && npm ci && npm run build && plesk ext nodejs --restart-app /var/www/vhosts/demo.qiryna.com/httpdocs
```

---

## 3. Docker, si vous préférez

Résout la question de `sharp` : le build se fait dans un Linux, quel que soit
le poste.

`Dockerfile` :

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

```bash
docker build -t qiryna-front . && docker run -d --env-file .env -p 127.0.0.1:3000:3000 --name qiryna qiryna-front
```

Le reverse proxy et le TLS restent à faire — § 2.5.

---

## 4. Vercel, Netlify, Cloudflare — à écarter pour l'instant

Nuxt s'y déploie très bien en principe. Deux obstacles concrets ici :

1. **le filtrage par IP du back-office** (§ 0.3) : ces plateformes sortent par
   des IP dynamiques et partagées, impossibles à autoriser ;
2. **`sharp`** n'est pas disponible dans tous leurs environnements
   d'exécution — `@nuxt/image` devrait alors être reconfiguré.

À reconsidérer le jour où l'API est ouverte, ou si l'équipe accepte d'autoriser
des plages entières — ce qui n'est pas souhaitable.

---

## 5. À faire faire à l'équipe back-office, en parallèle

| Demande | Pourquoi | Bloquant ? |
|---|---|---|
| **Autoriser l'IP sortante du serveur** | sinon `/all-data` répond 403 et le site est vide | 🔴 oui |
| Déclarer les URL de retour OAuth : `https://<domaine>/connexion` et `https://<domaine>/inscription` | sinon LinkedIn refuse la redirection | 🟠 seulement pour OAuth |
| Fournir les trois identifiants clients OAuth | boutons grisés sans eux | 🟠 |
| **Remplacer `pk_live_…` par une clé de test en recette** | une clé *live* en recette autorise des paiements réels | 🔴 avant toute recette du paiement |
| Confirmer ce que renvoie `redirectUrl` de `/payment/init` | libellé de l'écran de retour | 🟡 |

---

## 6. Vérifier après la mise en ligne

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://demo.qiryna.com/
curl -s -o /dev/null -w "%{http_code}\n" https://demo.qiryna.com/connexion
curl -s -o /dev/null -w "%{http_code}\n" https://demo.qiryna.com/en/connexion
```

| Contrôle | Attendu | Ce qu'un échec signifie |
|---|---|---|
| `/` répond 200 **avec du contenu** | 200 | une page vide = 403 de l'API → **IP non autorisée** (§ 0.3) |
| `/connexion` répond 200 | 200 | |
| Se connecter, puis recharger : rester connecté | session conservée | cookie perdu → **le site n'est pas en HTTPS** (§ 0.2) |
| `POST /api/bff/payment/init` sans session | **401** | autre chose = la garde serveur ne tourne pas |
| `/langues/anglais/confirmation` sans session | **302** vers `/connexion` | |
| `/en/connexion` | libellés anglais | |
| Console du navigateur | aucune erreur | |

Les deux premières lignes du tableau sont celles qui échouent en pratique. Les
deux causes sont toujours les mêmes : **l'IP n'est pas autorisée**, ou **le site
n'est pas en HTTPS**.

---

## 7. Ce que voit un visiteur aujourd'hui

Le Lot 5 est **partiel** (LOT-5.md § 1). Écrans consultables :

| Fonctionnel | Encore un écran provisoire |
|---|---|
| accueil, destinations, écoles, fiche école, domaines, langues, objectifs, formules, orientation | `/messages`, `/compte` |
| **connexion, inscription, mot de passe oublié** | `/mon-projet` |
| **les deux écrans de paiement réussi** (langues et domaines d'étude) | |
| tunnel de paiement de bout en bout | |

Les deux parcours d'achat vont donc jusqu'au bout : `/langues/[slug]/paiement-reussi`
pour les langues, `/paiement-reussi` pour les domaines d'étude.
